#!/usr/bin/env node
// Writes the "already on the site" list for the target cities into
// prompts/city-research.md (between the EXISTING markers). The external research
// server cannot read this repo, so the list travels inside the prompt and the
// server can skip rows we already have and reuse their exact names.
//
//   node scripts/prompt-existing.mjs --cities=pittsburgh,cincinnati
//
// Run `npx wrangler d1 migrations apply DB --local` first, and re-run after
// every import (the list must match the database).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const arg = process.argv.find((a) => a.startsWith("--cities="));
if (!arg) { console.error("usage: --cities=slug1,slug2"); process.exit(2); }
const slugs = arg.slice(9).split(",").map((x) => x.trim()).filter(Boolean);
if (!slugs.every((x) => /^[a-z0-9-]+$/.test(x))) { console.error("bad slug"); process.exit(2); }

const q = (sql) =>
  JSON.parse(
    execFileSync("npx", ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command", sql], { encoding: "utf8", maxBuffer: 50e6 }).replace(/^[^[]*/, ""),
  )[0].results;

const today = new Date().toISOString().slice(0, 10);
const cities = q(`SELECT id, slug, name, state FROM City WHERE slug IN (${slugs.map((x) => `'${x}'`).join(",")})`);
let out = "";
for (const c of cities) {
  const cl = q(`SELECT name, status FROM Club WHERE cityId='${c.id}' ORDER BY status, name`);
  const i = q(`SELECT name, status FROM Instructor WHERE cityId='${c.id}' ORDER BY status, name`);
  const e = q(`SELECT name, eventDate, status FROM Event WHERE cityId='${c.id}' AND eventDate >= '${today}' ORDER BY eventDate, name`);
  const active = [...cl, ...i, ...e].filter((r) => r.status === "ACTIVE").length;
  const f = (rows, fn) => (rows.length ? rows.map(fn).join("\n") : "- (none)");
  out += `### ${c.name}, ${c.state}  (ACTIVE ${active} 行。公開には5行必要)\n`;
  out += `Clubs:\n${f(cl, (r) => `- ${r.name} [${r.status}]`)}\n`;
  out += `Instructors:\n${f(i, (r) => `- ${r.name} [${r.status}]`)}\n`;
  out += `Upcoming events:\n${f(e, (r) => `- ${r.name} on ${r.eventDate.slice(0, 10)} [${r.status}]`)}\n\n`;
}
const p = "prompts/city-research.md";
const s = readFileSync(p, "utf8");
const a = "<!-- EXISTING:START -->", b = "<!-- EXISTING:END -->";
if (!s.includes(a) || !s.includes(b)) { console.error("markers missing in prompt"); process.exit(2); }
writeFileSync(p, s.slice(0, s.indexOf(a) + a.length) + "\n" + out + s.slice(s.indexOf(b)));
console.log(`updated ${p} for ${cities.map((c) => c.slug).join(", ")}`);
