#!/usr/bin/env node
// Builds tonight's research prompt for the external server from
// prompts/city-research.md (rules and CSV format) plus the live database:
//   - events mode: published cities about to fall under the 5-row rule get a
//     refresh of upcoming dated events
//   - cities mode: the next cities from data/city-queue.txt that are not on the
//     site yet
// Events mode wins when a city is at risk, except every third night (day of
// year divisible by 3), which is reserved for a new city so growth never stops.
//
//   node scripts/build-nightly-prompt.mjs --out=prompt.md [--mode=events|cities]
//        [--today=YYYY-MM-DD]
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
if (forced && !["events", "cities"].includes(forced)) { console.error("--mode must be events or cities"); process.exit(2); }

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

let mode = forced;
if (!mode) {
  const cityNight = dayOfYear % 3 === 0;
  if (atRisk.length && !(cityNight && queue.length)) mode = "events";
  else if (queue.length) mode = "cities";
  else if (atRisk.length) mode = "events";
}
if (!mode || (mode === "events" && !atRisk.length) || (mode === "cities" && !queue.length)) {
  console.log(`# Nightly research ${today}\n\nNothing to do (at-risk cities: ${atRisk.length}, queue: ${queue.length}).`);
  process.exit(3);
}

let targets, existing = "", modeText, focus;
const fmt = (rows, fn) => (rows.length ? rows.map(fn).join("\n") : "- (none)");
if (mode === "events") {
  const picked = atRisk.slice(0, 4);
  targets = picked.map((x) => `- ${x.c.name}, ${x.c.state}`).join("\n");
  for (const x of picked) {
    const r = rowsOf(x.c);
    existing += `### ${x.c.name}, ${x.c.state}  (ACTIVE ${x.n} 行。うち14日以内に終わるイベント ${x.soon} 件)\nClubs:\n${fmt(r.clubs, (y) => `- ${y.name} [${y.status}]`)}\nInstructors:\n${fmt(r.ins, (y) => `- ${y.name} [${y.status}]`)}\nUpcoming events:\n${fmt(r.ev, (y) => `- ${y.name} on ${y.eventDate.slice(0, 10)} [${y.status}]`)}\n\n`;
  }
  modeText = `## 今夜のモード: イベント更新

すでに掲載している都市のイベントが間もなく終わり、ページの掲載数が基準を下回りそうなので、**今後の日付つきイベントを追加する**のが今夜の主な仕事。
新しい団体を探すことが目的ではない(見つかれば送ってよい)。以降の項目と食い違う場合は、この節を優先する(例: 都市あたりの行数目標は気にしなくてよい)。

- 下の「すでにサイトにある行」の団体・講師の公式サイト・カレンダー・イベントページを開き、今日(${today})以降で、日付・時刻・会場・登録ページのあるイベントを探す。
- events.csv の \`club_name\` / \`instructor_name\` は、一覧にある名前と**完全に同じ**にする(clubs.csv / instructors.csv に同じ行を入れ直さなくてよい)。
- 別の団体・講師が主催のイベントは、\`club_name\` と \`instructor_name\` を空にして、会場を \`venue\` に書く。
- すでに登録済みの日付のイベントは送らない。
- 一覧のイベントのうち、中止・終了・移転が分かったものは、CSV には入れず report.md の「消えた情報」に、名前と日付と根拠 URL を書く。
- 日付つきのイベントが見つからない都市は、CSV を作らず report.md にだけ、調べた情報源を書く。`;
  focus = picked.map((x) => `- ${x.c.name}: 公式カレンダーから、${today} 以降のイベントを探す。いま ACTIVE ${x.n} 行のうち ${x.soon} 件が14日以内に終わる。`).join("\n");
} else {
  const picked = queueOrdered.slice(0, 2);
  targets = picked.map((l) => `- ${l}`).join("\n");
  existing = picked.map((l) => `### ${l}\nまだサイトに掲載がない新規の都市。既存の行はない。\n`).join("\n");
  modeText = `## 今夜のモード: 新規都市

サイトにまだ掲載がない都市を調べる。**1都市あたり ACTIVE 7〜8 行(最低5行)**を目標に、クラブ・講師・今後のイベントを探す。
5行に届かなければ、足りない分と調べた情報源を report.md に書く(その場合も、確認できた行は送ってよい)。`;
  focus = `- 見つけたら events.csv に今後の日付つきイベントを必ず入れる(公開基準を満たすには日付つきの行が重要)。
- 初回の一般検索で足りなければ、JCC・シナゴーグ・シニアセンター・図書館・地元誌のイベント欄も探す。`;
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

console.log(`# Nightly research ${today}\n\n- Mode: **${mode}**\n- Cities: ${targets.replace(/^- /gm, "").split("\n").join("; ")}\n- At-risk published cities: ${atRisk.length} (${atRisk.slice(0, 6).map((x) => `${x.c.name} ${x.n}→${x.after}`).join(", ")})\n- City queue left: ${queue.length}\n- Prompt: ${s.length} characters`);
