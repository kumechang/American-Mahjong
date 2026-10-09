#!/usr/bin/env node
// Builds tonight's research prompt for the external AI server from
// prompts/city-research.md (rules and CSV format) plus the live database.
//
// The daily crawlers (scripts/crawl-events.mjs, scripts/discover-clubs.mjs) collect dates and
// leads cheaply; the AI is for judgment. Modes, over a week:
//   - verify (4 nights): groups the crawlers left as NEEDS_REVIEW, in the cities closest to
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
if (forced && !["verify", "events", "cities"].includes(forced)) { console.error("--mode must be verify, events or cities"); process.exit(2); }

const q = (sql) =>
  JSON.parse(
    execFileSync("npx", ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command", sql], { encoding: "utf8", maxBuffer: 50e6 }).replace(/^[^[]*/, ""),
  )[0].results;

const MIN_ROWS = 5;
const SOON = new Date(Date.parse(today) + 14 * 864e5).toISOString().slice(0, 10);
const dayOfYear = Math.floor((Date.parse(today) - Date.parse(today.slice(0, 4) + "-01-01")) / 864e5) + 1;

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
const RECENT_DAYS = 3;
const recent = new Set();
if (existsSync("data/inbox")) {
  for (const run of readdirSync("data/inbox")) {
    const m = run.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!m || (Date.parse(today) - Date.parse(m[1])) / 864e5 >= RECENT_DAYS) continue;
    for (const slug of readdirSync(`data/inbox/${run}`)) recent.add(slug);
  }
}
const slugOf = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
const queueFresh = queue.filter((l) => !recent.has(slugOf(l.split(",")[0])));
const queueOrdered = [...queueFresh, ...queue.filter((l) => !queueFresh.includes(l))];

// ---------- owners with their links (for verification and for "which ones does the crawler already read") ----------
const owners = [
  ...q(`SELECT id, cityId, name, website, sourceUrl, status FROM Club`).map((o) => ({ ...o, type: "club" })),
  ...q(`SELECT id, cityId, name, website, sourceUrl, status FROM Instructor`).map((o) => ({ ...o, type: "instructor" })),
];
const pendingEvents = new Map(); // owner key -> NEEDS_REVIEW upcoming events
for (const e of q(`SELECT clubId, instructorId FROM Event WHERE status='NEEDS_REVIEW' AND eventDate >= '${today} 00:00:00'`)) {
  const k = e.clubId ? `club:${e.clubId}` : e.instructorId ? `instructor:${e.instructorId}` : null;
  if (k) pendingEvents.set(k, (pendingEvents.get(k) ?? 0) + 1);
}
const DIRECTORY_ONLY = /bamgoodtime\.com\/(clubs|mahjong-clubs)|bambuddies\.org|mahjonggmaven\.com|mahjong4friends\.com|americanmahjonggassociation\.com|orderofthetile|facebook\.com|instagram\.com/i;
const ownUrl = (o) => [o.website, o.sourceUrl].find((u) => u && /^https?:\/\//.test(u) && !DIRECTORY_ONLY.test(u)) ?? null;
// the daily crawler already reads these (see scripts/crawl-events.mjs)
const crawlerPlatform = (o) => {
  const u = [o.website, o.sourceUrl].filter(Boolean).join(" ");
  return /\.bamgoodtime\.com/.test(u) ? "Bam Good Time" : /bookwhen\.com/.test(u) ? "Bookwhen" : /eventbrite\./.test(u) ? "Eventbrite" : /calendly\.com|linktr\.ee/.test(u) ? "Calendly/Linktree" : /meetup\.com/.test(u) ? "Meetup" : null;
};

// ---------- verification candidates: the cities closest to publishing with NEEDS_REVIEW groups to confirm ----------
const verifyAll = cities
  .map((c) => {
    const act = stats(c).n;
    const review = owners.filter((o) => o.cityId === c.id && o.status === "NEEDS_REVIEW" && ownUrl(o));
    return { c, act, review };
  })
  .filter((x) => x.review.length > 0 && (x.act < MIN_ROWS || atRiskAll.some((r) => r.c.id === x.c.id)))
  .map((x) => ({ ...x, reachable: x.act + Math.min(x.review.length, MIN_ROWS) >= MIN_ROWS }))
  .sort((a, b) => Number(b.reachable) - Number(a.reachable) || Number(a.c.published) - Number(b.c.published) || b.act - a.act || b.review.length - a.review.length);
const verifyQueue = [...verifyAll.filter((x) => !recent.has(x.c.slug)), ...verifyAll.filter((x) => recent.has(x.c.slug))];

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
const leadPlaces = new Map(); // "City, ST" -> leads
if (existsSync("data/inbox")) {
  for (const run of readdirSync("data/inbox").filter((d) => d.startsWith("discover-"))) {
    for (const dir of readdirSync(`data/inbox/${run}`)) {
      const f = `data/inbox/${run}/${dir}/clubs.csv`;
      if (!existsSync(f)) continue;
      for (const r of parseCsv(readFileSync(f, "utf8"))) {
        const key = `${r.city}, ${r.state}`;
        if (known.has(key.toLowerCase())) continue;
        if (!leadPlaces.has(key)) leadPlaces.set(key, []);
        leadPlaces.get(key).push({ name: r.name, website: r.website, american: /Site says:/.test(r.description) });
      }
    }
  }
}
const leadQueue = [...leadPlaces.entries()].filter(([, l]) => l.some((x) => x.american)).map(([k]) => k);
const explore = [...leadQueue, ...queueOrdered].filter((k, i, all) => all.indexOf(k) === i);

// ---------- today's mode ----------
// A week: four nights of verification (turn the crawlers' NEEDS_REVIEW rows into confirmed ones),
// two nights exploring new cities, one night for events the crawlers cannot read.
const week = ["verify", "verify", "verify", "verify", "cities", "cities", "events"];
const has = { verify: verifyQueue.length > 0, cities: explore.length > 0, events: atRisk.length > 0 };
let mode = forced;
if (!mode) {
  const start = dayOfYear % 7;
  for (let i = 0; i < 7 && !mode; i++) {
    const m = week[(start + i) % 7];
    if (has[m]) mode = m;
  }
}
if (!mode || !has[mode]) {
  console.log(`# Nightly research ${today}\n\nNothing to do (verify: ${verifyQueue.length}, cities: ${explore.length}, at-risk: ${atRisk.length}).`);
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
推測で ACTIVE にしない。` ;
  focus = picked.map((x) => `- ${x.c.name}: いま ACTIVE ${x.act} 行。確認待ちが ${x.review.length} 件。確認できたものが増えれば公開基準に届く。`).join("\n");
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
  const picked = explore.slice(0, 2);
  targets = picked.map((l) => `- ${l}`).join("\n");
  existing = picked
    .map((l) => {
      const leads = leadPlaces.get(l) ?? [];
      return `### ${l}\nまだサイトに掲載がない新規の都市。既存の行はない。${leads.length ? `\nBam Good Time の団体一覧に載っている団体(手がかり。自分のページで American / NMJL を確認すること):\n${leads.map((x) => `- ${x.name} ${x.website}${x.american ? "(団体自身が American と書いている)" : ""}`).join("\n")}` : ""}\n`;
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

console.log(`# Nightly research ${today}\n\n- Mode: **${mode}**\n- Cities: ${targets.replace(/^- /gm, "").split("\n").join("; ")}\n- Verify queue: ${verifyQueue.length} cities; lead places: ${leadQueue.length}\n- At-risk published cities: ${atRisk.length} (${atRisk.slice(0, 6).map((x) => `${x.c.name} ${x.n}→${x.after}`).join(", ")})\n- City queue left: ${queue.length}\n- Prompt: ${s.length} characters`);
