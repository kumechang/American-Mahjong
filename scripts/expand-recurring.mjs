#!/usr/bin/env node
// Turns a standing weekly or monthly game written in a club's schedule ("Every Thursday 5-7 PM", "2nd and 4th Tuesdays 6:30-8 PM")
// into dated sessions for the next six weeks, for clubs that have no upcoming session at all (a real listing, from a booking
// page or calendar, always wins). Rows go into the crawler's inbox folder, so they are imported like crawled sessions.
//
//   node scripts/expand-recurring.mjs --out-dir=data/inbox/crawl-YYYY-MM-DD-HHMM [--today=YYYY-MM-DD] [--days=42] [--dry-run]
//
// A club qualifies when it is ACTIVE, was verified in the last 120 days, has a street address that is a place a visitor can go
// to, and its schedule text is a plain pattern (scripts/lib/recurrence.mjs rejects months, seasons, series, member-only wording,
// "check the calendar", two different times). Holidays without a game: Thanksgiving, Dec 24-25, Jan 1, Jul 4, Memorial and Labor Day.
// Exit code 3 = nothing to add. Needs the local D1 (`npx wrangler d1 migrations apply DB --local`).
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { arg, today, q, csvCell, venueOk, parseCsv } from "./lib/crawl-lib.mjs";
import { parseRecurrence, expand } from "./lib/recurrence.mjs";

const outDir = arg("out-dir");
if (!outDir) { console.error("--out-dir is required"); process.exit(2); }
const days = Number(arg("days") ?? 42);
const dry = process.argv.includes("--dry-run");
const HEADER = "name,city,state,event_date,start_time,end_time,venue,club_name,instructor_name,event_type,beginner_friendly,price,registration_url,source_url,last_verified_at,status";
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const clubs = q(`SELECT x.id, x.name, x.address, x.website, x.sourceUrl, x.schedule, x.openPlay, x.socialPlay, x.lessonsAvailable, x.beginnerFriendly, x.lastVerifiedAt,
  c.name AS city, c.state, c.slug AS citySlug FROM Club x JOIN City c ON c.id = x.cityId
  WHERE x.status = 'ACTIVE' AND x.schedule IS NOT NULL AND trim(x.schedule) <> ''
    AND NOT EXISTS (SELECT 1 FROM Event e WHERE e.clubId = x.id AND e.status IN ('ACTIVE', 'NEEDS_REVIEW') AND e.eventDate >= '${today} 00:00:00')`);

// clubs the crawler found sessions for in this very run
const crawled = new Set();
if (existsSync(outDir)) {
  for (const d of readdirSync(outDir)) {
    const f = `${outDir}/${d}/events.csv`;
    if (existsSync(f)) for (const r of parseCsv(readFileSync(f, "utf8"))) if (r.club_name) crawled.add(norm(r.club_name));
  }
}

const rows = new Map(); // citySlug -> {city, state, lines[]}
let clubsUsed = 0;
for (const c of clubs) {
  if (crawled.has(norm(c.name))) continue;
  if (c.lastVerifiedAt && Date.parse(today) - Date.parse(String(c.lastVerifiedAt).slice(0, 10)) > 120 * 864e5) continue;
  if (!c.address || !/\d/.test(c.address) || !venueOk(c.address, c.city)) continue;
  const rec = parseRecurrence(c.schedule);
  if (!rec) continue;
  const dates = expand(rec, today, days);
  if (!dates.length) continue;
  const kind = c.openPlay ? "open play" : c.socialPlay ? "social play" : c.lessonsAvailable ? "lesson" : "mahjong";
  const type = c.openPlay ? "OPEN_PLAY" : c.socialPlay ? "SOCIAL" : c.lessonsAvailable ? "LESSON" : "OTHER";
  const nth = rec.rules.some((r) => r.nth) ? "monthly" : "weekly";
  for (const d of dates) {
    const line = [`${c.name} — ${nth} ${kind}`, c.city, c.state, d, rec.start, rec.end, c.address, c.name, "", type, c.beginnerFriendly && type === "LESSON" ? "TRUE" : "FALSE", "", c.website ?? "", c.sourceUrl ?? c.website ?? "", String(c.lastVerifiedAt ?? today).slice(0, 10), "ACTIVE"].map(csvCell).join(",");
    if (!rows.has(c.citySlug)) rows.set(c.citySlug, { city: c.city, state: c.state, lines: [] });
    rows.get(c.citySlug).lines.push(line);
  }
  clubsUsed++;
}

const total = [...rows.values()].reduce((n, r) => n + r.lines.length, 0);
console.log(`Recurring sessions: ${total} for ${clubsUsed} clubs in ${rows.size} cities (clubs with a plain weekly or monthly pattern and no listed session)`);
if (!total) process.exit(3);
if (dry) { for (const [slug, r] of rows) console.log(`- ${slug}: ${r.lines.length}`); process.exit(0); }
for (const [slug, r] of rows) {
  const dir = `${outDir}/${slug}`;
  mkdirSync(dir, { recursive: true });
  const f = `${dir}/events.csv`;
  if (existsSync(f)) appendFileSync(f, r.lines.join("\n") + "\n"); else writeFileSync(f, `${HEADER}\n${r.lines.join("\n")}\n`);
  const note = `\n## Recurring sessions (expand-recurring.mjs)\n- ${r.lines.length} sessions from standing weekly/monthly schedules written on the clubs' records, no real listing found for these clubs\n`;
  if (existsSync(`${dir}/report.md`)) appendFileSync(`${dir}/report.md`, note); else writeFileSync(`${dir}/report.md`, `# ${r.city}, ${r.state}: event crawler (${today})\n\n## New events\n${r.lines.map((l) => `- ${l.split(",")[3]} ${l.split(",")[0]}`).join("\n")}\n${note}`);
}
process.exit(0);
