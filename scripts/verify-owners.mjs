#!/usr/bin/env node
// Checks NEEDS_REVIEW clubs and instructors against their OWN pages and proposes promotions to ACTIVE.
//
//   node scripts/verify-owners.mjs [--limit=60] [--step=N] [--out-dir=data/inbox/verify-<stamp>] [--dry-run]
//
// A club or teacher is proposed only when a page on its own site (home page plus up to three pages named about / class / lesson /
// learn / play / event / schedule) says, in a line of its own words, that it teaches or plays American mahjong or follows the
// National Mah Jongg League (NMJL) card or rules. Platform boilerplate (Bam Good Time) does not count; a page that talks mostly
// about another style (riichi, Hong Kong, Chinese ...) and never says NMJL does not count either.
// Owners listed in data/promote-skip.txt (city slugs and owner names we held back on purpose: private homes, wrong metro ...) are skipped.
//
// Writes <out-dir>/promote.json: [{type, slug, name, city, state, evidence, url}]. scripts/auto-import.mjs turns each into
//   UPDATE ... SET status = 'ACTIVE'   (and activates that owner's upcoming sessions that already have a time and a named venue).
// Never writes to the database. Exit code 3 = nothing to propose.

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { arg, today, q, get, lines, OTHER_STYLES } from "./lib/crawl-lib.mjs";

const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const outDir = arg("out-dir") ?? `data/inbox/verify-${stamp}`;
const limit = Number(arg("limit") ?? 60);
const only = arg("only") ? new Set(arg("only").split("|").map((x) => x.trim().toLowerCase())) : null; // slugs, for a targeted re-run
const dry = process.argv.includes("--dry-run");
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const skipList = existsSync("data/promote-skip.txt")
  ? readFileSync("data/promote-skip.txt", "utf8").split("\n").map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith("#"))
  : [];
const skipped = (o) => skipList.some((s) => s === o.citySlug || s === norm(o.name) || s === `${o.citySlug}/${norm(o.name)}`);

const DIRECTORY = /bamgoodtime\.com\/(clubs|mahjong-clubs)|bambuddies|orderofthetile|mahjonggmaven|mahjong4friends|americanmahjonggassociation|wherethewindsblow|facebook\.com|instagram\.com|tiktok|youtube|google\.|linktr\.ee|eventbrite|meetup\.com|calendly|bookwhen/i;
const siteOf = (o) => [o.website, o.sourceUrl].find((u) => u && /^https?:\/\//.test(u) && !DIRECTORY.test(u));

const rows = [
  ...q(`SELECT x.id, x.slug, x.name, x.website, x.sourceUrl, c.name AS city, c.state, c.slug AS citySlug FROM Club x JOIN City c ON c.id = x.cityId WHERE x.status = 'NEEDS_REVIEW'`).map((o) => ({ ...o, type: "club" })),
  ...q(`SELECT x.id, x.slug, x.name, x.website, x.sourceUrl, c.name AS city, c.state, c.slug AS citySlug FROM Instructor x JOIN City c ON c.id = x.cityId WHERE x.status = 'NEEDS_REVIEW'`).map((o) => ({ ...o, type: "instructor" })),
].filter((o) => siteOf(o) && !skipped(o) && (!only || only.has(o.slug.toLowerCase()))).sort((a, b) => a.slug.localeCompare(b.slug));

// each run takes its own slice, so a full pass happens over several runs
const step = Number(arg("step") ?? Math.floor(Date.parse(today) / 864e5));
const start = rows.length ? (step * limit) % rows.length : 0;
const todays = [...rows, ...rows].slice(start, start + Math.min(limit, rows.length));

const AMERICAN = /\bamerican\b.{0,50}\bmah[\s-]?jong+g?\b|\bmah[\s-]?jong+g?\b.{0,50}\bamerican\b|\bnmj?l\b|\bnational mah[\s-]?jong+g?\s+league\b|\bamerican[\s-]style\b/i;
const BOILERPLATE = /bam good time|bamgoodtime|find your club|start a club|powered by|all rights reserved|cookie|black american/i;
const SUBPAGE = /href="([^"#?]*(?:about|class|lesson|learn|play|event|schedule|faq|rules)[^"#?]*)"/gi;

async function evidenceFor(o) {
  const base = siteOf(o);
  const origin = new URL(base).origin;
  const seen = new Set();
  const pagesToRead = [base];
  let best = null, other = 0, american = 0, mentionsNmjl = false;
  for (let i = 0; i < pagesToRead.length && i < 4; i++) {
    const u = pagesToRead[i];
    if (seen.has(u)) continue;
    seen.add(u);
    let html;
    try { html = await get(u); } catch { continue; }
    if (i === 0) {
      for (const m of html.matchAll(SUBPAGE)) {
        let t; try { t = new URL(m[1], u).toString(); } catch { continue; }
        if (t.startsWith(origin) && !seen.has(t) && !pagesToRead.includes(t) && !/\.(jpe?g|png|gif|pdf|css|js|ics)(\?|$)/i.test(t) && pagesToRead.length < 4) pagesToRead.push(t);
      }
    }
    for (const l of lines(html)) {
      if (l.length > 320 || BOILERPLATE.test(l)) continue;
      if (AMERICAN.test(l)) { american++; if (/\bnmj?l\b|national mah/i.test(l)) mentionsNmjl = true; if (!best || (!/nmj?l|national/i.test(best.line) && /nmj?l|national/i.test(l))) best = { line: l, url: u }; }
      if (OTHER_STYLES.test(l)) other++;
    }
  }
  if (!best) return null;
  if (other > american * 2 && !mentionsNmjl) return null; // mostly another style
  return best;
}

const found = [];
let checked = 0;
for (const o of todays) {
  const ev = await evidenceFor(o).catch(() => null);
  checked++;
  if (ev) found.push({ type: o.type, slug: o.slug, name: o.name, city: o.city, state: o.state, evidence: ev.line.slice(0, 240), url: ev.url });
}
console.log(`# Owner verification ${today}\n\n- Owners with a readable own site: ${rows.length}; checked now: ${checked}\n- Proposed promotions: ${found.length}${found.length ? "\n" + found.map((f) => `  - ${f.name} (${f.city}, ${f.state}) [${f.type}]: "${f.evidence.slice(0, 140)}" ${f.url}`).join("\n") : ""}`);
if (found.length === 0) process.exit(3);
if (!dry) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/promote.json`, JSON.stringify(found, null, 1) + "\n");
  console.log(`- Output: ${outDir}`);
}
process.exit(0);
