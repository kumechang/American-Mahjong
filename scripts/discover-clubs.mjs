#!/usr/bin/env node
// Club discovery crawler. Reads a rotating batch of city pages from the Bam Good Time
// club directory (bamgoodtime.com/mahjong-clubs/<city>-<st>), finds club sites
// (<club>.bamgoodtime.com) that are not on our site yet, reads each club's home page and
// events, and writes researcher-style CSVs (clubs.csv + events.csv, everything NEEDS_REVIEW)
// to data/inbox/<id>/<city-slug>/ with a report that quotes what the club says about
// American / NMJL play. Nothing is trusted automatically: a person (or the research
// server) confirms the variant before a row becomes ACTIVE. Never writes to the database.
//
//   node scripts/discover-clubs.mjs [--batch=25] [--offset=N] [--out-dir=data/inbox/discover-…]
//
// The batch rotates with the day of the year (1,000+ city pages, 25 a day, so a full
// pass takes about seven weeks). Needs the local D1. Exit code 3 = nothing new.

import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { arg, today, q, get, lines, decode, csvCell, pages, bamGoodTime, OTHER_STYLES } from "./lib/crawl-lib.mjs";

const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const outDir = arg("out-dir") ?? `data/inbox/discover-${stamp}`;
const batch = Number(arg("batch") ?? 25);
const MAX_NEW_CLUBS = 40;
const slugify = (t) => String(t).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// ---------- what we already have ----------
const knownOrigins = new Set();
const knownNames = new Set();
for (const t of ["Club", "Instructor"]) {
  for (const r of q(`SELECT name, website, sourceUrl FROM ${t}`)) {
    knownNames.add(norm(r.name));
    for (const u of [r.website, r.sourceUrl]) {
      try { if (u) knownOrigins.add(new URL(u).origin.toLowerCase()); } catch { /* not a URL */ }
    }
  }
}
// leads an earlier run already archived (cities not on the site yet never reach the database)
if (existsSync("data/inbox")) {
  for (const d of readdirSync("data/inbox").filter((x) => x.startsWith("discover-"))) {
    for (const c of readdirSync(`data/inbox/${d}`, { withFileTypes: true }).filter((x) => x.isDirectory())) {
      const f = `data/inbox/${d}/${c.name}/clubs.csv`;
      if (!existsSync(f)) continue;
      for (const m of readFileSync(f, "utf8").matchAll(/https:\/\/[a-z0-9-]+\.bamgoodtime\.com/g)) knownOrigins.add(m[0].toLowerCase());
    }
  }
}
const ourCities = new Set(q(`SELECT name, state FROM City`).map((c) => `${norm(c.name)}|${c.state}`));

// ---------- the directory ----------
const index = await get("https://bamgoodtime.com/mahjong-clubs");
const cityPaths = [...new Set([...index.matchAll(/href="(\/mahjong-clubs\/[a-z0-9-]+-[a-z]{2})"/g)].map((m) => m[1]))].sort();
const dayOfYear = Math.floor((Date.parse(today) - Date.parse(today.slice(0, 4) + "-01-01")) / 864e5) + 1;
// Fixed-size cycle (the directory grows a few pages a week, which would otherwise shift every window):
// each day reads its own slice, and the slices repeat every span/batch days.
const span = Math.ceil(cityPaths.length / 100) * 100;
const start = arg("offset") != null ? Number(arg("offset")) : (dayOfYear * batch) % span;
const todays = cityPaths.slice(start, start + batch);

const SKIP_SUB = new Set(["www", "shop", "app", "api", "blog", "mahjic"]);
const leads = []; // {club, city, state, origin, american, events:[...]}
let checkedCities = 0;
for (const path of todays) {
  if (leads.length >= MAX_NEW_CLUBS) break;
  let html;
  try { html = await get(`https://bamgoodtime.com${path}`); } catch (e) { continue; }
  checkedCities++;
  const st = path.slice(-2).toUpperCase();
  const t = decode((html.match(/<title>([^<]*)<\/title>/i) ?? [])[1] ?? "").match(/^Mahjong Clubs in (.+?)\s*,\s*[A-Z]{2}\b/);
  const city = t ? t[1].trim() : path.split("/").pop().replace(/-[a-z]{2}$/, "").replace(/-/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const origins = [...new Set([...html.matchAll(/https:\/\/([a-z0-9-]+)\.bamgoodtime\.com/g)].filter((m) => !SKIP_SUB.has(m[1])).map((m) => m[0].toLowerCase()))];
  for (const origin of origins) {
    if (knownOrigins.has(origin) || leads.some((l) => l.origin === origin) || leads.length >= MAX_NEW_CLUBS) continue;
    let home = "";
    try { home = await get(origin); } catch { continue; }
    const title = decode((home.match(/<title>([^<]*)<\/title>/i) ?? [])[1] ?? "");
    const name = title.split(/\s[—–|-]\s/)[0].trim();
    if (!name || knownNames.has(norm(name))) continue;
    const text = lines(home);
    const metaDesc = decode((home.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ?? [])[1] ?? "").trim();
    const desc = /bam good time/i.test(metaDesc) ? "" : metaDesc;
    // the platform's own boilerplate ("American Mahjong club in … on Bam Good Time") is not the club's word
    const own = (l) => !/bam good time|find your club|start a club/i.test(l);
    const evidence = text.find((l) => own(l) && /american mah|nmjl|national mah ?jongg league|american-style/i.test(l) && l.length < 260) ?? "";
    const other = OTHER_STYLES.test(`${name} ${desc}`);
    let events = [];
    try { events = (await bamGoodTime(origin)).filter((e) => e.date >= today); } catch { /* no events page */ }
    leads.push({ name, city, state: st, origin, desc, evidence, other, events, beginner: /beginner|learn|101|new to/i.test(`${desc} ${text.join(" ")}`.slice(0, 4000)) });
  }
}

// A lead is worth a PR when it is in a city we already cover, or the club itself says it plays
// American / NMJL, or it already lists dated sessions. The rest is only named in the summary.
const strong = (l) => ourCities.has(`${norm(l.city)}|${l.state}`) || l.evidence || l.events.length > 0;
const weakLeads = leads.filter((l) => !strong(l));
leads.splice(0, leads.length, ...leads.filter(strong));
const weakSummary = weakLeads.length ? `\n- Other new clubs (no American wording, no sessions, city not on the site): ${weakLeads.map((l) => `${l.name} (${l.city}, ${l.state})`).join("; ")}` : "";

if (leads.length === 0) {
  console.log(`# Club discovery ${today}\n\n- City pages read: ${checkedCities} (offset ${start})\n- New clubs worth a look: 0${weakSummary}`);
  process.exit(3);
}

// ---------- write ----------
const CLUB_H = "name,city,state,description,address,website,phone,email,latitude,longitude,beginner_friendly,lessons_available,open_play,social_play,women_only,free,price,schedule,source_url,last_verified_at,status".split(",");
const EVENT_H = "name,city,state,event_date,start_time,end_time,venue,club_name,instructor_name,event_type,beginner_friendly,price,registration_url,source_url,last_verified_at,status".split(",");
const byCity = new Map();
for (const l of leads) {
  const key = `${slugify(l.city)}-${l.state.toLowerCase()}`;
  if (!byCity.has(key)) byCity.set(key, []);
  byCity.get(key).push(l);
}
const summary = [];
for (const [key, list] of byCity) {
  const dir = `${outDir}/${key}`;
  mkdirSync(dir, { recursive: true });
  const clubRows = list.filter((l) => !l.other).map((l) => ({
    name: l.name, city: l.city, state: l.state,
    description: [l.desc, l.evidence ? `Site says: "${l.evidence}"` : "American/NMJL not stated on the club's page."].filter(Boolean).join(" ").slice(0, 600),
    address: "", website: l.origin, phone: "", email: "", latitude: "", longitude: "",
    beginner_friendly: l.beginner ? "TRUE" : "FALSE", lessons_available: l.beginner ? "TRUE" : "FALSE", open_play: "FALSE", social_play: "TRUE", women_only: "FALSE", free: "FALSE", price: "",
    schedule: l.events.length ? `${l.events.length} upcoming session(s) listed, next ${l.events[0].date}` : "No upcoming sessions listed",
    source_url: l.origin, last_verified_at: today, status: "NEEDS_REVIEW",
  }));
  writeFileSync(`${dir}/clubs.csv`, [CLUB_H.join(","), ...clubRows.map((r) => CLUB_H.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
  const eventRows = list.filter((l) => !l.other).flatMap((l) => l.events.map((e) => ({
    name: e.name, city: l.city, state: l.state, event_date: e.date, start_time: e.time, end_time: "", venue: e.venue, club_name: l.name, instructor_name: "",
    event_type: e.type, beginner_friendly: e.type === "LESSON" && /101|beginner|intro|learn/i.test(e.name) ? "TRUE" : "FALSE", price: e.price ?? "",
    registration_url: e.url, source_url: e.url, last_verified_at: today, status: "NEEDS_REVIEW",
  })));
  if (eventRows.length) writeFileSync(`${dir}/events.csv`, [EVENT_H.join(","), ...eventRows.map((r) => EVENT_H.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
  const known = ourCities.has(`${norm(list[0].city)}|${list[0].state}`);
  writeFileSync(
    `${dir}/report.md`,
    `# ${list[0].city}, ${list[0].state}: club discovery (${today})\n\n${known ? "This city is already on the site." : "**This city is not on the site yet** (and may be a suburb of a larger metro: check which metro page it belongs to)."}\n\n## Clubs found on Bam Good Time\n${list.map((l) => `- ${l.name} (${l.origin}): ${l.other ? "skipped, other style named" : l.evidence ? `says: "${l.evidence}"` : "American/NMJL not stated"}; ${l.events.length} upcoming event(s)`).join("\n")}\n\n## Next step\nConfirm American / NMJL on each club's own page, then promote to ACTIVE. Rows here are NEEDS_REVIEW by design.\n`,
  );
  summary.push(`- ${list[0].city}, ${list[0].state}${known ? "" : " (new place)"}: ${list.map((l) => `${l.name}${l.evidence ? " [American stated]" : ""} ${l.events.length}ev`).join("; ")}`);
}
console.log(`# Club discovery ${today}\n\n- City pages read: ${checkedCities} (offset ${start} of ${cityPaths.length})\n- Pages fetched: ${pages()}\n- New clubs: ${leads.length} in ${byCity.size} places\n${summary.join("\n")}\n${weakSummary}\n- Output: ${outDir}`);
process.exit(0);
