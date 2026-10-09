#!/usr/bin/env node
// Daily event crawler. For every club already on the site it reads the club's
// own booking page and writes the dated events we don't have yet as an inbox
// folder (data/inbox/<id>/<city-slug>/events.csv + report.md), the same shape
// the research server produces, so the usual validate -> PR -> import flow
// applies. It never writes to the database.
//
// Adapters (plain HTTP, no headless browser needed so far):
//   - Bam Good Time club sites (<club>.bamgoodtime.com): /events page
//   - Bookwhen (bookwhen.com/<account>): schedule page (event ids carry date and time)
//   - Eventbrite organizer pages (/o/…) and collections (/cc/…): upcoming events from the page's embedded data;
//     an organizer is found from any Eventbrite event page a club already links to
//   - Calendly event types (calendly.com/<profile>/<type>): open time slots from Calendly's public booking API;
//     Linktree pages are read for their Calendly links
//   - Meetup groups (meetup.com/<group>): upcoming events from the page's embedded data
//   - WordPress sites with The Events Calendar (/wp-json/tribe/events/v1/events), then anything else:
//     schema.org Event data (JSON-LD) found on the page (clubs only)
//
//   node scripts/crawl-events.mjs [--out-dir=data/inbox/crawl-YYYY-MM-DD-HHMM] [--today=YYYY-MM-DD]
//
// Needs the local D1 (`npx wrangler d1 migrations apply DB --local`).
// Exit code 3 = nothing new. Be polite: one request per host per second,
// a User-Agent that says who we are, a hard cap on pages per run.

import { mkdirSync, writeFileSync } from "node:fs";
import { arg, today, UA, q, decode, lines, csvCell, MONTHS, pad, to24, guessType, get, pages, bamGoodTime, bookwhen, calendly, linktree, meetup, tribe, eventbriteOrg, jsonLd, OTHER_STYLES, NOT_A_SESSION } from "./lib/crawl-lib.mjs";

const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const outDir = arg("out-dir") ?? `data/inbox/crawl-${stamp}`;

// ---------- sources from the database ----------
const cities = q(`SELECT id, slug, name, state FROM City`);
const cityById = new Map(cities.map((c) => [c.id, c]));
const clubs = q(`SELECT id, name, cityId, website, sourceUrl, address, status FROM Club WHERE status != 'INACTIVE'`).map((c) => ({ ...c, type: "club" }));
const teachers = q(`SELECT id, name, cityId, website, sourceUrl, status FROM Instructor WHERE status != 'INACTIVE'`).map((t) => ({ ...t, address: null, type: "instructor" }));
const ownerKey = (o) => `${o.type[0]}:${o.id}`;
const known = q(`SELECT name, eventDate, startTime, clubId, instructorId FROM Event`);
// An event we already have is recognised by owner + date + start time (names differ between
// our rows and the owner's own wording), or by owner + date + name when a time is missing.
// names compared loosely: case, "@" vs "at", punctuation
const norm = (n) => String(n).toLowerCase().replace(/@/g, " at ").replace(/[^a-z0-9]+/g, " ").trim();
// The importer keys an event on city + name + date, and a second row with the same key overwrites the first.
const slugify = (t) => String(t).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const eventSlug = (cityName, name, date) => `${slugify(cityName)}-${slugify(name)}-${date.replace(/-/g, "")}`;
const takenSlugs = new Set(q(`SELECT slug FROM Event`).map((r) => r.slug.replace(/^event_/, "")));
const clock12 = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const hhmm = (t) => (t && /^\d{1,2}:\d{2}/.test(t) ? t.slice(0, 5).padStart(5, "0") : "");
const knownKey = new Set();
for (const e of known) {
  const d = e.eventDate.slice(0, 10);
  for (const k of [e.clubId && `c:${e.clubId}`, e.instructorId && `i:${e.instructorId}`].filter(Boolean)) {
    knownKey.add(`${k}|${d}|${norm(e.name)}`);
    if (hhmm(e.startTime)) knownKey.add(`${k}|${d}|t${hhmm(e.startTime)}`);
  }
}

function sourceFor(owner) {
  for (const u of [owner.website, owner.sourceUrl]) {
    if (!u || !/^https?:\/\//.test(u)) continue;
    const url = new URL(u);
    if (/\.bamgoodtime\.com$/.test(url.host) && url.host !== "www.bamgoodtime.com") return { kind: "bgt", key: url.origin };
    if (url.host === "bookwhen.com" && url.pathname.split("/")[1]) return { kind: "bookwhen", key: url.pathname.split("/")[1] };
    if (/(^|\.)eventbrite\.[a-z.]+$/.test(url.host) && /^\/(o|cc)\//.test(url.pathname)) return { kind: "ebrite", key: u };
    if (url.host === "linktr.ee") return { kind: "linktree", key: u };
    if (/(^|\.)meetup\.com$/.test(url.host) && url.pathname.split("/").filter(Boolean)[0]) return { kind: "meetup", key: u };
    if (url.host === "calendly.com" && url.pathname.split("/").filter(Boolean).length >= 2) return { kind: "calendly", key: u };
  }
  if (owner.type === "instructor") return null; // teachers' own sites vary too much to read generically
  const site = [owner.website, owner.sourceUrl].find((u) => u && /^https?:\/\//.test(u) && !/bamgoodtime\.com\/(clubs|mahjong-clubs)/.test(u));
  return site ? { kind: "jsonld", key: site } : null;
}

const horizonDate = new Date(Date.parse(today) + 60 * 864e5).toISOString().slice(0, 10);
const results = new Map(); // citySlug -> {rows:[], notes:[]}
const note = (city, text) => {
  if (!results.has(city.slug)) results.set(city.slug, { city, rows: [], notes: [] });
  results.get(city.slug).notes.push(text);
};
const seenSources = new Set();
const order = { bgt: 0, bookwhen: 1, linktree: 2, calendly: 2, meetup: 2, ebrite: 3, jsonld: 4 };
const work = [...clubs, ...teachers].map((o) => ({ owner: o, src: sourceFor(o) })).filter((w) => w.src).sort((a, b) => order[a.src.kind] - order[b.src.kind]);
// Clubs that only link to single Eventbrite event pages: read the latest such page, find its organizer, crawl that.
const withSource = new Set(work.filter((w) => w.src.kind !== "jsonld").map((w) => ownerKey(w.owner)));
const ebEvents = q(`SELECT clubId, registrationUrl, sourceUrl, eventDate FROM Event WHERE clubId IS NOT NULL AND (registrationUrl LIKE '%eventbrite.%/e/%' OR sourceUrl LIKE '%eventbrite.%/e/%') ORDER BY eventDate DESC`);
const ebByClub = new Map();
for (const e of ebEvents) {
  const u = [e.registrationUrl, e.sourceUrl].find((x) => x && /eventbrite\.[a-z.]+\/e\//.test(x));
  if (u && !ebByClub.has(e.clubId)) ebByClub.set(e.clubId, u);
}
const clubById = new Map(clubs.map((c) => [c.id, c]));
for (const [clubId, u] of ebByClub) {
  const c = clubById.get(clubId);
  if (c && !withSource.has(ownerKey(c))) work.push({ owner: c, src: { kind: "jsonld", key: u } });
}
const crawledLinks = new Set();
const listings = new Map();
const seenEvent = new Set();
for (const { owner, src } of work) {
  const city = cityById.get(owner.cityId);
  if (!city) continue;
  const id = `${src.kind}:${src.key}`;
  if (seenSources.has(`${ownerKey(owner)}:${id}`)) continue;
  seenSources.add(`${ownerKey(owner)}:${id}`);
  let found = [];
  try {
    found =
      src.kind === "bgt" ? await bamGoodTime(src.key)
      : src.kind === "bookwhen" ? await bookwhen(src.key)
      : src.kind === "ebrite" ? await eventbriteOrg(src.key)
      : src.kind === "calendly" ? await calendly(src.key)
      : src.kind === "linktree" ? await linktree(src.key)
      : src.kind === "meetup" ? await meetup(src.key)
      : ((await tribe(src.key)) ?? (await jsonLd(src.key)));
    if (found.organizer && !crawledLinks.has(`${ownerKey(owner)}|${found.organizer}`)) {
      crawledLinks.add(`${ownerKey(owner)}|${found.organizer}`);
      work.push({ owner, src: { kind: "ebrite", key: found.organizer } });
    }
    for (const link of found.links ?? []) {
      if (crawledLinks.has(`${ownerKey(owner)}|${link}`)) continue;
      crawledLinks.add(`${ownerKey(owner)}|${link}`);
      work.push({ owner, src: { kind: "calendly", key: link } });
    }
    if (src.kind === "ebrite" || src.kind === "calendly") crawledLinks.add(`${ownerKey(owner)}|${src.key}`);
  } catch (e) {
    if (src.kind !== "jsonld") note(city, `Could not read ${id} for "${owner.name}": ${e.message}`);
    continue;
  }
  if (src.kind !== "jsonld" && src.kind !== "linktree" && found.length === 0) note(city, `0 events parsed from ${id} for "${owner.name}" (nothing listed, or the page layout changed)`);
  const maxSeen = found.map((f) => f.date).sort().at(-1);
  const seenNow = new Set(found.flatMap((f) => [`${f.date}|${norm(f.name)}`, ...(f.time ? [`${f.date}|t${f.time}`] : [])]));
  const ok = ownerKey(owner);
  for (const e of found) {
    if (e.date < today) continue;
    if (e.date > horizonDate || NOT_A_SESSION.test(e.name)) continue;
    if (knownKey.has(`${ok}|${e.date}|${norm(e.name)}`) || (e.time && knownKey.has(`${ok}|${e.date}|t${e.time}`))) continue;
    const dupKey = `${ok}|${e.date}|${e.time}|${e.name.toLowerCase()}`;
    if (seenEvent.has(dupKey)) continue;
    seenEvent.add(dupKey);
    // ACTIVE needs: an owner we already trust, a start time and a place. Structured data (JSON-LD),
    // Eventbrite and Calendly must name their own venue; the booking adapters may fall back to the club's address.
    const own = ["jsonld", "ebrite", "calendly", "meetup"].includes(src.kind);
    const complete = e.time && (own ? e.venue : e.venue || owner.address);
    const status = owner.status === "ACTIVE" && complete ? "ACTIVE" : "NEEDS_REVIEW";
    if (!results.has(city.slug)) results.set(city.slug, { city, rows: [], notes: [] });
    results.get(city.slug).rows.push({
      name: e.name, city: city.name, state: city.state, event_date: e.date, start_time: e.time, end_time: "",
      venue: e.venue || owner.address || "", club_name: owner.type === "club" ? owner.name : "", instructor_name: owner.type === "instructor" ? owner.name : "",
      event_type: e.type,
      beginner_friendly: e.type === "LESSON" && /101|beginner|intro|learn/i.test(e.name) ? "TRUE" : "FALSE",
      price: e.price ?? "", registration_url: e.url, source_url: e.url, last_verified_at: today, status,
    });
  }
  // remember what complete listings (not single event pages) showed, to spot events that vanished
  if ((["bgt", "bookwhen", "ebrite"].includes(src.kind) || found.complete) && maxSeen) {
    const acc = listings.get(ok) ?? { owner, city, seen: new Set(), max: "" };
    for (const k of seenNow) acc.seen.add(k);
    if (maxSeen > acc.max) acc.max = maxSeen;
    listings.set(ok, acc);
  }
}
// Events we have that none of the owner's complete listings shows any more (inside the dates they cover).
for (const { owner, city, seen, max } of listings.values()) {
  const col = owner.type === "club" ? "clubId" : "instructorId";
  const mine = q(`SELECT name, eventDate, startTime FROM Event WHERE ${col}='${owner.id}' AND status='ACTIVE' AND eventDate >= '${today} 00:00:00'`);
  for (const e of mine) {
    const d = e.eventDate.slice(0, 10);
    if (d <= max && !seen.has(`${d}|${norm(e.name)}`) && !(hhmm(e.startTime) && seen.has(`${d}|t${hhmm(e.startTime)}`))) {
      note(city, `Possibly gone: "${e.name}" on ${d} (${owner.name}) is not in ${owner.name}'s current listing`);
    }
  }
}

// ---------- make event names unique (city + name + date) ----------
for (const { city, rows } of results.values()) {
  const used = new Set();
  for (const r of rows) {
    let name = r.name;
    const taken = (n) => used.has(eventSlug(city.name, n, r.event_date)) || takenSlugs.has(eventSlug(city.name, n, r.event_date));
    if (taken(name) && r.start_time) name = `${r.name} (${clock12(r.start_time)})`;
    if (taken(name)) name = `${r.name} (${r.club_name || r.instructor_name})`;
    for (let i = 2; taken(name); i++) name = `${r.name} (${i})`;
    r.name = name;
    used.add(eventSlug(city.name, name, r.event_date));
  }
}

// ---------- write ----------
const HEADER = "name,city,state,event_date,start_time,end_time,venue,club_name,instructor_name,event_type,beginner_friendly,price,registration_url,source_url,last_verified_at,status".split(",");
let total = 0;
for (const { city, rows, notes } of results.values()) {
  if (!rows.length && !notes.length) continue;
  const dir = `${outDir}/${city.slug}`;
  mkdirSync(dir, { recursive: true });
  if (rows.length) {
    writeFileSync(`${dir}/events.csv`, [HEADER.join(","), ...rows.map((r) => HEADER.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
    total += rows.length;
  }
  writeFileSync(
    `${dir}/report.md`,
    `# ${city.name}, ${city.state}: event crawler (${today})\n\n## New events\n${rows.length ? rows.map((r) => `- ${r.event_date} ${r.start_time} ${r.name} (${r.club_name || r.instructor_name}) [${r.status}]`).join("\n") : "- none"}\n\n## Notes\n${notes.length ? notes.map((n) => `- ${n}`).join("\n") : "- none"}\n`,
  );
}
const noteLines = [...results.values()].flatMap((r) => r.notes.map((n) => `  - ${r.city.name}: ${n}`));
console.log(`# Event crawler ${today}\n\n- Pages fetched: ${pages()}\n- New events: ${total} in ${[...results.values()].filter((r) => r.rows.length).length} cities\n- Notes (${noteLines.length}):\n${noteLines.join("\n") || "  - none"}\n- Output: ${total ? outDir : "(nothing written)"}`);
// Exit 3 = nothing new to import. Notes alone (a page that returned 0 events, an event that looks gone)
// stay in the job summary; they don't open a PR.
process.exit(total === 0 ? 3 : 0);
