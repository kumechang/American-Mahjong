#!/usr/bin/env node
// Third discovery source: Eventbrite search pages for "mahjong" (eventbrite.com/d/<st>--<city>/mahjong/).
// A search page lists the next mahjong events around a city (each with venue and street address in its
// structured data). That finds one-off events from organisers we have never heard of: libraries, temples,
// restaurants, charity nights. For every new event the event page is read once for its start time, price
// and organiser. Everything is NEEDS_REVIEW: nobody here has confirmed American / NMJL, so a person (or the
// research server) checks the organiser before a row is published. Never writes to the database.
//
//   node scripts/discover-eventbrite.mjs [--batch=60] [--step=N] [--out-dir=data/inbox/<id>] [--max=60]
//
// The cities (every city on the site, published or not) rotate with --step, so a full pass takes a few runs.
// Needs Chromium (Eventbrite's firewall refuses plain HTTP): in a sandbox set CA_SPKI / PW_CHROMIUM / PW_PROXY. Checked end to end on 2026-10-27.
// Output: <out-dir>/eb-<city>-<st>/events.csv + report.md. Exit code 3 = nothing new.

import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { arg, today, q, get, render, closeBrowser, decode, csvCell, pages, jsonLdFromHtml, guessType, OTHER_STYLES, NOT_A_SESSION } from "./lib/crawl-lib.mjs";

const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const outDir = arg("out-dir") ?? `data/inbox/discover-eb-${stamp}`;
const batch = Number(arg("batch") ?? 60);
const MAX_NEW = Number(arg("max") ?? 60); // event pages read per run (one request each)
const slugify = (t) => String(t).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const horizon = new Date(Date.parse(today) + 60 * 864e5).toISOString().slice(0, 10);
const ebId = (u) => (String(u ?? "").match(/tickets-(\d{8,})/) ?? [])[1];

// Eventbrite's firewall turns plain HTTP clients away (405/403) while a real browser gets through: try the cheap way first,
// then fall back to the headless Chromium the other readers use (still 1 page per second, still our honest User-Agent).
let plainWorks = true;
async function fetchPage(url) {
  if (plainWorks) {
    try { return await get(url); } catch (e) { if (!/HTTP (403|405)/.test(e.message)) throw e; plainWorks = false; }
  }
  return (await render(url)).html;
}

// ---------- what we already have ----------
const cities = q(`SELECT name, state, slug FROM City ORDER BY name`);
const ourCities = new Set(cities.map((c) => `${norm(c.name)}|${c.state}`));
const knownIds = new Set();
for (const r of q(`SELECT registrationUrl, sourceUrl FROM Event`)) for (const u of [r.registrationUrl, r.sourceUrl]) { const id = ebId(u); if (id) knownIds.add(id); }
if (existsSync("data/inbox")) { // events an earlier run (any crawler) already wrote
  for (const d of readdirSync("data/inbox")) {
    for (const c of readdirSync(`data/inbox/${d}`, { withFileTypes: true }).filter((x) => x.isDirectory())) {
      const f = `data/inbox/${d}/${c.name}/events.csv`;
      if (existsSync(f)) for (const m of readFileSync(f, "utf8").matchAll(/tickets-(\d{8,})/g)) knownIds.add(m[1]);
    }
  }
}
const knownClubs = q(`SELECT c.name, c.website, c.sourceUrl, ci.name AS city, ci.state FROM Club c JOIN City ci ON ci.id = c.cityId`);
const orgKey = (u) => (String(u ?? "").match(/eventbrite\.[a-z.]+\/o\/([^/?#]+)/) ?? [])[1] ?? "";
const takenSlugs = new Set(q(`SELECT slug FROM Event`).map((r) => r.slug.replace(/^event_/, "")));
const eventSlug = (cityName, name, date) => `${slugify(cityName)}-${slugify(name)}-${date.replace(/-/g, "")}`;
const clock12 = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

// ---------- today's cities ----------
const span = Math.max(batch, Math.ceil(cities.length / batch) * batch);
const step = arg("step") != null ? Number(arg("step")) : Math.floor(Date.parse(today) / 864e5);
const start = (step * batch) % span;
const todays = cities.slice(start, start + batch);

const found = new Map(); // event id -> candidate
let searched = 0;
for (const c of todays) {
  for (let page = 1; page <= 2; page++) {
    let html;
    try { html = await fetchPage(`https://www.eventbrite.com/d/${c.state.toLowerCase()}--${slugify(c.name)}/mahjong/${page > 1 ? `?page=${page}` : ""}`); } catch (e) { if (process.env.DEBUG) console.error(c.name, e.message); break; }
    if (page === 1) searched++;
    let list = [];
    for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      try { const j = JSON.parse(m[1]); if (Array.isArray(j.itemListElement) && j.itemListElement[0]?.item?.startDate) list = j.itemListElement.map((x) => x.item); } catch { /* skip */ }
    }
    let relevant = 0;
    for (const it of list) {
      const text = `${it.name ?? ""} ${it.description ?? ""}`;
      const a = it.location?.address ?? {};
      if (!/mah\W*j/i.test(text) || OTHER_STYLES.test(text) || NOT_A_SESSION.test(String(it.name ?? ""))) continue;
      relevant++;
      const id = ebId(it.url);
      if (!id || knownIds.has(id) || found.has(id) || !it.startDate || it.startDate < today || it.startDate > horizon) continue;
      if (a.addressCountry && a.addressCountry !== "US") continue;
      if (!a.addressLocality || !a.addressRegion || !it.location?.name) continue; // online or no place named
      found.set(id, { id, url: String(it.url).split("?")[0], name: decode(String(it.name)), date: String(it.startDate).slice(0, 10), place: decode(String(it.location.name)), street: a.streetAddress ?? "", city: decode(a.addressLocality), state: a.addressRegion, search: c, american: /american|nmjl|national mah/i.test(text) });
    }
    if (relevant < 9) break; // page 2 only when page 1 was full of mahjong
  }
}

// ---------- read each new event page: start time, price, organiser ----------
const rows = [];
for (const e of [...found.values()].slice(0, MAX_NEW)) {
  let time = "", price = null, organizer = "", organizerUrl = "";
  try {
    const html = await fetchPage(e.url);
    const all = jsonLdFromHtml(html, e.url);
    const ld = all.find((x) => x.date === e.date) ?? all[0];
    if (ld) { time = ld.time; price = ld.price; }
    organizerUrl = all.organizer ?? "";
    organizer = decode((html.match(/"organizer"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"/) ?? [])[1] ?? "");
  } catch { /* keep what the search page gave */ }
  if (!time) continue; // no start time: not listed
  const sameName = e.place.toLowerCase().includes(e.street.split(" ")[0] ?? "~");
  rows.push({ ...e, time, price: price != null && price > 0 && price <= 600 ? price : "", organizer, organizerUrl, venue: [e.place, sameName ? "" : e.street, e.city, e.state].filter(Boolean).join(", ") });
}

await closeBrowser();
if (rows.length === 0) {
  console.log(`# Eventbrite discovery ${today}\n\n- Search pages read: ${searched} (cities ${start}–${start + batch} of ${cities.length})\n- New events: 0`);
  process.exit(3);
}

// ---------- write ----------
const EVENT_H = "name,city,state,event_date,start_time,end_time,venue,club_name,instructor_name,event_type,beginner_friendly,price,registration_url,source_url,last_verified_at,status".split(",");
const byCity = new Map();
for (const r of rows) {
  // the event's own town (a search for one city also lists its neighbours: Oakland and San Leandro events must not go under Alamo)
  r.cityName = r.city; r.stateCode = r.state;
  const key = `eb-${slugify(r.cityName)}-${r.stateCode.toLowerCase()}`;
  if (!byCity.has(key)) byCity.set(key, []);
  byCity.get(key).push(r);
}
const summary = [];
for (const [key, list] of byCity) {
  const dir = `${outDir}/${key}`;
  mkdirSync(dir, { recursive: true });
  const used = new Set();
  // organisers become club leads (NEEDS_REVIEW) so the events have an owner; one already on the site (same Eventbrite page or name in this town) is linked by its own name
  const leads = new Map();
  const ownerName = (r) => {
    const org = r.organizer || r.place;
    const hit = knownClubs.find((c) => c.state === r.stateCode && norm(c.city) === norm(r.cityName) && (norm(c.name) === norm(org) || (orgKey(r.organizerUrl) && [c.website, c.sourceUrl].some((u) => orgKey(u) === orgKey(r.organizerUrl)))));
    if (hit) return hit.name;
    if (!leads.has(norm(org))) leads.set(norm(org), { name: org, url: r.organizerUrl, american: r.american, example: r.name });
    return org;
  };
  const out = list.map((r) => {
    let name = r.name;
    const taken = (n) => used.has(eventSlug(r.cityName, n, r.date)) || takenSlugs.has(eventSlug(r.cityName, n, r.date));
    if (taken(name)) name = `${r.name} (${clock12(r.time)})`;
    for (let i = 2; taken(name); i++) name = `${r.name} (${i})`;
    used.add(eventSlug(r.cityName, name, r.date));
    return {
      name, city: r.cityName, state: r.stateCode, event_date: r.date, start_time: r.time, end_time: "", venue: r.venue, club_name: ownerName(r), instructor_name: "",
      event_type: /open play|guided play|social|mixer|game night/i.test(r.name) ? "OPEN_PLAY" : guessType(r.name),
      beginner_friendly: /101|beginner|intro|learn/i.test(r.name) ? "TRUE" : "FALSE", price: r.price, registration_url: r.url, source_url: r.url, last_verified_at: today, status: "NEEDS_REVIEW",
    };
  });
  if (leads.size) {
    const CLUB_H = "name,city,state,description,address,website,phone,email,latitude,longitude,beginner_friendly,lessons_available,open_play,social_play,women_only,free,price,schedule,source_url,last_verified_at,status".split(",");
    const crow = [...leads.values()].map((l) => ({
      name: l.name, city: list[0].cityName, state: list[0].stateCode,
      description: `Organiser of mahjong events on Eventbrite (for example "${l.example}"). ${l.american ? "An event text mentions American / NMJL." : "American / NMJL not stated yet."} The organiser's own page has not been checked.`.slice(0, 600),
      address: "", website: l.url, phone: "", email: "", latitude: "", longitude: "",
      beginner_friendly: "FALSE", lessons_available: "FALSE", open_play: "FALSE", social_play: "TRUE", women_only: "FALSE", free: "FALSE", price: "",
      schedule: "Events listed on Eventbrite", source_url: l.url || "https://www.eventbrite.com", last_verified_at: today, status: "NEEDS_REVIEW",
    }));
    writeFileSync(`${dir}/clubs.csv`, [CLUB_H.join(","), ...crow.map((r) => CLUB_H.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
  }
  writeFileSync(`${dir}/events.csv`, [EVENT_H.join(","), ...out.map((r) => EVENT_H.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
  const ours = ourCities.has(`${norm(list[0].cityName)}|${list[0].stateCode}`);
  writeFileSync(
    `${dir}/report.md`,
    `# ${list[0].cityName}, ${list[0].stateCode}: Eventbrite discovery (${today})\n\n${ours ? "This city is already on the site." : "**This city is not on the site yet.**"}\n\n## Events found on Eventbrite search\n${list.map((r) => `- ${r.date} ${r.time} ${r.name} @ ${r.venue} (organiser: ${r.organizer || "unknown"}; ${r.american ? "text mentions American/NMJL" : "American/NMJL not stated"}) ${r.url}`).join("\n")}\n\n## Next step\nOpen the organiser's page, confirm American / NMJL play and the venue (no private homes), then promote. If the organiser runs regular sessions, add them as a club or instructor first. Rows here are NEEDS_REVIEW by design.\n`,
  );
  summary.push(`- ${list[0].cityName}, ${list[0].stateCode}${ours ? "" : " (new place)"}: ${list.map((r) => `${r.date} ${r.name}`).join("; ")}`);
}
console.log(`# Eventbrite discovery ${today}\n\n- Search pages read: ${searched} (cities ${start}–${start + batch} of ${cities.length})\n- Pages fetched: ${pages()}\n- New events: ${rows.length} in ${byCity.size} places\n${summary.join("\n")}\n- Output: ${outDir}`);
process.exit(0);
