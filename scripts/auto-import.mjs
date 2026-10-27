#!/usr/bin/env node
// Automatic import of the crawlers' inbox folders (the morning check, done by a script).
//
//   node scripts/auto-import.mjs --dirs=crawl-2026-10-13-1802,discover-2026-10-13-1802 [--digest=digest.md] [--today=YYYY-MM-DD]
//
// What it does, in order:
//   1. Reads data/inbox/<id>/<city>/{clubs,instructors,events}.csv and drops what must never go in unattended
//      (past dates, private homes, non-sessions, other countries, rows already on the site: this script only ever INSERTS, it
//      never overwrites a row a person has curated).
//   2. Clubs and instructors always arrive as NEEDS_REVIEW. Events keep the crawler's ACTIVE only when the owner is already
//      ACTIVE on the site and the event has a start time, a named venue, a sane price, no state mismatch and no morning/evening clash;
//      everything else is NEEDS_REVIEW (not shown on the site).
//   3. Sessions listed in <id>/gone.json (a club's own full listing no longer shows them) are retired (status INACTIVE).
//   4. Cities that fall under the five-row rule are unpublished, and cities this script unpublished earlier
//      (data/auto-unpublished.txt) are published again once they are back at five. Cities are never published for the first time here.
//   5. Writes migrations/NNNN_auto_<stamp>.sql, applies it to the local database and prints a digest.
//
// Anything odd (an import that does not validate, an unusual number of rows or flips) exits 1 and writes nothing: the inbox PRs stay
// open for a person, as before. Exit 0 = migration written, 3 = nothing to do.

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { arg, today, q, parseCsv, csvCell, NOT_A_SESSION, venueOk } from "./lib/crawl-lib.mjs";

const dirs = (arg("dirs") ?? "").split(",").map((d) => d.trim()).filter(Boolean);
const digestPath = arg("digest");
const MIN_ROWS = 5;
const MAX_ROWS = { clubs: 400, instructors: 250, events: 500, flips: 12 };
const US_STATES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slugify = (t) => String(t).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;
const eventSlug = (cityName, name, date) => `${slugify(cityName)}-${slugify(name)}-${date.replace(/-/g, "")}`;
const skipped = new Map(); // reason -> examples
const skip = (reason, what) => { if (!skipped.has(reason)) skipped.set(reason, []); skipped.get(reason).push(what); };

// ---------- what is on the site ----------
const cities = q(`SELECT id, name, state, slug, published FROM City`);
const cityKey = (name, state) => `${norm(name).replace(/^saint /, "st ")}|${state}`; // "Saint Louis" = "St. Louis"
const cityByKey = new Map(cities.map((c) => [cityKey(c.name, c.state), c]));
const cityById = new Map(cities.map((c) => [c.id, c]));
const owners = new Map(); // "type|cityId|norm(name)" -> status
for (const o of q(`SELECT name, cityId, status FROM Club`)) owners.set(`club|${o.cityId}|${norm(o.name)}`, o.status);
for (const o of q(`SELECT name, cityId, status FROM Instructor`)) owners.set(`instructor|${o.cityId}|${norm(o.name)}`, o.status);
const takenSlugs = new Set(q(`SELECT slug FROM Event`).map((r) => r.slug.replace(/^event_/, "")));

// ---------- guards ----------
const denied = existsSync("data/venue-denylist.txt")
  ? readFileSync("data/venue-denylist.txt", "utf8").split("\n").map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith("#"))
  : [];
const HOME = /\b(home|residence|private house)\b|['’]s (house|place)\b/i;
const deniedVenue = (v) => denied.some((d) => String(v ?? "").toLowerCase().includes(d));
const stateIn = (venue) => { const m = String(venue ?? "").match(/,\s*([A-Z]{2})\b(?:\s+\d{5})?/g); return m ? m.map((x) => x.match(/[A-Z]{2}/)[0]) : []; };

// ---------- read the inbox folders ----------
const ROWS = { clubs: [], instructors: [], events: [] };
const HEAD = {};
const newCities = new Map();
const gone = [];
const promote = [];
for (const id of dirs) {
  const base = `data/inbox/${id}`;
  if (!existsSync(base)) { console.error(`missing ${base}`); process.exit(1); }
  if (existsSync(`${base}/gone.json`)) gone.push(...JSON.parse(readFileSync(`${base}/gone.json`, "utf8")));
  if (existsSync(`${base}/promote.json`)) promote.push(...JSON.parse(readFileSync(`${base}/promote.json`, "utf8")));
  for (const d of readdirSync(base, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    const isLead = /^(bb|m4f)-/.test(d.name); // BamBuddies and Mahjong 4 Friends leads: only for places already on the site
    const isEventbrite = /^eb-/.test(d.name); // Eventbrite organisers: same, unless the event text itself says American / NMJL
    for (const kind of ["clubs", "instructors", "events"]) {
      const f = `${base}/${d.name}/${kind}.csv`;
      if (!existsSync(f)) continue;
      const text = readFileSync(f, "utf8");
      HEAD[kind] ??= text.split("\n")[0].replace(/\r$/, "");
      for (const r of parseCsv(text)) {
        const ctx = `${r.name} (${r.city}, ${r.state})`;
        if (!US_STATES.has(r.state)) { skip("not a US state", ctx); continue; }
        let city = cityByKey.get(cityKey(r.city, r.state));
        if (city) r.city = city.name; // "St Louis" -> "St. Louis"
        if (kind !== "events") {
          r.status = "NEEDS_REVIEW";
          if (!city && (isLead || (isEventbrite && !/mentions American/.test(r.description ?? "")))) { skip("lead for a place not on the site", ctx); continue; }
          if (owners.has(`${kind === "clubs" ? "club" : "instructor"}|${city?.id}|${norm(r.name)}`)) { skip("already on the site", ctx); continue; }
          if (HOME.test(r.name)) { skip("looks like a private home", ctx); continue; }
          if (!city) { newCities.set(cityKey(r.city, r.state), { name: r.city, state: r.state }); }
        } else {
          if (!city && !newCities.has(cityKey(r.city, r.state))) { skip("event in a city not on the site", ctx); continue; }
          if (r.event_date < today) { skip("already past", ctx); continue; }
          if (NOT_A_SESSION.test(r.name) || HOME.test(r.name)) { skip("not a public session / looks like a private home", ctx); continue; }
          if (deniedVenue(r.venue) || HOME.test(r.venue)) { skip("venue on the denylist or looks like a home", ctx); continue; }
          const slug = eventSlug(r.city, r.name, r.event_date);
          if (takenSlugs.has(slug)) { skip("already on the site", ctx); continue; }
          takenSlugs.add(slug);
          // ACTIVE only for an owner that is already ACTIVE here, with everything a visitor needs
          if (r.status === "ACTIVE") {
            const owner = r.club_name ? `club|${city?.id}|${norm(r.club_name)}` : r.instructor_name ? `instructor|${city?.id}|${norm(r.instructor_name)}` : "";
            const price = r.price === "" ? null : Number(r.price);
            const why = !owner || owners.get(owner) !== "ACTIVE" ? "owner is not ACTIVE"
              : !/^\d{2}:\d{2}$/.test(r.start_time) ? "no start time"
              : !venueOk(r.venue, r.city) ? "no venue a visitor can go to"
              : price != null && !(price >= 0 && price <= 600) ? "price outside $0-$600"
              : stateIn(r.venue).some((s) => s !== r.state) ? "venue is in another state"
              : (/\b(evening|night)\b/i.test(r.name) && r.start_time < "12:00") || (/\bmorning\b/i.test(r.name) && r.start_time >= "17:00") ? "title and start time disagree"
              : "";
            if (why) { r.status = "NEEDS_REVIEW"; skip(`kept as NEEDS_REVIEW: ${why}`, ctx); }
          }
        }
        ROWS[kind].push(r);
      }
    }
  }
}
for (const [k, max] of Object.entries(MAX_ROWS)) if (ROWS[k] && ROWS[k].length > max) { console.error(`${ROWS[k].length} ${k} in one run is more than expected: leaving it to a person`); process.exit(1); }

// ---------- import SQL (the existing importer validates and writes it) ----------
let importSql = "";
if (ROWS.clubs.length || ROWS.instructors.length || ROWS.events.length) {
  const tmp = mkdtempSync(join(tmpdir(), "auto-import-"));
  const args = [];
  for (const kind of ["clubs", "instructors", "events"]) {
    if (!ROWS[kind].length) continue;
    const head = HEAD[kind].split(",");
    const p = join(tmp, `${kind}.csv`);
    writeFileSync(p, [HEAD[kind], ...ROWS[kind].map((r) => head.map((h) => csvCell(r[h] ?? "")).join(","))].join("\n") + "\n");
    args.push(`--${kind}=${p}`);
  }
  try {
    execFileSync("node", ["scripts/import-csv.mjs", ...args, `--out=${join(tmp, "import.sql")}`], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    console.error(`the importer rejected the rows:\n${e.stdout ?? ""}${e.stderr ?? ""}`);
    process.exit(1);
  }
  importSql = readFileSync(join(tmp, "import.sql"), "utf8");
}

// ---------- retired sessions ----------
const retire = [];
for (const g of gone) {
  const row = q(`SELECT slug, status, eventDate FROM Event WHERE slug = ${sqlStr(g.slug)}`)[0];
  if (row && row.status === "ACTIVE" && row.eventDate.slice(0, 10) > today) retire.push(g);
  else skip("gone: not an upcoming ACTIVE session any more", `${g.name} ${g.date}`);
}

// ---------- promotions proposed by scripts/verify-owners.mjs (the owner's own page says American / NMJL) ----------
const MAX_PROMOTIONS = 40;
const promoted = [];
const promoteSql = [];
for (const p of promote.slice(0, MAX_PROMOTIONS)) {
  const table = p.type === "club" ? "Club" : "Instructor";
  const col = p.type === "club" ? "clubId" : "instructorId";
  const row = q(`SELECT x.id, x.slug, x.status, c.name AS cityName FROM ${table} x JOIN City c ON c.id = x.cityId WHERE x.slug = ${sqlStr(p.slug)}`)[0];
  if (!row || row.status !== "NEEDS_REVIEW") { skip("promotion: not a NEEDS_REVIEW row any more", p.name); continue; }
  const quote = String(p.evidence).replace(/[\r\n]+/g, " ").slice(0, 200);
  promoteSql.push(`UPDATE "${table}" SET "status" = 'ACTIVE', "lastVerifiedAt" = '${today}', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(p.slug)} AND "status" = 'NEEDS_REVIEW'; -- ${p.name} (${p.city}, ${p.state}): "${quote}" ${p.url}`);
  // its upcoming sessions that already have a start time and a named venue become visible too (same rule as the event crawler)
  let n = 0;
  for (const e of q(`SELECT slug, name, startTime, venue FROM Event WHERE ${col} = ${sqlStr(row.id)} AND status = 'NEEDS_REVIEW' AND eventDate >= '${today} 00:00:00'`)) {
    const t = String(e.startTime ?? "").slice(0, 5);
    const bad = !/^\d{2}:\d{2}$/.test(t) || !venueOk(e.venue, row.cityName)
      || deniedVenue(e.venue) || HOME.test(e.venue ?? "") || HOME.test(e.name) || NOT_A_SESSION.test(e.name)
      || (/\b(evening|night)\b/i.test(e.name) && t < "12:00") || (/\bmorning\b/i.test(e.name) && t >= "17:00");
    if (bad) continue;
    promoteSql.push(`UPDATE "Event" SET "status" = 'ACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(e.slug)} AND "status" = 'NEEDS_REVIEW';`);
    n++;
  }
  promoted.push({ ...p, sessions: n });
}
if (promote.length > MAX_PROMOTIONS) skip("promotion: over the per-run limit (the rest wait for the next run)", `${promote.length - MAX_PROMOTIONS} owners`);

// ---------- assemble the migration ----------
const parts = [];
if (newCities.size) {
  // a city name can repeat across states (Portsmouth NH / VA): the slug (and id) then carries the state
  const usedSlugs = new Set(cities.map((c) => c.slug));
  const rowsSql = [];
  for (const c of newCities.values()) {
    let slug = slugify(c.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${c.state.toLowerCase()}`;
    if (usedSlugs.has(slug)) { console.error(`city slug ${slug} is taken: leaving it to a person`); process.exit(1); }
    usedSlugs.add(slug);
    rowsSql.push(`(${sqlStr(`city_${slug}`)}, ${sqlStr(c.name)}, ${sqlStr(c.state)}, ${sqlStr(slug)}, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
  }
  parts.push(`INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES\n${rowsSql.join(",\n")};`);
}
if (importSql) parts.push(importSql.trim());
if (promoteSql.length) parts.push(`-- Owners whose own page says American / NMJL (scripts/verify-owners.mjs), with their ready sessions\n` + promoteSql.join("\n"));
if (retire.length) parts.push(`-- Sessions the club's own listing no longer shows\n` + retire.map((g) => `UPDATE "Event" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(g.slug)} AND "status" = 'ACTIVE'; -- ${g.name.replace(/[\r\n]+/g, " ")}, ${g.date} (${g.owner})`).join("\n"));

const stamp = new Date().toISOString().slice(0, 16).replace(/[-T:]/g, "");
const nextNum = Math.max(...readdirSync("migrations").map((f) => Number(f.slice(0, 4))).filter(Number.isFinite)) + 1;
const out = `migrations/${String(nextNum).padStart(4, "0")}_auto_${stamp}.sql`;
const header = `-- Automatic import ${today} (${dirs.join(", ") || "no inbox folder"}). Written by scripts/auto-import.mjs; see docs/PROJECT_STATUS.md.\n`;

// ---------- publish rule: apply what we have, then count ----------
const autoListPath = "data/auto-unpublished.txt";
const autoList = new Set(existsSync(autoListPath) ? readFileSync(autoListPath, "utf8").split("\n").map((l) => l.trim()).filter(Boolean) : []);
const flips = { off: [], on: [] };
// A city that drops under five rows is only watched at first (a weekly session can be missing from a calendar for a day or two);
// it is unpublished when it has been under for GRACE_DAYS in a row.
const GRACE_DAYS = Number(arg("grace") ?? 3);
const belowPath = "data/auto-below.txt";
const below = new Map(existsSync(belowPath) ? readFileSync(belowPath, "utf8").split("\n").map((l) => l.trim().split(/\s+/)).filter((p) => p.length === 2) : []);
const belowBefore = JSON.stringify([...below]);
const watching = [];
if (parts.length) {
  writeFileSync(out, header + parts.join("\n\n") + "\n");
  try { execFileSync("npx", ["wrangler", "d1", "migrations", "apply", "DB", "--local"], { stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { console.error(`the new migration does not apply:\n${e.stdout ?? ""}${e.stderr ?? ""}`); try { execFileSync("rm", ["-f", out]); } catch { /* ignore */ } process.exit(1); }
}
const counts = q(`SELECT c.slug, c.name, c.state, c.published,
  (SELECT count(*) FROM Club WHERE cityId = c.id AND status = 'ACTIVE') + (SELECT count(*) FROM Instructor WHERE cityId = c.id AND status = 'ACTIVE') +
  (SELECT count(*) FROM Event WHERE cityId = c.id AND status = 'ACTIVE' AND eventDate >= '${today} 00:00:00') AS n FROM City c`);
for (const c of counts) {
  if (c.published && c.n < MIN_ROWS) {
    const since = below.get(c.slug) ?? today;
    below.set(c.slug, since);
    const days = Math.round((Date.parse(today) - Date.parse(since)) / 864e5);
    if (days >= GRACE_DAYS) { flips.off.push(c); below.delete(c.slug); } else watching.push(`${c.name}, ${c.state} (${c.n} since ${since})`);
  } else {
    below.delete(c.slug);
    if (!c.published && autoList.has(c.slug) && c.n >= MIN_ROWS) flips.on.push(c);
  }
}
if (flips.off.length + flips.on.length > MAX_ROWS.flips) { console.error(`${flips.off.length + flips.on.length} cities would change visibility at once: leaving it to a person`); try { execFileSync("rm", ["-f", out]); } catch { /* ignore */ } process.exit(1); }
const flipSql = [
  ...flips.off.map((c) => `UPDATE "City" SET "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(c.slug)}; -- ${c.name}, ${c.state}: ${c.n} active rows for ${GRACE_DAYS}+ days (rule: ${MIN_ROWS})`),
  ...flips.on.map((c) => `UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(c.slug)}; -- ${c.name}, ${c.state}: back to ${c.n} active rows`),
];
const belowChanged = JSON.stringify([...below]) !== belowBefore;
if (!parts.length && !flipSql.length && !belowChanged && !dirs.length) { console.log(`# Auto-import ${today}\n\nNothing to import.${watching.length ? ` Watching: ${watching.join("; ")}` : ""}`); process.exit(3); }
if (flipSql.length) {
  const body = (parts.length ? readFileSync(out, "utf8") : header) + (parts.length ? "\n" : "") + `-- Publish rule (five active rows)\n${flipSql.join("\n")}\n`;
  writeFileSync(out, body);
  for (const c of flips.off) autoList.add(c.slug);
  for (const c of flips.on) autoList.delete(c.slug);
  writeFileSync(autoListPath, [...autoList].sort().join("\n") + (autoList.size ? "\n" : ""));
}
writeFileSync(belowPath, [...below].map(([k, v]) => `${k} ${v}`).sort().join("\n") + (below.size ? "\n" : ""));

// ---------- digest ----------
const by = (rows, f) => rows.reduce((m, r) => m.set(f(r), (m.get(f(r)) ?? 0) + 1), new Map());
const evStatus = [...by(ROWS.events, (r) => r.status)].map(([k, v]) => `${v} ${k}`).join(", ") || "0";
const lines = [
  `# Auto-import ${today}`,
  ``,
  `Inbox folders: ${dirs.join(", ") || "none"}. Migration: \`${out}\`.`,
  ``,
  `- Clubs: ${ROWS.clubs.length} (NEEDS_REVIEW), instructors: ${ROWS.instructors.length} (NEEDS_REVIEW), events: ${ROWS.events.length} (${evStatus})`,
  `- New cities (unpublished): ${[...newCities.values()].map((c) => `${c.name}, ${c.state}`).join("; ") || "none"}`,
  `- Retired sessions: ${retire.length}${retire.length ? " — " + retire.map((g) => `${g.name} ${g.date} (${g.owner})`).join("; ") : ""}`,
  `- Promoted to ACTIVE (own page says American / NMJL): ${promoted.length}${promoted.length ? " — " + promoted.map((p) => `${p.name} (${p.city}, ${p.state}${p.sessions ? `, +${p.sessions} sessions` : ""})`).join("; ") : ""}`,
  `- Ready to publish (unpublished, ${MIN_ROWS}+ active rows; a person writes the intro and publishes): ${counts.filter((c) => !c.published && c.n >= MIN_ROWS && !autoList.has(c.slug)).map((c) => `${c.name}, ${c.state} (${c.n})`).join("; ") || "none"}`,
  `- Unpublished (under ${MIN_ROWS} active rows): ${flips.off.map((c) => `${c.name}, ${c.state} (${c.n})`).join("; ") || "none"}`,
  `- Watching (under ${MIN_ROWS} rows, unpublished after ${GRACE_DAYS} days): ${watching.join("; ") || "none"}`,
  `- Published again: ${flips.on.map((c) => `${c.name}, ${c.state} (${c.n})`).join("; ") || "none"}`,
  `- Needs a person: ${ROWS.events.filter((r) => r.status === "NEEDS_REVIEW").length} NEEDS_REVIEW events, ${ROWS.clubs.length + ROWS.instructors.length} leads (promote to ACTIVE after checking American / NMJL and the venue)`,
  ``,
  `## Left out`,
  ...[...skipped].map(([k, v]) => `- ${k}: ${v.length} (${v.slice(0, 4).join("; ")}${v.length > 4 ? "; …" : ""})`),
];
const digest = lines.join("\n") + "\n";
if (digestPath) writeFileSync(digestPath, digest);
console.log(digest);
process.exit(0);
