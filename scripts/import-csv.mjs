#!/usr/bin/env node
// Converts researcher-filled CSVs (data/templates/README.md format) into a
// SQL file that can be applied with `wrangler d1 execute --file=...`.
//
// Usage:
//   node scripts/import-csv.mjs \
//     --clubs=data/collected/dallas-clubs.csv \
//     --instructors=data/collected/dallas-instructors.csv \
//     --events=data/collected/dallas-events.csv \
//     --out=drizzle/imports/dallas-2026-09-28.sql
//
// Any of --clubs/--instructors/--events may be omitted. Pass --dry-run to
// validate and print a report without writing the SQL file.
//
// Why this doesn't touch the database directly: the D1 binding only exists
// inside the Workers runtime (see src/lib/db.ts), so a plain Node script
// can't query it. Instead this generates SQL — including subqueries that
// resolve City/Club/Instructor foreign keys by name at execution time —
// which you then run through wrangler.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const VALID_STATUS = ["ACTIVE", "INACTIVE", "NEEDS_REVIEW"];
const VALID_EVENT_TYPE = ["OPEN_PLAY", "TOURNAMENT", "SOCIAL", "LESSON", "OTHER"];

// Accepts common free-text variants a researcher might write and maps them
// onto the DB enum. See docs/DATA_COLLECTION.md for why "League" collapses
// into TOURNAMENT for now (no separate LEAGUE type yet).
const EVENT_TYPE_ALIASES = {
  "open play": "OPEN_PLAY",
  "supervised play": "OPEN_PLAY",
  tournament: "TOURNAMENT",
  league: "TOURNAMENT",
  "competitive league": "TOURNAMENT",
  social: "SOCIAL",
  lesson: "LESSON",
  "lesson series": "LESSON",
  "beginner lesson series": "LESSON",
  other: "OTHER",
};

const CLUB_BOOL_COLUMNS = [
  "beginner_friendly",
  "lessons_available",
  "open_play",
  "social_play",
  "women_only",
  "free",
];
const INSTRUCTOR_BOOL_COLUMNS = [
  "private_lesson",
  "group_lesson",
  "online_lesson",
  "beginner_lesson",
];
function parseArgs(argv) {
  const args = { dryRun: false };
  for (const arg of argv) {
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    const match = arg.match(/^--([a-z]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

function parseCSV(content) {
  // Strip a UTF-8 BOM if present (common from Excel/Sheets exports) — left
  // in place it would attach itself to the first header name and silently
  // break every lookup of that column.
  const withoutBom = content.replace(/^﻿/, "");
  const lines = withoutBom.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return { header: [], rows: [] };

  function parseLine(line) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          cur += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        result.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }

  const header = parseLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line, index) => {
    const values = parseLine(line);
    const row = {};
    header.forEach((h, i) => (row[h] = (values[i] ?? "").trim()));
    return { rowNumber: index + 2, data: row, fieldCount: values.length }; // +2: header is line 1
  });
  return { header, rows };
}

// A row with more or fewer fields than the header means a stray or missing
// comma, which silently shifts every later column. Never import those.
function checkFieldCount(header, fieldCount, ctx, issues) {
  if (fieldCount !== header.length) {
    issues.errors.push(
      `${ctx}: has ${fieldCount} fields but the header has ${header.length} — columns are shifted; fix the row (scripts/validate-csv.mjs shows where)`,
    );
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}

function sqlBool(value) {
  return value ? "1" : "0";
}

/**
 * Blank -> { value: false, wasBlank: true } (normalized per
 * docs/DATA_COLLECTION.md: absence of a clear statement means FALSE).
 * Anything other than TRUE/FALSE (case-insensitive) is a hard error.
 */
function parseBool(raw, field, ctx, issues) {
  const trimmed = raw.trim();
  if (trimmed === "") {
    issues.warnings.push(`${ctx}: "${field}" was blank — treated as FALSE`);
    return false;
  }
  const upper = trimmed.toUpperCase();
  if (upper === "TRUE") return true;
  if (upper === "FALSE") return false;
  issues.errors.push(
    `${ctx}: "${field}" must be TRUE or FALSE, got "${raw}"`,
  );
  return false;
}

/**
 * Extracts a single numeric price. If the source text is anything beyond a
 * bare number (currency symbol aside), the full original text is returned
 * as `note` so it can be preserved in a free-text field (Club.schedule,
 * Instructor.notes) instead of being silently dropped.
 */
function parsePrice(raw) {
  const trimmed = raw.trim();
  if (trimmed === "") return { price: null, note: null };

  const bareNumber = /^\$?\s*([0-9]+(?:\.[0-9]+)?)\s*$/;
  const bareMatch = trimmed.match(bareNumber);
  if (bareMatch) {
    return { price: Number(bareMatch[1]), note: null };
  }

  const looseMatch = trimmed.match(/([0-9]+(?:\.[0-9]+)?)/);
  return {
    price: looseMatch ? Number(looseMatch[1]) : null,
    note: trimmed,
  };
}

function requireField(row, field, ctx, issues) {
  if (!row[field] || row[field].trim() === "") {
    issues.errors.push(`${ctx}: "${field}" is required but blank`);
    return false;
  }
  return true;
}

function checkDate(value, field, ctx, issues) {
  if (value.trim() === "") {
    issues.errors.push(`${ctx}: "${field}" is required but blank`);
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    issues.errors.push(
      `${ctx}: "${field}" must be YYYY-MM-DD, got "${value}"`,
    );
  }
}

function mergeNote(existing, addition, label) {
  if (!addition) return existing || null;
  const line = label ? `${label}: ${addition}` : addition;
  if (!existing) return line;
  if (existing.includes(addition)) return existing;
  return `${existing} ${line}`;
}

function citySubquery(city, state) {
  return `(SELECT id FROM City WHERE name = ${sqlString(city)} AND state = ${sqlString(state)})`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const issues = { errors: [], warnings: [] };
  const statements = [];

  // Tracks name -> slug within this run, so Event rows can link to a Club
  // or Instructor imported in the same batch without a DB round trip.
  const clubSlugsByCityAndName = new Map();
  const instructorSlugsByCityAndName = new Map();

  if (args.clubs) {
    const content = await readFile(args.clubs, "utf8");
    const { header, rows } = parseCSV(content);
    for (const { rowNumber, data, fieldCount } of rows) {
      const ctx = `clubs.csv:${rowNumber} (${data.name || "unnamed"})`;
      checkFieldCount(header, fieldCount, ctx, issues);
      requireField(data, "name", ctx, issues);
      requireField(data, "city", ctx, issues);
      requireField(data, "state", ctx, issues);
      const status = data.status.trim().toUpperCase();
      if (!VALID_STATUS.includes(status)) {
        issues.errors.push(
          `${ctx}: "status" must be one of ${VALID_STATUS.join(", ")}, got "${data.status}"`,
        );
      }
      if (data.source_url.trim() === "" && status !== "NEEDS_REVIEW") {
        issues.errors.push(
          `${ctx}: "source_url" is required unless status is NEEDS_REVIEW`,
        );
      } else if (data.source_url.trim() === "") {
        issues.warnings.push(`${ctx}: no source_url (status is NEEDS_REVIEW)`);
      }
      checkDate(data.last_verified_at, "last_verified_at", ctx, issues);

      const bools = {};
      for (const col of CLUB_BOOL_COLUMNS) {
        bools[col] = parseBool(data[col] ?? "", col, ctx, issues);
      }

      const { price, note: priceNote } = parsePrice(data.price ?? "");
      const schedule = mergeNote(data.schedule || null, priceNote, "Price");

      if (issues.errors.length > 0) continue;

      const citySlug = slugify(data.city);
      const nameSlug = slugify(data.name);
      const slug = `${citySlug}-${nameSlug}`;
      clubSlugsByCityAndName.set(
        `${data.city.toLowerCase()}|${data.state.toLowerCase()}|${data.name.toLowerCase()}`,
        slug,
      );

      const columns = [
        "id",
        "name",
        "slug",
        "description",
        "cityId",
        "address",
        "website",
        "phone",
        "email",
        "latitude",
        "longitude",
        "beginnerFriendly",
        "lessonsAvailable",
        "openPlay",
        "socialPlay",
        "womenOnly",
        "free",
        "price",
        "schedule",
        "sourceUrl",
        "lastVerifiedAt",
        "status",
      ];
      const values = [
        sqlString(`club_${slug}`),
        sqlString(data.name),
        sqlString(slug),
        sqlString(data.description || null),
        citySubquery(data.city, data.state),
        sqlString(data.address || null),
        sqlString(data.website || null),
        sqlString(data.phone || null),
        sqlString(data.email || null),
        data.latitude ? sqlNumber(data.latitude) : "NULL",
        data.longitude ? sqlNumber(data.longitude) : "NULL",
        sqlBool(bools.beginner_friendly),
        sqlBool(bools.lessons_available),
        sqlBool(bools.open_play),
        sqlBool(bools.social_play),
        sqlBool(bools.women_only),
        sqlBool(bools.free),
        sqlNumber(price),
        sqlString(schedule),
        sqlString(data.source_url || null),
        sqlString(data.last_verified_at),
        sqlString(status),
      ];

      const updateSet = columns
        .filter((c) => c !== "id" && c !== "slug")
        .map((c) => `"${c}" = excluded."${c}"`)
        .concat(`"updatedAt" = CURRENT_TIMESTAMP`)
        .join(", ");

      statements.push(
        `INSERT INTO "Club" (${columns.map((c) => `"${c}"`).join(", ")})\n` +
          `VALUES (${values.join(", ")})\n` +
          `ON CONFLICT("slug") DO UPDATE SET ${updateSet};`,
      );
    }
  }

  if (args.instructors) {
    const content = await readFile(args.instructors, "utf8");
    const { header, rows } = parseCSV(content);
    for (const { rowNumber, data, fieldCount } of rows) {
      const ctx = `instructors.csv:${rowNumber} (${data.name || "unnamed"})`;
      checkFieldCount(header, fieldCount, ctx, issues);
      requireField(data, "name", ctx, issues);
      requireField(data, "city", ctx, issues);
      requireField(data, "state", ctx, issues);
      const status = data.status.trim().toUpperCase();
      if (!VALID_STATUS.includes(status)) {
        issues.errors.push(
          `${ctx}: "status" must be one of ${VALID_STATUS.join(", ")}, got "${data.status}"`,
        );
      }
      if (data.source_url.trim() === "" && status !== "NEEDS_REVIEW") {
        issues.errors.push(
          `${ctx}: "source_url" is required unless status is NEEDS_REVIEW`,
        );
      } else if (data.source_url.trim() === "") {
        issues.warnings.push(`${ctx}: no source_url (status is NEEDS_REVIEW)`);
      }
      checkDate(data.last_verified_at, "last_verified_at", ctx, issues);

      const bools = {};
      for (const col of INSTRUCTOR_BOOL_COLUMNS) {
        bools[col] = parseBool(data[col] ?? "", col, ctx, issues);
      }

      const { price, note: priceNote } = parsePrice(data.price ?? "");
      const notes = mergeNote(data.notes || null, priceNote, "Price");

      if (issues.errors.length > 0) continue;

      const citySlug = slugify(data.city);
      const nameSlug = slugify(data.name);
      const slug = `${citySlug}-${nameSlug}`;
      instructorSlugsByCityAndName.set(
        `${data.city.toLowerCase()}|${data.state.toLowerCase()}|${data.name.toLowerCase()}`,
        slug,
      );

      const columns = [
        "id",
        "name",
        "slug",
        "cityId",
        "website",
        "contact",
        "privateLesson",
        "groupLesson",
        "onlineLesson",
        "beginnerLesson",
        "price",
        "notes",
        "sourceUrl",
        "lastVerifiedAt",
        "status",
      ];
      const values = [
        sqlString(`instructor_${slug}`),
        sqlString(data.name),
        sqlString(slug),
        citySubquery(data.city, data.state),
        sqlString(data.website || null),
        sqlString(data.contact || null),
        sqlBool(bools.private_lesson),
        sqlBool(bools.group_lesson),
        sqlBool(bools.online_lesson),
        sqlBool(bools.beginner_lesson),
        sqlNumber(price),
        sqlString(notes),
        sqlString(data.source_url || null),
        sqlString(data.last_verified_at),
        sqlString(status),
      ];

      const updateSet = columns
        .filter((c) => c !== "id" && c !== "slug")
        .map((c) => `"${c}" = excluded."${c}"`)
        .concat(`"updatedAt" = CURRENT_TIMESTAMP`)
        .join(", ");

      statements.push(
        `INSERT INTO "Instructor" (${columns.map((c) => `"${c}"`).join(", ")})\n` +
          `VALUES (${values.join(", ")})\n` +
          `ON CONFLICT("slug") DO UPDATE SET ${updateSet};`,
      );
    }
  }

  if (args.events) {
    const content = await readFile(args.events, "utf8");
    const { header, rows } = parseCSV(content);
    for (const { rowNumber, data, fieldCount } of rows) {
      const ctx = `events.csv:${rowNumber} (${data.name || "unnamed"})`;
      checkFieldCount(header, fieldCount, ctx, issues);
      requireField(data, "name", ctx, issues);
      requireField(data, "city", ctx, issues);
      requireField(data, "state", ctx, issues);
      checkDate(data.event_date, "event_date", ctx, issues);
      const status = data.status.trim().toUpperCase();
      if (!VALID_STATUS.includes(status)) {
        issues.errors.push(
          `${ctx}: "status" must be one of ${VALID_STATUS.join(", ")}, got "${data.status}"`,
        );
      }
      if (data.source_url.trim() === "" && status !== "NEEDS_REVIEW") {
        issues.errors.push(
          `${ctx}: "source_url" is required unless status is NEEDS_REVIEW`,
        );
      } else if (data.source_url.trim() === "") {
        issues.warnings.push(`${ctx}: no source_url (status is NEEDS_REVIEW)`);
      }
      checkDate(data.last_verified_at, "last_verified_at", ctx, issues);

      const rawType = (data.event_type || "").trim();
      let eventType = rawType.toUpperCase();
      if (!VALID_EVENT_TYPE.includes(eventType)) {
        const alias = EVENT_TYPE_ALIASES[rawType.toLowerCase()];
        if (alias) {
          eventType = alias;
          issues.warnings.push(
            `${ctx}: "event_type" "${rawType}" mapped to ${alias}`,
          );
        } else {
          issues.errors.push(
            `${ctx}: "event_type" "${rawType}" is not a known value or alias — use one of ${VALID_EVENT_TYPE.join(", ")}`,
          );
        }
      }

      const beginnerFriendly = parseBool(
        data.beginner_friendly ?? "",
        "beginner_friendly",
        ctx,
        issues,
      );
      const { price } = parsePrice(data.price ?? "");

      const cityKey = `${data.city.toLowerCase()}|${data.state.toLowerCase()}`;
      let clubIdSql = "NULL";
      if (data.club_name && data.club_name.trim() !== "") {
        const key = `${cityKey}|${data.club_name.toLowerCase()}`;
        const knownSlug = clubSlugsByCityAndName.get(key);
        clubIdSql = knownSlug
          ? `(SELECT id FROM Club WHERE slug = ${sqlString(knownSlug)})`
          : `(SELECT id FROM Club WHERE name = ${sqlString(data.club_name)} AND cityId = ${citySubquery(data.city, data.state)})`;
      }
      let instructorIdSql = "NULL";
      if (data.instructor_name && data.instructor_name.trim() !== "") {
        const key = `${cityKey}|${data.instructor_name.toLowerCase()}`;
        const knownSlug = instructorSlugsByCityAndName.get(key);
        instructorIdSql = knownSlug
          ? `(SELECT id FROM Instructor WHERE slug = ${sqlString(knownSlug)})`
          : `(SELECT id FROM Instructor WHERE name = ${sqlString(data.instructor_name)} AND cityId = ${citySubquery(data.city, data.state)})`;
      }

      if (issues.errors.length > 0) continue;

      const citySlug = slugify(data.city);
      const nameSlug = slugify(data.name);
      const dateSlug = (data.event_date || "").replace(/-/g, "");
      const slug = `${citySlug}-${nameSlug}-${dateSlug}`;

      const columns = [
        "id",
        "name",
        "slug",
        "eventDate",
        "startTime",
        "endTime",
        "venue",
        "cityId",
        "clubId",
        "instructorId",
        "eventType",
        "beginnerFriendly",
        "price",
        "registrationUrl",
        "sourceUrl",
        "lastVerifiedAt",
        "status",
      ];
      const values = [
        sqlString(`event_${slug}`),
        sqlString(data.name),
        sqlString(slug),
        sqlString(`${data.event_date} 00:00:00`),
        sqlString(data.start_time || null),
        sqlString(data.end_time || null),
        sqlString(data.venue || null),
        citySubquery(data.city, data.state),
        clubIdSql,
        instructorIdSql,
        sqlString(eventType),
        sqlBool(beginnerFriendly),
        sqlNumber(price),
        sqlString(data.registration_url || null),
        sqlString(data.source_url || null),
        sqlString(data.last_verified_at),
        sqlString(status),
      ];

      const updateSet = columns
        .filter((c) => c !== "id" && c !== "slug")
        .map((c) => `"${c}" = excluded."${c}"`)
        .concat(`"updatedAt" = CURRENT_TIMESTAMP`)
        .join(", ");

      statements.push(
        `INSERT INTO "Event" (${columns.map((c) => `"${c}"`).join(", ")})\n` +
          `VALUES (${values.join(", ")})\n` +
          `ON CONFLICT("slug") DO UPDATE SET ${updateSet};`,
      );
    }
  }

  if (issues.warnings.length > 0) {
    console.log(`\n${issues.warnings.length} warning(s):`);
    for (const w of issues.warnings) console.log(`  - ${w}`);
  }

  if (issues.errors.length > 0) {
    console.error(`\n${issues.errors.length} error(s) — fix these and re-run:`);
    for (const e of issues.errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n${statements.length} row(s) validated OK.`);

  if (args.dryRun) {
    console.log("(dry run — no SQL file written)");
    return;
  }

  if (!args.out) {
    console.error("Missing --out=<path>.sql (or pass --dry-run)");
    process.exitCode = 1;
    return;
  }

  await mkdir(dirname(args.out), { recursive: true });
  await writeFile(args.out, statements.join("\n\n") + "\n", "utf8");
  console.log(`Wrote ${args.out}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
