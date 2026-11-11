#!/usr/bin/env node
// Sorts the rows of AI inbox runs (clubs.csv / instructors.csv / events.csv) against the database and drafts the migration,
// so the review is "check the table" instead of "read every CSV".
//
//   node scripts/inbox-draft.mjs --runs=2026-11-11-0003,2026-11-10-1711   folders under data/inbox (nested layout is fine)
//   node scripts/inbox-draft.mjs --branches                                every open origin/inbox/* branch (fetched into a temp dir)
//   node scripts/inbox-draft.mjs --runs=... --no-verify                    skip the quote check (no network)
//   node scripts/inbox-draft.mjs --runs=... --out=/tmp/draft               write draft.md + draft.sql + CSVs there
//
// Each owner row lands in exactly one class:
//   PROMOTE  the site already has this owner (matched by own-site host or name) as NEEDS_REVIEW and the row is ACTIVE with a quote
//   NEW      not on the site yet, city is on the site, row is ACTIVE with a quote
//   DUP      the site already has it ACTIVE (nothing to do)  /  DUP-OF: the report says it duplicates another owner
//   RETIRE   the row says INACTIVE and the site has it ACTIVE or NEEDS_REVIEW
//   LEAD     not on the site and not ACTIVE: goes in as NEEDS_REVIEW (a lead), nothing is published
//   KNOWN    not ACTIVE, and the site already has it (as NEEDS_REVIEW / INACTIVE): left alone
//   HOLD     ACTIVE in the CSV, but a rule blocks it (see "why"): no quote / quote not found on the page / member-only wording /
//            private-home venue / city not on the site / skip list / directory-only source
// Quotes (20+ characters, in "..." inside description / notes / schedule) that mention American / NMJL are fetched from the
// row's own pages and compared as plain words: found = verified. Not found, or page unreadable, means HOLD.
// Nothing is written to the database; draft.sql is only a starting point for the numbered migration, and a person still
// decides on city publication, intros and anything under HOLD.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { arg, q, parseCsv, csvCell, closeBrowser, venueOk } from "./lib/crawl-lib.mjs";
import { pageText, quoteFound, quotesIn, AMERICAN_WORDING } from "./lib/quote-check.mjs";

const verify = !process.argv.includes("--no-verify");
const outDir = arg("out") ?? mkdtempSync(join(tmpdir(), "inbox-draft-"));
mkdirSync(outDir, { recursive: true });

// ---------- inputs ----------
const roots = []; // [{run, dir}]
if (arg("runs")) for (const r of arg("runs").split(",").map((x) => x.trim()).filter(Boolean)) roots.push({ run: r, dir: join("data/inbox", r) });
if (process.argv.includes("--branches") || roots.length === 0) {
  const heads = execFileSync("git", ["ls-remote", "--heads", "origin", "inbox/*"], { encoding: "utf8" }).split("\n").filter(Boolean).map((l) => l.split("\t")[1].replace("refs/heads/", ""));
  const tmp = mkdtempSync(join(tmpdir(), "inbox-branches-"));
  for (const b of heads) {
    try {
      execFileSync("git", ["fetch", "-q", "origin", b], { stdio: "ignore" });
      const dir = join(tmp, b.replace(/\//g, "_"));
      mkdirSync(dir, { recursive: true });
      const tar = execFileSync("git", ["archive", "FETCH_HEAD", "data/inbox"], { maxBuffer: 200e6 });
      execFileSync("tar", ["-x", "-C", dir], { input: tar });
      roots.push({ run: b.replace(/^inbox\//, ""), dir: join(dir, "data/inbox") });
    } catch (e) { console.error(`skip ${b}: ${e.message.split("\n")[0]}`); }
  }
}
if (roots.length === 0) { console.error("no inbox runs found (use --runs=<folder,...> or --branches)"); process.exit(3); }

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const read = (p) => parseCsv(readFileSync(p, "utf8").replace(/^﻿/, ""));
const found = { clubs: [], instructors: [], events: [], reports: [] };
for (const { run, dir } of roots) {
  for (const p of walk(dir)) {
    const f = basename(p);
    if (f === "report.md") { found.reports.push({ run, path: p, text: readFileSync(p, "utf8") }); continue; }
    const kind = { "clubs.csv": "clubs", "instructors.csv": "instructors", "events.csv": "events" }[f];
    if (!kind) continue;
    const folder = basename(dirname(p));
    for (const r of read(p)) found[kind].push({ ...r, _run: run, _folder: folder });
  }
}

// ---------- database ----------
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\b(the|mahjong|mah jongg|mahjongg|mah jong|mahj|club|llc|inc)\b/g, " ").replace(/\s+/g, " ").trim();
const SHARED_HOST = /(^|\.)(bamgoodtime\.com|eventbrite\.[a-z.]+|meetup\.com|facebook\.com|instagram\.com|linktr\.ee|bookwhen\.com|calendly\.com|simpletix\.com|tickettailor\.com|active\.com|mahjong4friends\.com|bambuddies\.org|mahjonggmaven\.com|orderofthetile\.com|youtube\.com|google\.com|substack\.com|axios\.com|patch\.com)$/i;
const hostOf = (u) => { try { const h = new URL(u).hostname.replace(/^www\./, ""); return SHARED_HOST.test(h) ? null : h; } catch { return null; } };
const DIRECTORY = /bamgoodtime\.com\/(clubs|mahjong-clubs)|bambuddies|orderofthetile|mahjonggmaven|mahjong4friends|americanmahjonggassociation|wherethewindsblow|facebook\.com|instagram\.com/i;

const cities = q(`SELECT name, state, slug, published FROM City`);
const cityByKey = new Map(cities.map((c) => [`${c.name.toLowerCase()}|${c.state}`, c]));
const owners = [
  ...q(`SELECT x.slug, x.name, x.website, x.sourceUrl, x.status, c.name AS city, c.state, c.slug AS citySlug, 'club' AS type FROM Club x JOIN City c ON c.id = x.cityId`),
  ...q(`SELECT x.slug, x.name, x.website, x.sourceUrl, x.status, c.name AS city, c.state, c.slug AS citySlug, 'instructor' AS type FROM Instructor x JOIN City c ON c.id = x.cityId`),
];
const byHost = new Map(), byName = new Map();
for (const o of owners) {
  for (const u of [o.website, o.sourceUrl]) { const h = hostOf(u); if (h && !byHost.has(`${o.type}|${h}`)) byHost.set(`${o.type}|${h}`, o); }
  const k = `${o.type}|${norm(o.name)}`;
  if (norm(o.name) && !byName.has(k)) byName.set(k, o);
}
const dbEvents = new Set(q(`SELECT lower(coalesce(c.name, i.name, '')) AS owner, e.eventDate AS d, coalesce(e.startTime, '') AS t FROM Event e LEFT JOIN Club c ON c.id = e.clubId LEFT JOIN Instructor i ON i.id = e.instructorId WHERE e.eventDate >= date('now', '-1 day')`).map((e) => `${norm(e.owner)}|${e.d}|${e.t}`));

const skipList = existsSync("data/promote-skip.txt") ? readFileSync("data/promote-skip.txt", "utf8").split("\n").map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith("#")) : [];
const slugOf = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const skipped = (citySlug, name) => skipList.some((s) => s === citySlug || s === String(name).toLowerCase() || s === `${citySlug}/${String(name).toLowerCase()}`);

// "X is DUPLICATE_OF Y" lines in the reports, by owner name
const dupNames = new Set();
for (const r of found.reports) for (const l of r.text.split("\n")) {
  const m = l.match(/^\s*-\s*(.+?)\s*(?:\[(?:club|instructor)\])?\s*[—-]+\s*DUPLICATE_OF/i);
  if (m) dupNames.add(norm(m[1]));
}

const MEMBER_ONLY = /\bmembers? only\b|\bmembership (is )?required\b|\bfor members\b|\bprivate (group|club)\b|\binvitation only\b|\binvite[- ]only\b|\bmember-only\b/i;
const HOME = /\b(private )?(home|residence|house)\b.{0,30}\b(address|venue|location|host)/i;

// ---------- classify owners ----------
const rows = [];
for (const type of ["club", "instructor"]) {
  for (const r of found[type === "club" ? "clubs" : "instructors"]) {
    const status = (r.status ?? "").toUpperCase();
    const text = [r.description, r.notes, r.schedule].filter(Boolean).join(" ");
    const site = [r.website, r.source_url].find((u) => u && /^https?:\/\//.test(u) && !DIRECTORY.test(u));
    const match = byHost.get(`${type}|${hostOf(r.website)}`) ?? byHost.get(`${type}|${hostOf(r.source_url)}`) ?? byName.get(`${type}|${norm(r.name)}`);
    const city = cityByKey.get(`${(r.city ?? "").toLowerCase()}|${r.state}`);
    const row = { type, run: r._run, name: r.name, city: r.city, state: r.state, status, match, cityKnown: !!city, why: [], raw: r, site, text };
    if (dupNames.has(norm(r.name)) && !match) row.cls = "DUP-OF";
    else if (status !== "ACTIVE") {
      if (status === "INACTIVE") row.cls = match && match.status !== "INACTIVE" ? "RETIRE" : "SKIP";
      else row.cls = match ? (match.status === "ACTIVE" ? "DUP" : "KNOWN") : "LEAD";
    } else if (match?.status === "ACTIVE") row.cls = "DUP";
    else row.cls = match ? "PROMOTE" : "NEW";

    if (row.cls === "PROMOTE" || row.cls === "NEW") {
      const cs = match?.citySlug ?? slugOf(r.city ?? "");
      if (skipped(cs, r.name)) row.why.push("on promote-skip list");
      if (!row.cityKnown && !match) row.why.push(`city not on the site (${r.city}, ${r.state})`);
      if (MEMBER_ONLY.test(text)) row.why.push("member-only wording");
      if (HOME.test(text) || HOME.test(r.address ?? "")) row.why.push("possible private-home venue");
      if (!site) row.why.push("no own page (directory / social only)");
      const qs = quotesIn(text).filter((x) => AMERICAN_WORDING.test(x));
      row.quotes = qs;
      if (qs.length === 0) row.why.push("no quote of an American / NMJL sentence");
      if (row.why.length === 0 && verify) {
        const pages = [...new Set([r.website, r.source_url].filter((u) => u && /^https?:\/\//.test(u) && !DIRECTORY.test(u)))];
        let ok = false, unreadable = 0;
        for (const u of pages) {
          const t = await pageText(u);
          if (t.how === "none") { unreadable++; continue; }
          if (qs.some((x) => quoteFound(t.text, x))) { ok = true; row.verifiedOn = u; break; }
        }
        if (!ok) row.why.push(unreadable === pages.length ? "pages unreadable for the quote check (check by hand)" : "quote NOT found on the page");
      }
      if (row.why.length) row.cls = "HOLD";
    }
    rows.push(row);
  }
}

// ---------- events ----------
const promoted = new Map(rows.filter((r) => ["PROMOTE", "NEW"].includes(r.cls)).map((r) => [norm(r.name), r]));
const evRows = [];
for (const e of found.events) {
  const ownerName = e.club_name || e.instructor_name;
  const key = norm(ownerName);
  const active = owners.find((o) => norm(o.name) === key && o.status === "ACTIVE");
  const dupKey = `${key}|${e.event_date}|${e.start_time ?? ""}`;
  let cls, why = "";
  if (!ownerName) { cls = "HOLD"; why = "no owner"; }
  else if (dbEvents.has(dupKey)) cls = "DUP";
  else if ((e.status ?? "").toUpperCase() !== "ACTIVE") cls = "LEAD";
  else if (!venueOk(e.venue, e.city)) { cls = "HOLD"; why = "venue is not a place"; }
  else if (active) cls = "ADD";
  else if (promoted.has(key)) cls = "ADD";
  else { cls = "HOLD"; why = "owner is neither ACTIVE nor promoted in this batch"; }
  evRows.push({ cls, why, e, ownerName });
}

// ---------- outputs ----------
const tally = (arr) => arr.reduce((m, r) => (m[r.cls] = (m[r.cls] ?? 0) + 1, m), {});
const md = [];
md.push(`# Inbox draft (${roots.map((r) => r.run).join(", ")})`, "");
md.push(`Owners: ${JSON.stringify(tally(rows))}  ·  Events: ${JSON.stringify(tally(evRows))}  ·  quote check: ${verify ? "on" : "off"}`, "");
const order = ["PROMOTE", "NEW", "HOLD", "RETIRE", "DUP-OF", "LEAD", "KNOWN", "DUP", "SKIP"];
md.push("| class | type | name | city | matches site | why / quote |", "|---|---|---|---|---|---|");
for (const cls of order) for (const r of rows.filter((x) => x.cls === cls)) {
  const m = r.match ? `${r.match.name} (${r.match.status})` : "—";
  const detail = r.why.length ? r.why.join("; ") : r.verifiedOn ? `verified on ${r.verifiedOn}` : r.quotes?.[0] ? `“${r.quotes[0].slice(0, 90)}”` : "";
  md.push(`| ${cls} | ${r.type} | ${r.name} | ${r.city}, ${r.state} | ${m} | ${detail.replace(/\|/g, "/")} |`);
}
md.push("", "## Events", "", "| class | owner | date | time | venue | why |", "|---|---|---|---|---|---|");
for (const r of evRows.filter((x) => x.cls !== "DUP")) md.push(`| ${r.cls} | ${r.ownerName ?? ""} | ${r.e.event_date} | ${r.e.start_time ?? ""} | ${(r.e.venue ?? "").slice(0, 50)} | ${r.why} |`);

// cities that would reach five ACTIVE rows
const addByCity = new Map();
for (const r of rows.filter((x) => x.cls === "NEW" || x.cls === "PROMOTE")) { const c = r.match ? r.match.citySlug : slugOf(r.city); addByCity.set(c, (addByCity.get(c) ?? 0) + 1); }
if (addByCity.size) {
  const act = q(`SELECT c.slug, c.published, (SELECT count(*) FROM Club WHERE cityId = c.id AND status = 'ACTIVE') + (SELECT count(*) FROM Instructor WHERE cityId = c.id AND status = 'ACTIVE') + (SELECT count(*) FROM Event WHERE cityId = c.id AND status = 'ACTIVE' AND eventDate >= date('now')) AS n FROM City c`);
  md.push("", "## Cities touched", "", "| city | now | after draft | published |", "|---|---|---|---|");
  for (const [slug, add] of addByCity) { const c = act.find((x) => x.slug === slug); md.push(`| ${slug} | ${c?.n ?? "?"} | ${(c?.n ?? 0) + add}+ | ${c?.published ? "yes" : "no"} |`); }
}

// draft CSVs (+ SQL through import-csv.mjs)
const takeOwner = (r) => {
  const o = { ...r.raw };
  if (r.match) { o.name = r.match.name; o.city = r.match.city; o.state = r.match.state; }
  delete o._run; delete o._folder;
  return o;
};
const write = (name, header, list) => {
  if (!list.length) return null;
  const p = join(outDir, name);
  writeFileSync(p, [header.join(","), ...list.map((o) => header.map((h) => csvCell(o[h] ?? "")).join(","))].join("\n") + "\n");
  return p;
};
const pick = (cls, type) => rows.filter((r) => r.type === type && cls.includes(r.cls)).map(takeOwner);
const clubsCsv = write("clubs.csv", Object.keys(found.clubs[0] ?? { name: 1 }).filter((k) => !k.startsWith("_")), [...pick(["PROMOTE", "NEW"], "club"), ...pick(["LEAD"], "club").map((o) => ({ ...o, status: "NEEDS_REVIEW" }))]);
const instCsv = write("instructors.csv", Object.keys(found.instructors[0] ?? { name: 1 }).filter((k) => !k.startsWith("_")), [...pick(["PROMOTE", "NEW"], "instructor"), ...pick(["LEAD"], "instructor").map((o) => ({ ...o, status: "NEEDS_REVIEW" }))]);
const evList = evRows.filter((r) => r.cls === "ADD").map((r) => {
  const o = { ...r.e }; delete o._run; delete o._folder;
  const m = promoted.get(norm(r.ownerName)); const a = owners.find((x) => norm(x.name) === norm(r.ownerName));
  const owner = m?.match ?? a; if (owner) { o.city = owner.city; o.state = owner.state; }
  return o;
});
const evCsv = write("events.csv", Object.keys(found.events[0] ?? { name: 1 }).filter((k) => !k.startsWith("_")), evList);
const args = [clubsCsv && `--clubs=${clubsCsv}`, instCsv && `--instructors=${instCsv}`, evCsv && `--events=${evCsv}`].filter(Boolean);
let sql = "";
if (args.length) {
  try { execFileSync("node", ["scripts/import-csv.mjs", ...args, `--out=${join(outDir, "import.sql")}`], { stdio: "pipe" }); sql = readFileSync(join(outDir, "import.sql"), "utf8"); }
  catch (e) { md.push("", `⚠ import-csv.mjs failed: ${(e.stderr?.toString() || e.message).slice(0, 600)}`); }
}
const retire = rows.filter((r) => r.cls === "RETIRE" && r.match).map((r) => `-- UPDATE ${r.type === "club" ? "Club" : "Instructor"} SET status = 'INACTIVE', updatedAt = CURRENT_TIMESTAMP WHERE slug = '${r.match.slug}'; -- ${r.name}: ${r.text.slice(0, 120).replace(/\n/g, " ")}`);
writeFileSync(join(outDir, "draft.sql"), `-- Draft from inbox runs: ${roots.map((r) => r.run).join(", ")}\n-- PROMOTE / NEW / LEAD owners and ADD events go in through import.sql (upsert on slug). Retirements are commented: review, then uncomment.\n${retire.join("\n")}\n${sql}`);
writeFileSync(join(outDir, "draft.md"), md.join("\n") + "\n");
console.log(md.join("\n"));
console.log(`\nWritten to ${outDir}: draft.md, draft.sql${clubsCsv ? ", clubs.csv" : ""}${instCsv ? ", instructors.csv" : ""}${evCsv ? ", events.csv" : ""}`);
await closeBrowser();
process.exit(0);
