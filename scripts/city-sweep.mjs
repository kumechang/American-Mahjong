#!/usr/bin/env node
// Builds the Chrome-chat prompt that sweeps US towns for American mahjong with plain Google searches
// ("<town> <state> American mahjong", ...). The towns come from data/us-city-targets.txt, in order; towns the site already has
// (published, folded into an area page, or with five active rows) are skipped, and so are towns already put to a window
// (any docs/browser-prompts/12-city-sweep-*.md table) unless --include-asked is given.
//
//   node scripts/city-sweep.mjs                                   # prints the next batch as Markdown (counts first)
//   node scripts/city-sweep.mjs --prompt=docs/browser-prompts/12-city-sweep-02.md [--max=40] [--include-asked]
//
// Needs the local D1 (`npx wrangler d1 migrations apply DB --local`). Results come back as the CSV described in the prompt
// and are sorted with scripts/inbox-draft.mjs like any other inbox rows.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { q, arg } from "./lib/crawl-lib.mjs";

const MAX = Number(arg("max") ?? 40);
const includeAsked = process.argv.includes("--include-asked");
const key = (n, s) => `${n.toLowerCase().replace(/[’.]/g, "").replace(/^saint /, "st ").replace(/^st /, "st ")}|${s}`;

const cities = q(`SELECT c.id, c.name, c.state, c.published, c.areaId,
  (SELECT count(*) FROM Club WHERE cityId = c.id AND status = 'ACTIVE') + (SELECT count(*) FROM Instructor WHERE cityId = c.id AND status = 'ACTIVE') AS act,
  (SELECT group_concat(name, '; ') FROM (SELECT name FROM Club WHERE cityId = c.id AND status <> 'INACTIVE' UNION ALL SELECT name FROM Instructor WHERE cityId = c.id AND status <> 'INACTIVE' LIMIT 8)) AS known
  FROM City c`);
const byKey = new Map(cities.map((c) => [key(c.name, c.state), c]));

const asked = new Set();
if (existsSync("docs/browser-prompts")) {
  for (const f of readdirSync("docs/browser-prompts").filter((f) => /^12-city-sweep-.*\.md$/.test(f))) {
    for (const l of readFileSync(`docs/browser-prompts/${f}`, "utf8").split("\n")) {
      const m = l.match(/^\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*([A-Z]{2})\s*\|/);
      if (m) asked.add(key(m[1], m[2]));
    }
  }
}

const seen = new Set();
const todo = [];
let skippedCovered = 0, skippedAsked = 0;
for (const line of readFileSync("data/us-city-targets.txt", "utf8").split("\n")) {
  const m = line.trim().match(/^([^#].*), ([A-Z]{2})$/);
  if (!m) continue;
  const k = key(m[1], m[2]);
  if (seen.has(k)) continue;
  seen.add(k);
  const c = byKey.get(k);
  if (c && (c.published || c.areaId || c.act >= 5)) { skippedCovered++; continue; }
  if (asked.has(k) && !includeAsked) { skippedAsked++; continue; }
  todo.push({ name: m[1], state: m[2], status: c ? `on the site, not published (${c.act} active)` : "not on the site", known: c?.known ?? "" });
}
const batch = todo.slice(0, MAX);

const table = ["| # | town | state | on the site | already listed (answer DUPLICATE if you find the same group) |", "|---|---|---|---|---|",
  ...batch.map((t, i) => `| ${i + 1} | ${t.name} | ${t.state} | ${t.status} | ${t.known || "-"} |`)].join("\n");
console.log(`# City sweep: ${batch.length} in this batch, ${todo.length - batch.length} more waiting (${skippedCovered} towns already covered, ${skippedAsked} already asked)\n\n${table}`);

const out = arg("prompt");
if (out) {
  const tpl = readFileSync("docs/browser-prompts/12-city-sweep.template.md", "utf8");
  writeFileSync(out, tpl.replace("{{COUNT}}", String(batch.length)).replace("{{TABLE}}", table));
  console.log(`\nWrote ${out}`);
}
process.exit(0);
