#!/usr/bin/env node
// Checks researcher-supplied CSVs against docs/CITY_RESEARCH_PROMPT.md before
// they are imported. Run it on the files you receive; send the printout back
// to the researcher, or apply the safe fixes with --fix.
//
// Usage:
//   node scripts/validate-csv.mjs \
//     --clubs=clubs.csv --instructors=instructors.csv --events=events.csv \
//     [--fix --out-dir=cleaned/] [--strict] [--today=2026-10-01]
//
// Levels:
//   ERROR  the import would fail or load wrong data (fix before importing)
//   WARN   probably wrong or against the prompt; review each one
//   INFO   worth a look, no action required
// Exit code is 1 when there are errors (or any warnings with --strict).
//
// --fix writes cleaned copies to --out-dir with only mechanical fixes:
// BOM/CRLF removal, TRUE/FALSE casing, blank booleans -> FALSE, "$35" and
// "35.0" -> "35". Everything else is reported, never guessed.

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join, basename } from "node:path";

// ---------------------------------------------------------------- schemas
const HEADERS = {
  clubs: "name,city,state,description,address,website,phone,email,latitude,longitude,beginner_friendly,lessons_available,open_play,social_play,women_only,free,price,schedule,source_url,last_verified_at,status".split(","),
  instructors: "name,city,state,website,contact,private_lesson,group_lesson,online_lesson,beginner_lesson,price,notes,source_url,last_verified_at,status".split(","),
  events: "name,city,state,event_date,start_time,end_time,venue,club_name,instructor_name,event_type,beginner_friendly,price,registration_url,source_url,last_verified_at,status".split(","),
};
const BOOLS = {
  clubs: ["beginner_friendly", "lessons_available", "open_play", "social_play", "women_only", "free"],
  instructors: ["private_lesson", "group_lesson", "online_lesson", "beginner_lesson"],
  events: ["beginner_friendly"],
};
const STATUSES = ["ACTIVE", "INACTIVE", "NEEDS_REVIEW"];
const EVENT_TYPES = ["OPEN_PLAY", "TOURNAMENT", "SOCIAL", "LESSON", "OTHER"];
const EVENT_TYPE_HINTS = {
  "beginner workshop": "LESSON", workshop: "LESSON", class: "LESSON", lesson: "LESSON",
  "guided open play": "OPEN_PLAY", "guided play": "OPEN_PLAY", "open play": "OPEN_PLAY",
  league: "TOURNAMENT", "social tournament": "TOURNAMENT", tournament: "TOURNAMENT", social: "SOCIAL",
};
const DIRECTORY_HOSTS = ["bambuddies.org", "mahjonggmaven.com", "orderofthetile.com", "mahjong4friends.com", "wherethewindsblow.com", "markyourmahjong.com", "sloperama.com"];
const VARIANT_WORDS = /american|nmjl|national mah\s?j|mah\s?jongg?|mahj/i;

// ---------------------------------------------------------------- parsing
function parseCsv(text) {
  const src = text.replace(/^﻿/, "");
  const rows = [];
  let row = [];
  let cur = "";
  let quoted = false;
  let line = 1;
  let rowLine = 1;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else { cur += c; if (c === "\n") line++; }
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((v) => v !== "")) rows.push({ line: rowLine, values: row });
      row = []; line++; rowLine = line;
    } else cur += c;
  }
  row.push(cur);
  if (row.some((v) => v !== "")) rows.push({ line: rowLine, values: row });
  return rows;
}

function toCsv(header, records) {
  const esc = (v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [header.join(","), ...records.map((r) => header.map((h) => esc(r[h] ?? "")).join(","))].join("\n") + "\n";
}

// ------------------------------------------------------------ known data
async function loadKnown() {
  const known = { clubs: new Map(), instructors: new Map(), events: new Map(), eventSlugs: new Map() };
  let dirs = [];
  try { dirs = await readdir("data/collected"); } catch { return known; }
  for (const dir of dirs) {
    for (const kind of ["clubs", "instructors", "events"]) {
      let text;
      try { text = await readFile(join("data/collected", dir, `${kind}.csv`), "utf8"); } catch { continue; }
      const [head, ...body] = parseCsv(text);
      if (!head) continue;
      for (const r of body) {
        const rec = Object.fromEntries(head.values.map((h, i) => [h.trim(), (r.values[i] ?? "").trim()]));
        const cityKey = `${rec.city}|${rec.state}`.toLowerCase();
        const key = kind === "events" ? `${cityKey}|${rec.name}|${rec.event_date}|${rec.venue}`.toLowerCase() : `${cityKey}|${rec.name}`.toLowerCase();
        known[kind].set(key, rec);
        if (kind === "events") known.eventSlugs.set(`${cityKey}|${rec.name}|${rec.event_date}`.toLowerCase(), rec);
      }
    }
  }
  return known;
}

// ---------------------------------------------------------------- checks
const isHttp = (v) => /^https?:\/\/\S+$/i.test(v);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const host = (v) => { try { return new URL(v).hostname.replace(/^www\./, ""); } catch { return ""; } };

function checkRows(kind, records, ctxOf, known, today, batch) {
  const out = [];
  const add = (level, i, msg) => out.push({ level, row: records[i]._line, name: records[i].name, msg });
  const seen = new Map();

  records.forEach((r, i) => {
    const active = r.status.toUpperCase() === "ACTIVE";
    for (const f of ["name", "city", "state", "status"]) if (!r[f]) add("ERROR", i, `"${f}" is required`);
    if (r.status && !STATUSES.includes(r.status)) add("ERROR", i, `status must be one of ${STATUSES.join(", ")} (got "${r.status}")`);
    if (r.state && !/^[A-Z]{2}$/.test(r.state)) add("ERROR", i, `state must be a 2-letter code (got "${r.state}")`);
    if (r.city.includes(",")) add("ERROR", i, `city must be the bare metro name, no ", ST" or suburb list (got "${r.city}")`);
    if (r.last_verified_at && !isDate(r.last_verified_at)) add("ERROR", i, `last_verified_at must be YYYY-MM-DD (got "${r.last_verified_at}")`);
    if (active && !r.source_url) add("WARN", i, "ACTIVE row has no source_url");
    if (r.source_url && !isHttp(r.source_url)) add("ERROR", i, `source_url must be http(s) (got "${r.source_url}")`);

    for (const f of BOOLS[kind]) {
      const v = r[f];
      if (v === "") add("WARN", i, `${f} is blank (imported as FALSE) — fill it in`);
      else if (!["TRUE", "FALSE"].includes(v.toUpperCase())) add("ERROR", i, `${f} must be TRUE or FALSE (got "${v}")`);
      else if (v !== v.toUpperCase()) add("INFO", i, `${f} "${v}" should be upper-case (--fix handles it)`);
    }
    if (r.price && !/^\d+(\.\d+)?$/.test(r.price)) {
      add("WARN", i, `price should be a plain number (got "${r.price}"); put member/public splits in ${kind === "clubs" ? "schedule" : "notes"}`);
    }
    if (r.price && /^\d+\.0$/.test(r.price)) add("INFO", i, `price "${r.price}" can be "${r.price.slice(0, -2)}"`);

    if (kind === "clubs") {
      for (const f of ["website"]) if (r[f] && !isHttp(r[f])) add("ERROR", i, `${f} must be http(s) (got "${r[f]}")`);
      if (r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) add("ERROR", i, `email looks wrong ("${r.email}")`);
      if (/email protected/i.test(Object.values(r).join(" "))) add("ERROR", i, "contains an obfuscated '[email protected]' placeholder");
      if (r.phone && r.phone.replace(/\D/g, "").length < 10) add("ERROR", i, `phone looks truncated ("${r.phone}")`);
      for (const f of ["latitude", "longitude"]) if (r[f] && Number.isNaN(Number(r[f]))) add("ERROR", i, `${f} must be a number (got "${r[f]}") — column shift?`);
      if (r.phone && !/^[\d\s().+-]+$/.test(r.phone)) add("ERROR", i, `phone has letters ("${r.phone}") — column shift?`);
      if (active) {
        if (r.address && (!/\d/.test(r.address) && r.address.split(/\s+/).length > 6 || /[;/]/.test(r.address) && r.address.length > 60)) add("WARN", i, `address reads like prose, not an address ("${r.address.slice(0, 60)}…")`);
        if (/\b(home studio|my home|residence|private home)\b/i.test(`${r.address} ${r.description}`)) add("WARN", i, "may expose a private home address — use the town only");
        if (!r.website && DIRECTORY_HOSTS.includes(host(r.source_url))) add("WARN", i, "no website of its own and only a directory as source — usually NEEDS_REVIEW");
        if (DIRECTORY_HOSTS.includes(host(r.website))) add("WARN", i, "website is a directory page, not the group's own site");
        if (!VARIANT_WORDS.test(`${r.name} ${r.description} ${r.schedule}`)) add("WARN", i, "nothing in name/description/schedule says American / NMJL");
        if (/member(s)?[- ]only|members only|member event|for members/i.test(`${r.description} ${r.schedule}`)) add("WARN", i, "looks member-only — usually NEEDS_REVIEW");
        if (/\bwoman'?s club\b/i.test(r.name)) add("INFO", i, "women's/ladies' clubs are often members-only — confirm public access");
        if (r.free.toUpperCase() === "TRUE" && r.price && Number(r.price) > 0) add("WARN", i, "free=TRUE but a price is set");
      }
      if (r.women_only.toUpperCase() === "TRUE") add("INFO", i, "women_only=TRUE — confirm the source says so");
      if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(`${r.description} ${r.schedule}`)) add("WARN", i, "email address inside description/schedule");
    }

    if (kind === "instructors") {
      if (r.website && !isHttp(r.website)) add("ERROR", i, `website must be http(s) (got "${r.website}")`);
      if (active && !r.website && !r.contact) add("WARN", i, "ACTIVE with neither website nor contact — usually NEEDS_REVIEW");
      if (active && !r.website && DIRECTORY_HOSTS.includes(host(r.source_url))) add("INFO", i, "no website; listed only via a directory — confirm on their own page if possible");
      if (active && /\b(contact (person|for)|organizer|coordinator)\b/i.test(r.notes)) add("WARN", i, "notes say contact/organizer — is there evidence they teach?");
      if (active && !VARIANT_WORDS.test(`${r.name} ${r.notes}`)) add("WARN", i, "nothing in name/notes says American / NMJL");
      if (/[\w.+-]+@[\w-]+\.[\w.]+|\d{3}[-. ]\d{3}[-. ]\d{4}/.test(r.notes)) add("WARN", i, "email/phone inside notes (would be shown publicly)");
    }

    if (kind === "events") {
      if (!isDate(r.event_date)) add("ERROR", i, `event_date must be YYYY-MM-DD (got "${r.event_date}")`);
      else if (r.event_date < today && active) add("WARN", i, `event date ${r.event_date} is already past`);
      for (const f of ["start_time", "end_time"]) if (r[f] && !/^([01]\d|2[0-3]):[0-5]\d$/.test(r[f])) add("ERROR", i, `${f} must be HH:MM (got "${r[f]}")`);
      if (r.start_time && r.end_time && r.end_time < r.start_time) add("WARN", i, "end_time is before start_time");
      if (!EVENT_TYPES.includes(r.event_type)) {
        const hint = EVENT_TYPE_HINTS[r.event_type.toLowerCase()];
        add("ERROR", i, `event_type must be one of ${EVENT_TYPES.join(", ")} (got "${r.event_type}")${hint ? ` — probably ${hint}` : ""}`);
      }
      for (const f of ["registration_url"]) if (r[f] && !isHttp(r[f])) add("ERROR", i, `${f} must be http(s) (got "${r[f]}")`);
      if (active && !r.venue) add("WARN", i, "ACTIVE event with no venue — usually NEEDS_REVIEW");
      if (active && r.venue && /^[^,\d]+,\s*[A-Z]{2}$/.test(r.venue)) add("WARN", i, `venue is only a city ("${r.venue}") — need a real venue`);
      if (active && !r.start_time) add("INFO", i, "no start_time");
      const cityKey = `${r.city}|${r.state}`.toLowerCase();
      for (const [field, pool, label] of [["club_name", batch.clubs, "club"], ["instructor_name", batch.instructors, "instructor"]]) {
        const nameVal = r[field];
        if (!nameVal) continue;
        const key = `${cityKey}|${nameVal}`.toLowerCase();
        const knownPool = known[label === "club" ? "clubs" : "instructors"];
        if (!pool.has(key) && !knownPool.has(key)) add("WARN", i, `${field} "${nameVal}" matches no ${label} row (import would leave it unlinked) — use the exact name, or leave blank`);
      }
    }

    // duplicates inside this file. The importer's row identity (slug) is
    // city + name for clubs/instructors and city + name + date for events, so
    // two rows sharing it would silently overwrite each other.
    const dupKey = kind === "events" ? `${r.city}|${r.name}|${r.event_date}`.toLowerCase() : `${r.city}|${r.name}`.toLowerCase();
    if (seen.has(dupKey)) {
      add("ERROR", i, `same ${kind === "events" ? "name and date" : "name"} as row ${records[seen.get(dupKey)]._line} in the same city — the importer keeps only one; make the names distinct`);
    } else seen.set(dupKey, i);
    if (kind === "events") {
      const prevSlug = known.eventSlugs.get(`${r.city}|${r.state}|${r.name}|${r.event_date}`.toLowerCase());
      if (prevSlug && prevSlug.venue !== r.venue) add("WARN", i, `overwrites an imported event with the same name and date but a different venue ("${prevSlug.venue}")`);
    }

    // already imported?
    const cityKey = `${r.city}|${r.state}`.toLowerCase();
    const knownKey = kind === "events" ? `${cityKey}|${r.name}|${r.event_date}|${r.venue}`.toLowerCase() : `${cityKey}|${r.name}`.toLowerCase();
    const prev = known[kind].get(knownKey);
    if (prev) {
      const changed = HEADERS[kind].filter((h) => (prev[h] ?? "") !== (r[h] ?? ""));
      add("INFO", i, changed.length === 0 ? "already imported, identical — no need to resend" : `already imported; changed fields: ${changed.join(", ")}`);
    }
  });
  return out;
}

// ------------------------------------------------------------------- main
function parseArgs(argv) {
  const a = { fix: false, strict: false };
  for (const arg of argv) {
    if (arg === "--fix") a.fix = true;
    else if (arg === "--strict") a.strict = true;
    else { const m = arg.match(/^--([a-z-]+)=(.*)$/); if (m) a[m[1]] = m[2]; }
  }
  return a;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const today = args.today ?? new Date().toISOString().slice(0, 10);
  const known = await loadKnown();
  const results = [];
  const batch = { clubs: new Map(), instructors: new Map() };
  const parsed = {};

  for (const kind of ["clubs", "instructors", "events"]) {
    const path = args[kind];
    if (!path) continue;
    const text = await readFile(path, "utf8");
    const table = parseCsv(text);
    const problems = [];
    if (table.length === 0) { results.push({ kind, path, problems: [{ level: "ERROR", row: 1, name: "", msg: "file is empty" }], count: 0 }); continue; }
    const header = table[0].values.map((h) => h.trim());
    const expected = HEADERS[kind];
    if (header.join(",") !== expected.join(",")) {
      const missing = expected.filter((h) => !header.includes(h));
      const extra = header.filter((h) => !expected.includes(h));
      const sameColumns = !missing.length && !extra.length;
      problems.push({
        level: sameColumns ? "INFO" : "ERROR",
        row: 1,
        name: "",
        msg: sameColumns
          ? "columns are in a different order than the template (fine: the importer reads columns by name)"
          : `header differs from the template${missing.length ? `; missing: ${missing.join(", ")}` : ""}${extra.length ? `; unexpected: ${extra.join(", ")}` : ""}`,
      });
    }
    const records = [];
    for (const { line, values } of table.slice(1)) {
      if (values.length !== header.length) {
        problems.push({ level: "ERROR", row: line, name: values[0] ?? "", msg: `has ${values.length} fields, header has ${header.length} — a comma or a column is missing/extra, so every field after it is shifted` });
        continue;
      }
      const rec = Object.fromEntries(header.map((h, i) => [h, values[i].trim()]));
      rec._line = line;
      records.push(rec);
    }
    parsed[kind] = { header, records, expected };
    if (kind !== "events") for (const r of records) batch[kind].set(`${r.city}|${r.state}|${r.name}`.toLowerCase(), r);
    results.push({ kind, path, problems, count: records.length });
  }

  for (const res of results) {
    const p = parsed[res.kind];
    if (!p) continue;
    res.problems.push(...checkRows(res.kind, p.records, null, known, today, batch));
  }

  let errors = 0, warns = 0;
  for (const res of results) {
    console.log(`\n${basename(res.path)} — ${res.count} row(s)`);
    const order = { ERROR: 0, WARN: 1, INFO: 2 };
    const sorted = [...res.problems].sort((a, b) => order[a.level] - order[b.level] || a.row - b.row);
    if (sorted.length === 0) console.log("  no problems found");
    for (const pr of sorted) {
      console.log(`  ${pr.level.padEnd(5)} line ${pr.row}${pr.name ? ` (${pr.name})` : ""}: ${pr.msg}`);
      if (pr.level === "ERROR") errors++;
      if (pr.level === "WARN") warns++;
    }
  }

  if (args.fix) {
    if (!args["out-dir"]) { console.error("\n--fix needs --out-dir=DIR"); process.exit(2); }
    await mkdir(args["out-dir"], { recursive: true });
    for (const res of results) {
      const p = parsed[res.kind];
      if (!p) continue;
      const cleaned = p.records.map((r) => {
        const c = { ...r };
        for (const f of BOOLS[res.kind]) c[f] = c[f] === "" ? "FALSE" : c[f].toUpperCase();
        if (/^\$?\d+(\.\d+)?$/.test(c.price)) c.price = c.price.replace(/^\$/, "").replace(/^(\d+)\.0+$/, "$1");
        delete c._line;
        return c;
      });
      const target = join(args["out-dir"], basename(res.path));
      await writeFile(target, toCsv(p.expected, cleaned));
      console.log(`\nwrote ${target} (mechanical fixes only; rows with a wrong field count were skipped)`);
    }
  }

  console.log(`\n${errors} error(s), ${warns} warning(s).`);
  if (errors > 0 || (args.strict && warns > 0)) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(2); });
