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
//   - anything else: schema.org Event data (JSON-LD) found on the page
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
const MAX_PAGES = 150;

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

async function jsonLd(url) {
  const html = await get(url);
  const out = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== "object") return;
    const t = [].concat(n["@type"] ?? []).join(" ");
    if (/Event/.test(t) && n.startDate && n.name) {
      const sd = String(n.startDate);
      const dm = sd.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
      const text = `${n.name} ${n.description ?? ""}`;
      // a calendar page lists everything the venue does: keep American-style mahjong only,
      // and skip UTC timestamps (the local date and time can't be recovered from them)
      if (dm && /mah[\s-]?j/i.test(text) && !/riichi|hong kong|chinese|singapore|taiwan|japanese/i.test(text) && !/Z$/.test(sd)) {
        const loc = decode(String(n.location?.name ?? ""));
        const price = [].concat(n.offers ?? []).map((o) => Number(o?.price)).find((p) => Number.isFinite(p));
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
const clubs = q(`SELECT id, name, cityId, website, sourceUrl, address, status FROM Club WHERE status != 'INACTIVE'`);
const known = q(`SELECT name, eventDate, startTime, clubId FROM Event`);
// An event we already have is recognised by club + date + start time (names differ between
// our rows and the club's own wording), or by club + date + name when a time is missing.
const hhmm = (t) => (t && /^\d{1,2}:\d{2}/.test(t) ? t.slice(0, 5).padStart(5, "0") : "");
const knownKey = new Set();
for (const e of known) {
  const d = e.eventDate.slice(0, 10);
  knownKey.add(`${e.clubId}|${d}|${e.name.toLowerCase()}`);
  if (hhmm(e.startTime)) knownKey.add(`${e.clubId}|${d}|t${hhmm(e.startTime)}`);
}

function sourceFor(club) {
  for (const u of [club.website, club.sourceUrl]) {
    if (!u || !/^https?:\/\//.test(u)) continue;
    const url = new URL(u);
    if (/\.bamgoodtime\.com$/.test(url.host) && url.host !== "www.bamgoodtime.com") return { kind: "bgt", key: url.origin };
    if (url.host === "bookwhen.com" && url.pathname.split("/")[1]) return { kind: "bookwhen", key: url.pathname.split("/")[1] };
  }
  const site = [club.website, club.sourceUrl].find((u) => u && /^https?:\/\//.test(u) && !/bamgoodtime\.com\/(clubs|mahjong-clubs)/.test(u));
  return site ? { kind: "jsonld", key: site } : null;
}

const horizonDate = new Date(Date.parse(today) + 270 * 864e5).toISOString().slice(0, 10);
const results = new Map(); // citySlug -> {rows:[], notes:[]}
const note = (city, text) => {
  if (!results.has(city.slug)) results.set(city.slug, { city, rows: [], notes: [] });
  results.get(city.slug).notes.push(text);
};
const seenSources = new Set();
const order = { bgt: 0, bookwhen: 1, jsonld: 2 };
const work = clubs.map((c) => ({ club: c, src: sourceFor(c) })).filter((w) => w.src).sort((a, b) => order[a.src.kind] - order[b.src.kind]);
const seenEvent = new Set();
for (const { club, src } of work) {
  const city = cityById.get(club.cityId);
  if (!city) continue;
  const id = `${src.kind}:${src.key}`;
  if (seenSources.has(`${club.id}:${id}`)) continue;
  seenSources.add(`${club.id}:${id}`);
  let found = [];
  try {
    found = src.kind === "bgt" ? await bamGoodTime(src.key) : src.kind === "bookwhen" ? await bookwhen(src.key) : await jsonLd(src.key);
  } catch (e) {
    if (src.kind !== "jsonld") note(city, `Could not read ${id} for "${club.name}": ${e.message}`);
    continue;
  }
  if (src.kind !== "jsonld" && found.length === 0) note(city, `0 events parsed from ${id} for "${club.name}" (page layout may have changed)`);
  const maxSeen = found.map((f) => f.date).sort().at(-1);
  const seenNow = new Set(found.flatMap((f) => [`${f.date}|${f.name.toLowerCase()}`, ...(f.time ? [`${f.date}|t${f.time}`] : [])]));
  for (const e of found) {
    if (e.date < today) continue;
    if (e.date > horizonDate || /rental/i.test(e.name)) continue;
    if (knownKey.has(`${club.id}|${e.date}|${e.name.toLowerCase()}`) || (e.time && knownKey.has(`${club.id}|${e.date}|t${e.time}`))) continue;
    const dupKey = `${club.id}|${e.date}|${e.time}|${e.name.toLowerCase()}`;
    if (seenEvent.has(dupKey)) continue;
    seenEvent.add(dupKey);
    const complete = e.time && (e.venue || club.address);
    const status = club.status === "ACTIVE" && complete && src.kind !== "jsonld" ? "ACTIVE" : "NEEDS_REVIEW";
    if (!results.has(city.slug)) results.set(city.slug, { city, rows: [], notes: [] });
    results.get(city.slug).rows.push({
      name: e.name, city: city.name, state: city.state, event_date: e.date, start_time: e.time, end_time: "",
      venue: e.venue || club.address || "", club_name: club.name, instructor_name: "", event_type: e.type,
      beginner_friendly: e.type === "LESSON" && /101|beginner|intro|learn/i.test(e.name) ? "TRUE" : "FALSE",
      price: e.price ?? "", registration_url: e.url, source_url: e.url, last_verified_at: today, status,
    });
  }
  // events we have for this club that the page no longer lists (inside the window the page covers)
  if (maxSeen) {
    const mine = q(`SELECT name, eventDate, startTime FROM Event WHERE clubId='${club.id}' AND status='ACTIVE' AND eventDate >= '${today} 00:00:00'`);
    for (const e of mine) {
      const d = e.eventDate.slice(0, 10);
      if (d <= maxSeen && !seenNow.has(`${d}|${e.name.toLowerCase()}`) && !(hhmm(e.startTime) && seenNow.has(`${d}|t${hhmm(e.startTime)}`))) note(city, `Possibly gone: "${e.name}" on ${d} (${club.name}) is no longer listed at ${id}`);
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
    `# ${city.name}, ${city.state}: event crawler (${today})\n\n## New events\n${rows.length ? rows.map((r) => `- ${r.event_date} ${r.start_time} ${r.name} (${r.club_name}) [${r.status}]`).join("\n") : "- none"}\n\n## Notes\n${notes.length ? notes.map((n) => `- ${n}`).join("\n") : "- none"}\n`,
  );
}
console.log(`# Event crawler ${today}\n\n- Pages fetched: ${pagesFetched}\n- New events: ${total} in ${[...results.values()].filter((r) => r.rows.length).length} cities\n- Cities with notes: ${[...results.values()].filter((r) => r.notes.length).map((r) => r.city.name).join(", ") || "none"}\n- Output: ${total || [...results.values()].some((r) => r.notes.length) ? outDir : "(nothing written)"}`);
process.exit(total === 0 && ![...results.values()].some((r) => r.notes.length) ? 3 : 0);
