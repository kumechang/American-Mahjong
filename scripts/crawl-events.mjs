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
//   - anything else: schema.org Event data (JSON-LD) found on the page (clubs only)
//
//   node scripts/crawl-events.mjs [--out-dir=data/inbox/crawl-YYYY-MM-DD-HHMM] [--today=YYYY-MM-DD]
//
// Needs the local D1 (`npx wrangler d1 migrations apply DB --local`).
// Exit code 3 = nothing new. Be polite: one request per host per second,
// a User-Agent that says who we are, a hard cap on pages per run.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const today = arg("today") ?? new Date().toISOString().slice(0, 10);
const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const outDir = arg("out-dir") ?? `data/inbox/crawl-${stamp}`;
const UA = "Mozilla/5.0 (compatible; MahjongMapBot/1.0; +https://mahjong-map.com/about)";
const MAX_PAGES = 400;

const q = (sql) =>
  JSON.parse(
    execFileSync("npx", ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command", sql], { encoding: "utf8", maxBuffer: 80e6 }).replace(/^[^[]*/, ""),
  )[0].results;

// ---------- helpers ----------
const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ");
const lines = (html) =>
  decode(html.replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, "\n"))
    .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
const pad = (n) => String(n).padStart(2, "0");
function to24(h, m, ap) {
  let hh = Number(h) % 12;
  if (/p/i.test(ap)) hh += 12;
  return `${pad(hh)}:${m}`;
}
function guessType(name) {
  if (/league|tournament/i.test(name)) return "TOURNAMENT";
  if (/101|102|103|lesson|class|learn|beginner|intro|course/i.test(name)) return "LESSON";
  if (/open play|guided play|drop-in|mahj night|game night|play/i.test(name)) return "OPEN_PLAY";
  if (/social|party|mixer|brunch|happy hour|ween/i.test(name)) return "SOCIAL";
  return "OTHER";
}

// listings that are enquiry forms or placeholders, not sessions people can attend
const NOT_A_SESSION = /inquiry|date request|host a private|gift card|rental/i;
const OTHER_STYLES = /riichi|hong kong|chinese|singapore|taiwan|japanese/i;
const lastFetch = new Map();
let pagesFetched = 0;
async function get(url) {
  if (pagesFetched >= MAX_PAGES) throw new Error("page cap reached");
  const host = new URL(url).host;
  const wait = 1000 - (Date.now() - (lastFetch.get(host) ?? 0));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastFetch.set(host, Date.now());
  pagesFetched++;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" }, signal: ctl.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

// ---------- adapters: return [{name,date,time,venue,price,url,type}] ----------
async function bamGoodTime(origin) {
  const html = await get(`${origin}/events`);
  const out = [];
  const re = /<a\b[^>]*href="(\/events\/[0-9a-f-]{36})"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const l = lines(m[2]);
    const di = l.findIndex((x) => /^[A-Z][a-z]+day, [A-Z][a-z]+ \d{1,2}, \d{4}/.test(x));
    if (di < 1) continue;
    const d = l[di].match(/^[A-Za-z]+, ([A-Za-z]+) (\d{1,2}), (\d{4})(?: [•·] (\d{1,2}):(\d{2}) ([AP]M))?/);
    if (!d || !MONTHS[d[1].toLowerCase()]) continue;
    // the time may sit on the same line ("... • 5:30 PM") or on its own lines ("•", "5:30 PM")
    let j = di + 1;
    let hh = d[4], mm = d[5], ap = d[6];
    if (!hh) {
      if (/^[•·]$/.test(l[j] ?? "")) j++;
      const t = (l[j] ?? "").match(/^(\d{1,2}):(\d{2}) ([AP]M)$/);
      if (t) { [, hh, mm, ap] = t; j++; }
    }
    const venue = l[j] && !/^\$/.test(l[j]) && !/spots? left|Full|Waitlist|Sold out/i.test(l[j]) ? l[j] : "";
    const price = l.slice(j).map((x) => x.match(/^\$(\d+(?:\.\d{2})?)/)).find(Boolean);
    out.push({
      name: l[di - 1],
      date: `${d[3]}-${pad(MONTHS[d[1].toLowerCase()])}-${pad(d[2])}`,
      time: hh ? to24(hh, mm, ap) : "",
      venue,
      price: price ? Number(price[1]) : null,
      url: origin + m[1],
      type: /lesson/i.test(l[di - 2] ?? "") ? "LESSON" : /open play/i.test(l[di - 2] ?? "") ? "OPEN_PLAY" : guessType(l[di - 1]),
    });
  }
  return out;
}

async function bookwhen(account) {
  const html = await get(`https://bookwhen.com/${account}`);
  const out = [];
  const re = /data-event="ev-[a-z0-9]+-(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2}"[\s\S]*?<button[^>]*>([^<]+)<\/button>/gi;
  let m;
  while ((m = re.exec(html))) {
    const name = decode(m[6]).replace(/\s+/g, " ").trim();
    if (!name) continue;
    out.push({
      name,
      date: `${m[1]}-${m[2]}-${m[3]}`,
      time: `${m[4]}:${m[5]}`,
      venue: "",
      price: null,
      url: `https://bookwhen.com/${account}`,
      type: guessType(name),
    });
  }
  return out;
}

// Calendly: each event type is a recurring offer; its open slots are the sessions.
async function calendly(url) {
  const [profile, slug] = new URL(url).pathname.split("/").filter(Boolean);
  if (!profile || !slug) return [];
  const api = "https://calendly.com/api/booking/event_types";
  const type = JSON.parse(await get(`${api}/lookup?event_type_slug=${encodeURIComponent(slug)}&profile_slug=${encodeURIComponent(profile)}`));
  if (!type.uuid) return [];
  const out = [];
  const tz = type.availability_timezone ?? "America/New_York";
  for (let from = Date.parse(today); from < Date.parse(today) + 120 * 864e5; from += 31 * 864e5) {
    const a = new Date(from).toISOString().slice(0, 10);
    const b = new Date(Math.min(from + 30 * 864e5, Date.parse(today) + 120 * 864e5)).toISOString().slice(0, 10);
    const r = JSON.parse(await get(`${api}/${type.uuid}/calendar/range?timezone=${encodeURIComponent(tz)}&diagnostics=false&range_start=${a}&range_end=${b}`));
    for (const day of r.days ?? []) {
      for (const sp of day.spots ?? []) {
        const m = String(sp.start_time).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
        if (!m || sp.status !== "available") continue;
        out.push({
          name: type.name,
          date: m[1],
          time: m[2],
          venue: type.name.includes("@") ? type.name.split("@").pop().trim() : "",
          price: null,
          url: `https://calendly.com/${profile}/${slug}/${m[1]}T${m[2].slice(0, 2)}`,
          type: guessType(type.name),
        });
      }
    }
  }
  return out;
}

// Linktree: no events of its own, but it links to the booking pages.
async function linktree(url) {
  const html = await get(url);
  const links = [...new Set([...html.matchAll(/https:\/\/calendly\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_-]+)/g)].map((m) => `https://calendly.com/${m[1]}/${m[2]}`))];
  const out = [];
  out.links = links;
  return out;
}

async function eventbriteOrg(url) {
  const html = await get(url);
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return [];
  const data = JSON.parse(m[1]).props?.pageProps ?? {};
  const out = [];
  // organizer page: upcomingEvents[]; collection page: serverData.events_in_collection.upcoming.events[]
  for (const e of data.upcomingEvents ?? []) {
    if (e.is_cancelled || e.is_online_event || !e.start_date || OTHER_STYLES.test(String(e.name))) continue;
    const v = e.primary_venue;
    const a = v?.address ?? {};
    const venue = v?.name ? [v.name, a.address_1, a.city, [a.region, a.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ") : "";
    const price = Number(e.ticket_availability?.minimum_ticket_price?.major_value);
    out.push({
      name: String(e.name),
      date: e.start_date,
      time: /^\d{2}:\d{2}/.test(e.start_time ?? "") ? e.start_time.slice(0, 5) : "",
      venue,
      price: e.ticket_availability?.is_free ? 0 : Number.isFinite(price) ? price : null,
      url: e.url,
      type: guessType(String(e.name)),
    });
  }
  for (const e of data.serverData?.events_in_collection?.upcoming?.events ?? []) {
    const local = e.start?.local;
    if (!local || e.online_event || e.status === "canceled" || OTHER_STYLES.test(String(e.name?.text ?? e.name))) continue;
    const v = e.primary_venue ?? e.venue;
    out.push({
      name: String(e.name?.text ?? e.name),
      date: local.slice(0, 10),
      time: local.slice(11, 16),
      venue: v?.name ? [v.name, v.address?.localized_address_display].filter(Boolean).join(", ") : "",
      price: e.is_free ? 0 : null,
      url: e.url,
      type: guessType(String(e.name?.text ?? e.name)),
    });
  }
  return out;
}

async function jsonLd(url) {
  const html = await get(url);
  const out = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== "object") return;
    const t = [].concat(n["@type"] ?? []).join(" ");
    if (/Event/.test(t) && n.name) {
      const orgUrl = [].concat(n.organizer ?? []).map((o) => o?.url).find((u) => typeof u === "string" && /eventbrite\.[a-z.]+\/o\//.test(u));
      if (orgUrl) out.organizer = orgUrl;
    }
    if (/Event/.test(t) && n.startDate && n.name) {
      const sd = String(n.startDate);
      const dm = sd.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
      const text = `${n.name} ${n.description ?? ""}`;
      // a calendar page lists everything the venue does: keep American-style mahjong only,
      // and skip UTC timestamps (the local date and time can't be recovered from them)
      if (dm && /mah[\s-]?j/i.test(text) && !/riichi|hong kong|chinese|singapore|taiwan|japanese/i.test(text) && !/Z$/.test(sd)) {
        const loc = decode(String(n.location?.name ?? ""));
        const price = [].concat(n.offers ?? []).map((o) => Number(o?.price ?? o?.lowPrice)).find((p) => Number.isFinite(p));
        out.push({ name: decode(String(n.name)), date: dm[1], time: dm[2] ?? "", venue: loc, price: price ?? null, url: typeof n.url === "string" ? n.url : url, type: guessType(String(n.name)) });
      }
    }
    Object.values(n).forEach(walk);
  };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walk(JSON.parse(m[1])); } catch { /* ignore broken JSON-LD */ }
  }
  return out;
}

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
    if (url.host === "calendly.com" && url.pathname.split("/").filter(Boolean).length >= 2) return { kind: "calendly", key: u };
  }
  if (owner.type === "instructor") return null; // teachers' own sites vary too much to read generically
  const site = [owner.website, owner.sourceUrl].find((u) => u && /^https?:\/\//.test(u) && !/bamgoodtime\.com\/(clubs|mahjong-clubs)/.test(u));
  return site ? { kind: "jsonld", key: site } : null;
}

const horizonDate = new Date(Date.parse(today) + 270 * 864e5).toISOString().slice(0, 10);
const results = new Map(); // citySlug -> {rows:[], notes:[]}
const note = (city, text) => {
  if (!results.has(city.slug)) results.set(city.slug, { city, rows: [], notes: [] });
  results.get(city.slug).notes.push(text);
};
const seenSources = new Set();
const order = { bgt: 0, bookwhen: 1, linktree: 2, calendly: 2, ebrite: 3, jsonld: 4 };
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
      : await jsonLd(src.key);
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
    const own = ["jsonld", "ebrite", "calendly"].includes(src.kind);
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
  if (["bgt", "bookwhen", "ebrite"].includes(src.kind) && maxSeen) {
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
console.log(`# Event crawler ${today}\n\n- Pages fetched: ${pagesFetched}\n- New events: ${total} in ${[...results.values()].filter((r) => r.rows.length).length} cities\n- Notes (${noteLines.length}):\n${noteLines.join("\n") || "  - none"}\n- Output: ${total ? outDir : "(nothing written)"}`);
// Exit 3 = nothing new to import. Notes alone (a page that returned 0 events, an event that looks gone)
// stay in the job summary; they don't open a PR.
process.exit(total === 0 ? 3 : 0);
