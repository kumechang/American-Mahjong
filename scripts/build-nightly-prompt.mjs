#!/usr/bin/env node
// Builds tonight's research prompt for the external AI server from
// prompts/city-research.md (rules and CSV format) plus the live database.
//
// The daily crawlers (scripts/crawl-events.mjs, scripts/discover-clubs.mjs) collect dates and
// leads cheaply; the AI is for judgment. Modes, over a week:
//   - find: owners only a directory knows (no page of their own): find the page, quote American / NMJL
//   - verify (3 of 8 runs a day): groups the crawlers left as NEEDS_REVIEW, in the cities closest to
//     publishing: confirm American / NMJL on the group's own pages and promote to ACTIVE
//   - cities (2 nights): a place not on the site yet (leads from the directory crawler first,
//     then data/city-queue.txt), looking outside the platforms the crawlers read
//   - events (1 night): at-risk published cities, only groups the crawlers cannot read
// A mode with nothing to do is skipped in favour of the next one in the week.
//
//   node scripts/build-nightly-prompt.mjs --out=prompt.md [--mode=verify|cities|events] [--today=YYYY-MM-DD]
//
// Prints a Markdown summary to stdout. Exit code 3 = nothing to do tonight.
// Run `npx wrangler d1 migrations apply DB --local` first.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const out = arg("out");
const forced = arg("mode");
const today = arg("today") ?? new Date().toISOString().slice(0, 10);
if (!out) { console.error("--out=FILE is required"); process.exit(2); }
if (forced && !["verify", "find", "events", "cities"].includes(forced)) { console.error("--mode must be verify, find, events or cities"); process.exit(2); }

const q = (sql) =>
  JSON.parse(
    execFileSync("npx", ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command", sql], { encoding: "utf8", maxBuffer: 50e6 }).replace(/^[^[]*/, ""),
  )[0].results;

const MIN_ROWS = 5;
const SOON = new Date(Date.parse(today) + 14 * 864e5).toISOString().slice(0, 10);

const cities = q(`SELECT id, slug, name, state, published FROM City ORDER BY name`);
const clubs = q(`SELECT cityId, name, status FROM Club ORDER BY status, name`);
const ins = q(`SELECT cityId, name, status FROM Instructor ORDER BY status, name`);
const ev = q(`SELECT cityId, name, eventDate, status FROM Event WHERE eventDate >= '${today} 00:00:00' ORDER BY eventDate, name`);

const rowsOf = (c) => ({
  clubs: clubs.filter((r) => r.cityId === c.id),
  ins: ins.filter((r) => r.cityId === c.id),
  ev: ev.filter((r) => r.cityId === c.id),
});
const stats = (c) => {
  const r = rowsOf(c);
  const act = (l) => l.filter((x) => x.status === "ACTIVE");
  const n = act(r.clubs).length + act(r.ins).length + act(r.ev).length;
  const soon = act(r.ev).filter((e) => e.eventDate.slice(0, 10) <= SOON).length;
  return { n, soon, after: n - soon };
};

// Cities the server already looked at in the last few days (folders in data/inbox/<date-time>/<slug>/)
// go to the back of the line, so one stubborn city doesn't take the slot every night.
// The server sometimes nests the folder (data/inbox/<run>/data/inbox/<run>/<city>/...): read through that too, or those towns never rest.
const runBase = (run) => (existsSync(`data/inbox/${run}/data/inbox/${run}`) ? `data/inbox/${run}/data/inbox/${run}` : `data/inbox/${run}`);
const RECENT_DAYS = 3;
const recent = new Set();
if (existsSync("data/inbox")) {
  for (const run of readdirSync("data/inbox")) {
    const m = run.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!m || (Date.parse(today) - Date.parse(m[1])) / 864e5 >= RECENT_DAYS) continue;
    for (const slug of readdirSync(runBase(run))) recent.add(slug);
  }
}
// A place the server has visited rests, so one town does not take the slot night after night (Kaka'ako, Moiliili and UH Manoa came back
// eight times in a week). After a visit that produced nothing (a report but no CSV) it rests COOLDOWN_DAYS; after one that produced rows
// it rests RESULT_REST_DAYS, long enough for the result to be imported (once imported the city is on the site and drops out of the queue anyway).
// The folders come from main plus, in the nightly workflow, from the branches of PRs still open.
const COOLDOWN_DAYS = 14;
const RESULT_REST_DAYS = 5;
const cooldown = new Set();
if (existsSync("data/inbox")) {
  for (const run of readdirSync("data/inbox").filter((d) => /^\d{4}-\d{2}-\d{2}-\d{4}$/.test(d)).sort()) {
    const age = (Date.parse(today) - Date.parse(run.slice(0, 10))) / 864e5;
    for (const slug of readdirSync(runBase(run), { withFileTypes: true }).filter((x) => x.isDirectory()).map((x) => x.name)) {
      const files = readdirSync(`${runBase(run)}/${slug}`);
      const gotRows = files.some((f) => /^(clubs|instructors|events)\.csv$/.test(f));
      if (age < (gotRows ? RESULT_REST_DAYS : COOLDOWN_DAYS)) cooldown.add(slug);
    }
  }
}
const slugOf = (name) => name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/['\u2019\u02bb\u02bc`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Cities whose pages get many Search Console impressions at a poor position (data/seo-priority-cities.txt): researched first, after at-risk cities.
const seoPriority = new Set(
  existsSync("data/seo-priority-cities.txt")
    ? readFileSync("data/seo-priority-cities.txt", "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
    : [],
);

const atRiskAll = cities
  .filter((c) => c.published)
  .map((c) => ({ c, ...stats(c) }))
  .filter((x) => x.after < MIN_ROWS)
  .sort((a, b) => a.after - b.after || b.soon - a.soon);
const atRisk = [...atRiskAll.filter((x) => !recent.has(x.c.slug)), ...atRiskAll.filter((x) => recent.has(x.c.slug))];

const known = new Set(cities.map((c) => `${c.name}, ${c.state}`.toLowerCase()));
const queue = readFileSync("data/city-queue.txt", "utf8")
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  .filter((l) => !known.has(l.toLowerCase()));
const queueFresh = queue.filter((l) => !recent.has(slugOf(l.split(",")[0])) && !cooldown.has(slugOf(l.split(",")[0])));
const queueOrdered = [...queueFresh, ...queue.filter((l) => !queueFresh.includes(l) && !cooldown.has(slugOf(l.split(",")[0])))];

// ---------- owners with their links (for verification and for "which ones does the crawler already read") ----------
const owners = [
  ...q(`SELECT id, cityId, name, website, sourceUrl, status, description FROM Club`).map((o) => ({ ...o, type: "club" })),
  ...q(`SELECT id, cityId, name, website, sourceUrl, status, notes AS description FROM Instructor`).map((o) => ({ ...o, type: "instructor" })),
];
const pendingEvents = new Map(); // owner key -> NEEDS_REVIEW upcoming events
for (const e of q(`SELECT clubId, instructorId FROM Event WHERE status='NEEDS_REVIEW' AND eventDate >= '${today} 00:00:00'`)) {
  const k = e.clubId ? `club:${e.clubId}` : e.instructorId ? `instructor:${e.instructorId}` : null;
  if (k) pendingEvents.set(k, (pendingEvents.get(k) ?? 0) + 1);
}
const DIRECTORY_ONLY = /bamgoodtime\.com\/(clubs|mahjong-clubs)|bambuddies\.org|mahjonggmaven\.com|mahjong4friends\.com|americanmahjonggassociation\.com|orderofthetile|facebook\.com|instagram\.com/i;
const ownUrl = (o) => [o.website, o.sourceUrl].find((u) => u && /^https?:\/\//.test(u) && !DIRECTORY_ONLY.test(u)) ?? null;
// Something the server can actually work with: the owner's own site, or a Bam Good Time page that shows dated sessions or American wording.
// A Bam Good Time page with no sessions and no wording has nothing to read; it goes to the outreach list instead.
const hasOwnSite = (o) => [o.website, o.sourceUrl].some((u) => u && /^https?:\/\//.test(u) && !DIRECTORY_ONLY.test(u) && !/\.bamgoodtime\.com/.test(u));
const workable = (o) => Boolean(ownUrl(o)) && (hasOwnSite(o) || (pendingEvents.get(`${o.type}:${o.id}`) ?? 0) > 0 || /american|nmjl|national mah/i.test((o.description ?? "").replace(/American\/NMJL not stated[^.]*\./gi, "")));
// the daily crawler already reads these (see scripts/crawl-events.mjs)
const crawlerPlatform = (o) => {
  const u = [o.website, o.sourceUrl].filter(Boolean).join(" ");
  return /\.bamgoodtime\.com/.test(u) ? "Bam Good Time" : /bookwhen\.com/.test(u) ? "Bookwhen" : /eventbrite\./.test(u) ? "Eventbrite" : /calendly\.com|linktr\.ee/.test(u) ? "Calendly/Linktree" : /meetup\.com/.test(u) ? "Meetup" : null;
};

// ---------- verification candidates: the cities closest to publishing with NEEDS_REVIEW groups to confirm ----------
const verifyAll = cities
  .map((c) => {
    const act = stats(c).n;
    const review = owners.filter((o) => o.cityId === c.id && o.status === "NEEDS_REVIEW" && workable(o));
    const unreadable = owners.filter((o) => o.cityId === c.id && o.status === "NEEDS_REVIEW" && ownUrl(o) && !workable(o));
    return { c, act, review, unreadable };
  })
  .filter((x) => x.act < MIN_ROWS || atRiskAll.some((r) => r.c.id === x.c.id) || seoPriority.has(x.c.slug))
  .filter((x) => x.review.length > 0 || x.unreadable.length > 0)
  .map((x) => {
    // confirming a group also lets its dated sessions go ACTIVE, so they count towards the five rows
    const dated = x.review.reduce((n, o) => n + (pendingEvents.get(`${o.type}:${o.id}`) ?? 0), 0);
    return { ...x, dated, reachable: x.act + Math.min(x.review.length + dated, MIN_ROWS) >= MIN_ROWS };
  })
  // 1) published cities about to fall under five rows, 2) the rest; inside each: ones that can reach five, then most dated sessions waiting
  .map((x) => ({ ...x, atRisk: Boolean(x.c.published) && atRiskAll.some((r) => r.c.id === x.c.id) }))
  .sort((a, b) => Number(b.atRisk) - Number(a.atRisk) || Number(seoPriority.has(b.c.slug)) - Number(seoPriority.has(a.c.slug)) || Number(b.reachable) - Number(a.reachable) || b.dated - a.dated || b.act - a.act || b.review.length - a.review.length);
const verifiable = verifyAll.filter((x) => x.review.length > 0 && !cooldown.has(x.c.slug));
const verifyQueue = [...verifiable.filter((x) => !recent.has(x.c.slug)), ...verifiable.filter((x) => recent.has(x.c.slug))];
// Owners the server cannot learn anything from (a Bam Good Time page with no sessions and no American wording): ask the owner instead.
const outreach = verifyAll.flatMap((x) => x.unreadable.map((o) => `${x.c.name}, ${x.c.state}: ${o.name} ${ownUrl(o)}`));

// ---------- find queue: NEEDS_REVIEW owners that only a directory knows (no page of their own, 650-odd clubs and most teachers) ----------
// The server cannot "verify" what has no address, so it is asked to find the owner's own page by searching name + town. Cities closest to
// publishing come first: published ones about to fall under five rows, then cities with 2-4 active rows, then the rest by number of leads.
const FIND_OWNERS = 8, FIND_PER_CITY = 4;
const findByCity = cities
  .map((c) => {
    const act = stats(c).n;
    const leads = owners.filter((o) => o.cityId === c.id && o.status === "NEEDS_REVIEW" && !ownUrl(o));
    return { c, act, leads, atRisk: Boolean(c.published) && atRiskAll.some((r) => r.c.id === c.id) };
  })
  .filter((x) => x.leads.length > 0 && !cooldown.has(x.c.slug))
  .sort((a, b) => Number(b.atRisk) - Number(a.atRisk) || Number(seoPriority.has(b.c.slug)) - Number(seoPriority.has(a.c.slug)) || Number(b.act >= 2 && b.act < MIN_ROWS) - Number(a.act >= 2 && a.act < MIN_ROWS) || b.act - a.act || b.leads.length - a.leads.length);
const findQueue = [...findByCity.filter((x) => !recent.has(x.c.slug)), ...findByCity.filter((x) => recent.has(x.c.slug))];

// ---------- discovery leads: places the directory crawler found whose club says it plays American mahjong ----------
function parseCsv(text) {
  const rows = []; let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') inQ = false; else cell += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  const [head, ...body] = rows;
  return body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
// a lead is skipped when its club is already in the database (a city can be filed under another name,
// e.g. Cross Roads → Little Elm) or when the state is not one of the 50 states or DC (Canada is out of scope)
const US_STATES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return null; } };
const ownedHosts = new Set(owners.flatMap((o) => [o.website, o.sourceUrl].map(hostOf)).filter((h) => h && !DIRECTORY_ONLY.test(h)));
const leadPlaces = new Map(); // "City, ST" -> leads
if (existsSync("data/inbox")) {
  for (const run of readdirSync("data/inbox").filter((d) => d.startsWith("discover-"))) {
    for (const dir of readdirSync(`data/inbox/${run}`)) {
      for (const file of ["clubs.csv", "instructors.csv"]) {
        const f = `data/inbox/${run}/${dir}/${file}`;
        if (!existsSync(f)) continue;
        for (const r of parseCsv(readFileSync(f, "utf8"))) {
          const key = `${r.city}, ${r.state}`;
          if (known.has(key.toLowerCase()) || !US_STATES.has(r.state)) continue;
          if (r.website && ownedHosts.has(hostOf(r.website))) continue;
          if (!leadPlaces.has(key)) leadPlaces.set(key, []);
          // directory leads: BamBuddies lists American mahjong only (no website for the group); a Mahjong 4 Friends note may mention NMJL
          const text = `${r.description ?? ""} ${r.notes ?? ""}`;
          const directory = /BamBuddies|Mahjong 4 Friends/.test(text);
          leadPlaces.get(key).push({
            name: r.name,
            website: r.website,
            american: /Site says:|BamBuddies|Directory note:/.test(text),
            note: directory ? (r.schedule || (text.match(/Directory note: "([^"]*)/) ?? [])[1] || "") : "",
          });
        }
      }
    }
  }
}
// Best first: places whose leads say American most often, then the ones with the most leads (a town with one lead comes last).
const leadQueue = [...leadPlaces.entries()]
  .filter(([k, l]) => l.some((x) => x.american) && !cooldown.has(slugOf(k.split(",")[0])))
  .sort((a, b) => b[1].filter((x) => x.american).length - a[1].filter((x) => x.american).length || b[1].length - a[1].length)
  .map(([k]) => k);
const explore = [...leadQueue, ...queueOrdered].filter((k, i, all) => all.indexOf(k) === i);

// ---------- today's mode ----------
// The workflow runs about eight times a day (every three hours), so the mode follows the run, not the date: a day used to be one mode, and
// all eight runs asked for the same towns. Eight slots: three nights of verification (the owner has a page of its own: confirm American / NMJL),
// two of finding the page of owners that only a directory knows, two exploring places not on the site yet, one for events the crawlers cannot read.
// A slot with nothing to do hands over to the next one. (scripts/verify-owners.mjs also checks the owner's own page without the AI.)
const SLOTS = ["verify", "find", "cities", "verify", "find", "cities", "events", "verify"];
const slot = Number(arg("slot") ?? Math.floor(new Date().getUTCHours() / 3)) % SLOTS.length;
const has = { verify: verifyQueue.length > 0, find: findQueue.length > 0, cities: explore.length > 0, events: atRisk.length > 0 };
let mode = forced;
if (!mode) {
  for (let i = 0; i < SLOTS.length && !mode; i++) {
    const m = SLOTS[(slot + i) % SLOTS.length];
    if (has[m]) mode = m;
  }
}
if (!mode || !has[mode]) {
  console.log(`# Nightly research ${today}\n\nNothing to do (verify: ${verifyQueue.length}, find: ${findQueue.length}, cities: ${explore.length}, at-risk: ${atRisk.length}).`);
  process.exit(3);
}

let targets, existing = "", modeText, focus;
const fmt = (rows, fn) => (rows.length ? rows.map(fn).join("\n") : "- (none)");
if (mode === "verify") {
  const picked = verifyQueue.slice(0, 3);
  targets = picked.map((x) => `- ${x.c.name}, ${x.c.state}`).join("\n");
  for (const x of picked) {
    const act = owners.filter((o) => o.cityId === x.c.id && o.status === "ACTIVE");
    existing += `### ${x.c.name}, ${x.c.state}  (ACTIVE ${x.act} 行。公開には5行必要${x.c.published ? "。公開中だが基準を割りそう" : ""})\nすでに ACTIVE(再送しない):\n${fmt(act, (o) => `- ${o.name} [${o.type}]`)}\n確認してほしい団体・講師(いまは NEEDS_REVIEW):\n${fmt(x.review.slice(0, 10), (o) => `- ${o.name} [${o.type}] ${ownUrl(o)}${pendingEvents.get(`${o.type}:${o.id}`) ? `(日付つきの行が ${pendingEvents.get(`${o.type}:${o.id}`)} 件、確認待ち)` : ""}`)}\n\n`;
  }
  modeText = `## 今夜のモード: 確認(NEEDS_REVIEW を確かめる)

自動の巡回プログラムが見つけた団体・講師が、「American Mahjong(NMJL)かどうか」「実際に参加できるか」を確認できないまま、非公開(NEEDS_REVIEW)で残っている。**今夜の仕事は、それを確かめること**。新しい団体を探すことが目的ではない。以降の項目と食い違う場合は、この節を優先する。

下の各団体・講師について、**その団体自身の公式ページ**(リンク先とそのサイト内のページ)を開いて、次を確かめる。
1. American / NMJL / National Mah Jongg League の**明記**があるか(ある場合はその一文を、そのまま引用する)。「mahjong」とだけ書いてあるものは確認できたことにしない。
2. 実際に参加できるか(会員限定でない、閉鎖していない、今も活動している)。
3. 今後の日付・時刻・会場のあるセッションがあるか。

結果の送り方:
- **確認できた**: clubs.csv か instructors.csv に、**一覧と完全に同じ name** で、status を \`ACTIVE\` にして送る。description / notes に、引用した一文を書く。見つけた今後のイベントは events.csv に入れる(club_name / instructor_name は一覧と同じ)。
- **別の種類・閉鎖・会員限定と分かった**: 同じ name で \`INACTIVE\` にして送り、理由を report.md に書く。
- **確認できなかった**: CSV には入れず、report.md の「確認できなかったこと」に、調べたページと、足りない情報を書く(問い合わせが必要なものはそう書く)。
- **Facebook / Instagram だけ、またはログインが必要で読めない**: 上と同じく、report.md に \`## Chrome調査が必要\` という見出しをつくり、1 団体 1 行で \`- 一覧と完全に同じ name | club か instructor | City, ST | URL | 理由\` と書く(後で人が Chrome で読む)。
推測で ACTIVE にしない。` ;
  focus = picked.map((x) => `- ${x.c.name}: いま ACTIVE ${x.act} 行。確認待ちが ${x.review.length} 件。確認できたものが増えれば公開基準に届く。`).join("\n");
} else if (mode === "find") {
  const picked = [];
  for (const x of findQueue) {
    for (const o of x.leads.slice(0, FIND_PER_CITY)) if (picked.length < FIND_OWNERS) picked.push({ x, o });
    if (picked.length >= FIND_OWNERS) break;
  }
  const places = [...new Map(picked.map((p) => [p.x.c.id, p.x])).values()];
  targets = places.map((x) => `- ${x.c.name}, ${x.c.state}`).join("\n");
  for (const x of places) {
    const act = owners.filter((o) => o.cityId === x.c.id && o.status === "ACTIVE");
    const mine = picked.filter((p) => p.x.c.id === x.c.id).map((p) => p.o);
    existing += `### ${x.c.name}, ${x.c.state}  (ACTIVE ${x.act} 行。公開には5行必要${x.c.published ? "。公開中だが基準を割りそう" : ""})\nすでに ACTIVE(再送しない):\n${fmt(act, (o) => `- ${o.name} [${o.type}]`)}\n自分のページを探してほしい団体・講師(ディレクトリにだけ載っている):\n${fmt(mine, (o) => `- ${o.name} [${o.type}] ${(o.description ?? "").replace(/\s+/g, " ").slice(0, 200)}`)}\n\n`;
  }
  modeText = `## 今夜のモード: 自分のページを探す(ディレクトリにだけ載っている団体)

下の団体・講師は、BamBuddies、Mahjong 4 Friends、MahJongg Maven などの**ディレクトリにだけ**載っていて、団体自身のページの URL がわからないため、非公開(NEEDS_REVIEW)で止まっている。**今夜の仕事は、その団体自身のページを見つけて、American / NMJL の明記を確認すること**。新しい団体を探すことが目的ではない。以降の項目と食い違う場合は、この節を優先する。

各団体・講師について:
1. 名前と町で WebSearch して、**その団体自身のページ**を探す(公式サイト、予約ページ、会場や主催者のイベントページ、Facebook / Instagram のページ)。ディレクトリ、ニュース記事、他人のまとめページは、団体自身のページではない。
2. 見つかったページに American / NMJL / National Mah Jongg League の**明記**があれば、その一文を**一字一句そのまま**引用する。「mahjong」とだけ書いてあるものは確認できたことにしない。riichi / Hong Kong / Chinese だけのものは INACTIVE。
3. 実際に参加できるか(会員限定でない、閉鎖していない、今も活動している)、今後の日付・時刻・会場のあるセッションがあるかを確かめる。

結果の送り方:
- **確認できた**: clubs.csv か instructors.csv に、**一覧と完全に同じ name** で、status を \`ACTIVE\` にして送る。**website 列に団体自身のページの URL、source_url 列に一文が載っているページの URL** を入れ、description / notes に引用した一文を書く。見つけた今後のイベントは events.csv に入れる。
- **別の種類・閉鎖・会員限定・個人宅だけ**: 同じ name で \`INACTIVE\` にして送り、理由を report.md に書く。
- **自分のページが見つからない、または American の明記がない**: CSV には入れず、report.md の「確認できなかったこと」に、調べた検索語とページを書く。
- **見つかった自分のページが Facebook / Instagram だけ、またはログインが必要で読めない**: CSV には入れず、report.md に \`## Chrome調査が必要\` という見出しをつくり、1 団体 1 行で \`- 一覧と完全に同じ name | club か instructor | City, ST | 見つけたページの URL | 理由(Facebook のみ、ログイン壁 など)\` と書く(後で人が Chrome で読む。ここに書いた団体は、あとで自動的に集められる)。
推測で ACTIVE にしない。個人の電話番号・メールアドレスは書かない。` ;
  focus = places.map((x) => `- ${x.c.name}: いま ACTIVE ${x.act} 行。自分のページが見つかって確認できれば公開基準に近づく。`).join("\n");
} else if (mode === "events") {
  const picked = atRisk.slice(0, 4);
  targets = picked.map((x) => `- ${x.c.name}, ${x.c.state}`).join("\n");
  for (const x of picked) {
    const r = rowsOf(x.c);
    const mine = owners.filter((o) => o.cityId === x.c.id && o.status !== "INACTIVE");
    existing += `### ${x.c.name}, ${x.c.state}  (ACTIVE ${x.n} 行。うち14日以内に終わるイベント ${x.soon} 件)\n団体・講師(「巡回あり」は自動の巡回がすでに読んでいるので、今夜は調べなくてよい):\n${fmt(mine, (o) => `- ${o.name} [${o.type}, ${o.status}]${crawlerPlatform(o) ? ` ← 巡回あり(${crawlerPlatform(o)})` : ownUrl(o) ? ` ${ownUrl(o)}` : ""}`)}\nUpcoming events:\n${fmt(r.ev, (y) => `- ${y.name} on ${y.eventDate.slice(0, 10)} [${y.status}]`)}\n\n`;
  }
  modeText = `## 今夜のモード: 巡回が読めないイベントの更新

自動の巡回プログラムが、Bam Good Time、Bookwhen、Eventbrite、Calendly、Meetup、WordPress のカレンダーを毎日読んでいる(下の一覧で「巡回あり」と付いた団体)。**今夜は、それ以外で、日付が別の場所に出ている団体のイベントを探す**。以降の項目と食い違う場合は、この節を優先する(例: 都市あたりの行数目標は気にしなくてよい)。

- 「巡回あり」でない団体・講師の公式サイト、独自の予約システム、告知ページ、ニュースレター、PDF から、${today} 以降の、日付・時刻・会場のあるイベントを探す。
- 読めないページは、個別のイベントページを検索して試す。それでも読めなければ、report.md の「人が見る必要があるページ」に書く。
- events.csv の \`club_name\` / \`instructor_name\` は、一覧にある名前と**完全に同じ**にする。別の主催者のイベントは両方を空にして会場を \`venue\` に書く。
- すでに登録済みの日付は送らない。中止・終了が分かったものは、report.md の「消えた情報」に書く。
- 日付つきのイベントが見つからない都市は、CSV を作らず report.md にだけ書く。`;
  focus = picked.map((x) => `- ${x.c.name}: ACTIVE ${x.n} 行のうち ${x.soon} 件が14日以内に終わる。巡回のない団体を優先する。`).join("\n");
} else {
  const picked = explore.slice(0, 3);
  targets = picked.map((l) => `- ${l}`).join("\n");
  existing = picked
    .map((l) => {
      const leads = leadPlaces.get(l) ?? [];
      return `### ${l}\nまだサイトに掲載がない新規の都市。既存の行はない。${leads.length ? `\nBam Good Time の団体一覧に載っている団体(手がかり。自分のページで American / NMJL を確認すること):\n${leads.map((x) => `- ${x.name} ${x.website}${x.note ? `(BamBuddies の記載: ${x.note.slice(0, 160)}。自分のサイトを探すこと)` : x.american ? "(団体自身が American と書いている)" : ""}`).join("\n")}` : ""}\n`;
    })
    .join("\n");
  modeText = `## 今夜のモード: 新規都市

サイトにまだ掲載がない都市を調べる。**1都市あたり ACTIVE 7〜8 行(最低5行)**を目標に、クラブ・講師・今後のイベントを探す。
5行に届かなければ、足りない分と調べた情報源を report.md に書く(その場合も、確認できた行は送ってよい)。
地名が小さな町で、近くに大きな都市がある場合は、その都市圏の名前を city 列に使い、実際の町名は address / description に書く。
Bam Good Time の団体は自動の巡回がすでに見つけているので、**それ以外**(JCC、シナゴーグ、図書館、シニアセンター、公園の講座、個人講師、地元誌の告知)を重点的に探す。`;
  focus = `- 見つけたら events.csv に今後の日付つきイベントを必ず入れる(公開基準を満たすには日付つきの行が重要)。
- 一覧に手がかりの団体がある場合は、その団体自身のページを確認して、American / NMJL の一文を引用する。`;
}

let s = readFileSync("prompts/city-research.md", "utf8");
const swap = (name, text) => {
  const a = `<!-- ${name}:START -->`, b = `<!-- ${name}:END -->`;
  if (!s.includes(a) || !s.includes(b)) { console.error(`marker ${name} missing`); process.exit(2); }
  s = s.slice(0, s.indexOf(a) + a.length) + "\n" + text.trim() + "\n" + s.slice(s.indexOf(b));
};
swap("MODE", modeText);
swap("TARGETS", targets);
swap("EXISTING", existing);
swap("FOCUS", `### 今夜の重点\n\n${focus}`);
writeFileSync(out, s);

console.log(`# Nightly research ${today}\n\n- Mode: **${mode}**\n- Cities: ${targets.replace(/^- /gm, "").split("\n").join("; ")}\n- Slot: ${slot}\n- Verify queue: ${verifyQueue.length} cities; find queue: ${findQueue.length} cities; lead places: ${leadQueue.length}\n- At-risk published cities: ${atRisk.length} (${atRisk.slice(0, 6).map((x) => `${x.c.name} ${x.n}→${x.after}`).join(", ")})\n- City queue left: ${queue.length}\n- Resting after an unconfirmed night (${COOLDOWN_DAYS} days): ${[...cooldown].join(", ") || "none"}\n- Outreach candidates (nothing for the server to read; ${outreach.length}): ${outreach.slice(0, 12).join("; ") || "none"}\n- Prompt: ${s.length} characters`);
