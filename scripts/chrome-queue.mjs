#!/usr/bin/env node
// Groups that can only be checked in a logged-in Chrome (Facebook / Instagram pages, login walls) are marked here, to be read later with the
// prompts in docs/browser-prompts/ (the AI server cannot open those pages).
//
// Sources, merged and de-duplicated:
//   1. NEEDS_REVIEW clubs / teachers in the database whose only own address is a Facebook or Instagram page
//   2. lines under "## Chrome調査が必要" in the research server's report.md files (data/inbox/*/<city>/report.md), written
//      as   - <name exactly as listed> | <club|instructor> | <City, ST> | <URL> | <why>
// Rows already ACTIVE / INACTIVE are dropped, and so are names already put to a Chrome window (any docs/browser-prompts/*.md table),
// unless --include-asked is given.
//
//   node scripts/chrome-queue.mjs                 # prints the queue as Markdown (counts first)
//   node scripts/chrome-queue.mjs --prompt=docs/browser-prompts/11-facebook-instagram-queue.md [--max=30] [--include-asked]
//
// Needs the local D1 (`npx wrangler d1 migrations apply DB --local`).
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { q, arg } from "./lib/crawl-lib.mjs";

const SOCIAL = /facebook\.com|instagram\.com|fb\.me|fb\.com/i;
const MAX = Number(arg("max") ?? 30);
const includeAsked = process.argv.includes("--include-asked");
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const cities = new Map(q(`SELECT id, name, state FROM City`).map((c) => [c.id, c]));
const owners = [
  ...q(`SELECT name, cityId, website, sourceUrl, status, description FROM Club`).map((o) => ({ ...o, type: "club" })),
  ...q(`SELECT name, cityId, website, sourceUrl, status, notes AS description FROM Instructor`).map((o) => ({ ...o, type: "instructor" })),
];
const byName = new Map(owners.map((o) => [`${o.type}|${norm(o.name)}|${cities.get(o.cityId)?.name}`, o]));

const rows = new Map(); // key -> row
const add = (r) => { const k = `${r.type}|${norm(r.name)}|${norm(r.city)}`; if (!rows.has(k)) rows.set(k, r); };

// 1. database
for (const o of owners) {
  if (o.status !== "NEEDS_REVIEW") continue;
  const own = [o.website, o.sourceUrl].filter((u) => u && /^https?:\/\//.test(u));
  const social = own.find((u) => SOCIAL.test(u));
  // "only" Facebook / Instagram: no other own address besides directories
  const DIRECTORY = /bamgoodtime\.com\/(clubs|mahjong-clubs)|bambuddies|mahjonggmaven|mahjong4friends|orderofthetile|americanmahjonggassociation/i;
  const other = own.filter((u) => !SOCIAL.test(u) && !DIRECTORY.test(u));
  if (!social || other.length) continue;
  const c = cities.get(o.cityId);
  add({ name: o.name, type: o.type, city: c?.name ?? "", state: c?.state ?? "", url: social, why: "own page is Facebook / Instagram", from: "database" });
}

// 2. reports and the hand-kept list (data/chrome-queue.txt, same line format)
const parseLines = (lines, from) => {
  for (const line of lines.filter((l) => /^\s*-\s+/.test(l))) {
    const [name, type, place, url, why] = line.replace(/^\s*-\s+/, "").split("|").map((x) => x.trim());
    if (!name || !/^(club|instructor)$/i.test(type ?? "")) continue;
    const [city, state] = (place ?? "").split(",").map((x) => x.trim());
    add({ name, type: type.toLowerCase(), city: city ?? "", state: state ?? "", url: url ?? "", why: why ?? "login wall / Facebook / Instagram only", from });
  }
};
const sectionOf = (text) => {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => /^##\s*Chrome調査が必要/.test(l));
  if (i < 0) return [];
  const rest = lines.slice(i + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return end < 0 ? rest : rest.slice(0, end);
};
if (existsSync("data/inbox")) {
  for (const run of readdirSync("data/inbox")) {
    for (const d of readdirSync(`data/inbox/${run}`, { withFileTypes: true }).filter((x) => x.isDirectory())) {
      const f = `data/inbox/${run}/${d.name}/report.md`;
      if (existsSync(f)) parseLines(sectionOf(readFileSync(f, "utf8")), `${run}/${d.name}`);
    }
  }
}
if (existsSync("data/chrome-queue.txt")) parseLines(readFileSync("data/chrome-queue.txt", "utf8").split("\n").filter((l) => !l.trim().startsWith("#")), "data/chrome-queue.txt");

// drop what is settled or already asked
const asked = new Set();
if (existsSync("docs/browser-prompts")) {
  for (const f of readdirSync("docs/browser-prompts").filter((x) => /^\d.*\.md$/.test(x))) {
    for (const line of readFileSync(`docs/browser-prompts/${f}`, "utf8").split("\n")) {
      const cells = line.split("|").map((x) => x.trim());
      if (cells.length > 5 && /^\d+$/.test(cells[1]) && /^(club|instructor)$/.test(cells[2])) asked.add(`${cells[2]}|${norm(cells[3])}`);
    }
  }
}
let queue = [...rows.values()].filter((r) => {
  const o = byName.get(`${r.type}|${norm(r.name)}|${r.city}`) ?? owners.find((x) => x.type === r.type && norm(x.name) === norm(r.name));
  if (o && o.status !== "NEEDS_REVIEW") return false;
  return includeAsked || !asked.has(`${r.type}|${norm(r.name)}`);
});
queue.sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
console.log(`# Chrome queue\n\n- ${queue.length} groups (${[...rows.values()].length} found, ${asked.size} names already put to a Chrome window${includeAsked ? ", included" : ", left out"})\n`);
console.log(`| # | type | name | city | state | url | why | from |\n|---|---|---|---|---|---|---|---|`);
queue.forEach((r, i) => console.log(`| ${i + 1} | ${r.type} | ${r.name} | ${r.city} | ${r.state} | ${r.url} | ${r.why} | ${r.from} |`));

const out = arg("prompt");
if (out) {
  const src = readFileSync("docs/browser-prompts/08-florida-east-coast.md", "utf8");
  const head = src.slice(0, src.indexOf("# 今回のリスト"));
  const take = queue.slice(0, MAX);
  let t = `# 今回のリスト(Facebook / Instagram など、Chrome でしか読めない団体。${take.length} 件)\nこれらの団体は、自動の調査では自分のページを読めなかった(Facebook / Instagram のページ、ログイン壁)ものです。**どの団体も、まだ American / NMJL かどうかを確認できていません**。ログイン済みの Facebook / Instagram で、団体自身のページ(About・イベント・直近の投稿)を読み、American / NMJL の一文を引用し、今日以降のセッションを探してください。\n\n## すでに掲載済み(同じものは DUPLICATE と答える)\n- 下の団体が、すでにサイトの別の行と同じ団体のときは DUPLICATE。\n\n| # | type | name_exact | city | state | 既知のURL | 手がかり |\n|---|---|---|---|---|---|---|\n`;
  take.forEach((r, i) => { t += `| ${i + 1} | ${r.type} | ${r.name} | ${r.city} | ${r.state} | ${r.url || "-"} | ${r.why} |\n`; });
  writeFileSync(out, head + t);
  console.error(`wrote ${out} (${take.length} of ${queue.length})`);
}
