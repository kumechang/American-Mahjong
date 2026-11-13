#!/usr/bin/env node
// Weekly numbers for the nightly AI research, read from the run folders in data/inbox (archived runs) and, with --branches,
// the open origin/inbox/* branches. No database, no network (except --branches).
//
//   node scripts/nightly-stats.mjs [--weeks=4] [--branches]
//
// Per ISO week (Monday start): runs, city visits, visits that sent a CSV, ACTIVE rows sent, DUPLICATE_OF lines, towns visited
// more than once in the week, and the size of the Chrome queue found in the reports. Run folders are named
// <YYYY-MM-DD-HHMM>[-suffix]; verify-/discover-/crawl- folders (no AI) are not counted.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { inboxBranchRoots } from "./lib/inbox-branches.mjs";
import { arg, parseCsv } from "./lib/crawl-lib.mjs";

const weeks = Number(arg("weeks") ?? 4);
const roots = [];
if (existsSync("data/inbox")) for (const r of readdirSync("data/inbox")) if (/^\d{4}-\d{2}-\d{2}/.test(r)) roots.push({ run: r, dir: join("data/inbox", r) });
if (process.argv.includes("--branches")) {
  roots.push(...inboxBranchRoots());
}

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) yield* walk(p); else yield p; }
}
const monday = (d) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };

const byWeek = new Map();
for (const { run, dir } of roots) {
  const week = monday(run.slice(0, 10));
  const w = byWeek.get(week) ?? { runs: new Set(), visits: 0, withCsv: 0, active: 0, dup: 0, chrome: 0, towns: new Map() };
  byWeek.set(week, w);
  w.runs.add(run);
  const folders = new Map(); // city folder -> {csv:boolean}
  for (const p of walk(dir)) {
    const f = basename(p), city = basename(dirname(p));
    if (city === basename(dir) && f !== "report.md") continue;
    if (!folders.has(city)) folders.set(city, { csv: false });
    if (f === "report.md") {
      const text = readFileSync(p, "utf8");
      w.dup += (text.match(/DUPLICATE_OF/g) ?? []).length;
      const m = text.match(/## Chrome調査が必要\n([\s\S]*?)(?:\n## |$)/);
      if (m) w.chrome += m[1].split("\n").filter((l) => /^- .+\|.+\|/.test(l)).length;
    } else if (["clubs.csv", "instructors.csv", "events.csv"].includes(f)) {
      const rows = parseCsv(readFileSync(p, "utf8").replace(/^﻿/, ""));
      if (rows.length) folders.get(city).csv = true;
      w.active += rows.filter((r) => (r.status ?? "").toUpperCase() === "ACTIVE").length;
    }
  }
  for (const [city, v] of folders) { w.visits++; if (v.csv) w.withCsv++; w.towns.set(city, (w.towns.get(city) ?? 0) + 1); }
}

const keys = [...byWeek.keys()].sort().slice(-weeks);
const out = ["| week of | runs | visits | with CSV | % CSV | ACTIVE rows | DUPLICATE_OF | towns visited 2+ times | Chrome queue |", "|---|---|---|---|---|---|---|---|---|"];
for (const k of keys) {
  const w = byWeek.get(k);
  const rep = [...w.towns.values()].filter((n) => n > 1).length;
  out.push(`| ${k} | ${w.runs.size} | ${w.visits} | ${w.withCsv} | ${w.visits ? Math.round((100 * w.withCsv) / w.visits) : 0}% | ${w.active} | ${w.dup} | ${rep} | ${w.chrome} |`);
}
console.log(out.join("\n"));
