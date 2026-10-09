// Shared helpers and site adapters for the event crawler (crawl-events.mjs) and
// the club discovery crawler (discover-clubs.mjs). Plain HTTP, polite by design:
// one request per host per second, an identifying User-Agent, a page cap per run.

import { execFileSync } from "node:child_process";

export const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
export const today = arg("today") ?? new Date().toISOString().slice(0, 10);
export const UA = "Mozilla/5.0 (compatible; MahjongMapBot/1.0; +https://mahjong-map.com/about)";
const MAX_PAGES = 400;

export const q = (sql) =>
  JSON.parse(
    execFileSync("npx", ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command", sql], { encoding: "utf8", maxBuffer: 80e6 }).replace(/^[^[]*/, ""),
  )[0].results;

// ---------- helpers ----------
export const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ");
export const lines = (html) =>
  decode(html.replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, "\n"))
    .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
export const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
export const pad = (n) => String(n).padStart(2, "0");
export function to24(h, m, ap) {
  let hh = Number(h) % 12;
  if (/p/i.test(ap)) hh += 12;
  return `${pad(hh)}:${m}`;
}
export function guessType(name) {
  if (/league|tournament/i.test(name)) return "TOURNAMENT";
  if (/101|102|103|lesson|class|learn|beginner|intro|course/i.test(name)) return "LESSON";
  if (/open play|guided play|drop-in|mahj night|game night|play/i.test(name)) return "OPEN_PLAY";
  if (/social|party|mixer|brunch|happy hour|ween/i.test(name)) return "SOCIAL";
  return "OTHER";
}

// listings that are enquiry forms or placeholders, not sessions people can attend
export const NOT_A_SESSION = /inquiry|date request|host a private|gift card|rental/i;
export const OTHER_STYLES = /riichi|hong kong|chinese|singapore|taiwan|japanese/i;
const lastFetch = new Map();
let pagesFetched = 0;
export const pages = () => pagesFetched;
export async function get(url) {
  if (pagesFetched >= MAX_PAGES) throw new Error("page cap reached");
  const rawHost = new URL(url).host;
  const host = /(^|\.)bamgoodtime\.com$/.test(rawHost) ? "bamgoodtime.com" : rawHost; // one polite queue for all its club sites
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
export async function bamGoodTime(origin) {
  const html = await get(`${origin}/events`);
  const out = [];
  const seen = new Set(); // the page links each event twice (card + title)
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
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const venue = l[j] && !/^\$/.test(l[j]) && !/^(free|spots? left|full|waitlist|sold out)\b|spots? left/i.test(l[j]) ? l[j] : "";
    // private homes are never published (no home addresses on the site)
    if (/\b(home|residence|house)\b/i.test(venue) && !/(nursing|senior|retirement|clubhouse|guest|lodge|ale|playhouse)/i.test(venue)) continue;
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

export async function bookwhen(account) {
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
export async function calendly(url) {
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
export async function linktree(url) {
  const html = await get(url);
  const links = [...new Set([...html.matchAll(/https:\/\/calendly\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_-]+)/g)].map((m) => `https://calendly.com/${m[1]}/${m[2]}`))];
  const out = [];
  out.links = links;
  return out;
}

// Meetup: the group's events page embeds its events (title, local start, venue, status).
export async function meetup(groupUrl) {
  const slug = new URL(groupUrl).pathname.split("/").filter(Boolean)[0];
  const html = await get(`https://www.meetup.com/${slug}/events/`);
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return [];
  const ap = JSON.parse(m[1]).props?.pageProps?.__APOLLO_STATE__ ?? {};
  const mahjongGroup = /mah/i.test(slug); // a general community group lists everything it does
  const out = [];
  for (const [k, e] of Object.entries(ap)) {
    if (!k.startsWith("Event:") || e.status !== "ACTIVE" || e.eventType !== "PHYSICAL") continue;
    const title = String(e.title ?? "");
    if (OTHER_STYLES.test(title) || (!mahjongGroup && !/mah[\s-]?j/i.test(title))) continue;
    const dm = String(e.dateTime).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (!dm) continue;
    const v = ap[e.venue?.__ref] ?? {};
    const venue = v.name && v.name !== "Online event" ? [v.name, v.address, v.city, v.state].filter(Boolean).join(", ") : "";
    const fee = Number(e.feeSettings?.amount);
    out.push({ name: title, date: dm[1], time: dm[2], venue, price: Number.isFinite(fee) && fee > 0 ? fee : null, url: e.eventUrl, type: guessType(title) });
  }
  return out;
}

// WordPress "The Events Calendar": a documented JSON API. Returns null when the site doesn't offer it.
export async function tribe(siteUrl) {
  const origin = new URL(siteUrl).origin;
  if (/eventbrite|active\.com|facebook|instagram|meetup|google\./i.test(origin)) return null;
  const out = [];
  out.complete = true;
  for (let page = 1; page <= 3; page++) {
    let data;
    try {
      data = JSON.parse(await get(`${origin}/wp-json/tribe/events/v1/events?search=mah&start_date=${today}&per_page=50&page=${page}`));
    } catch {
      return page === 1 ? null : out;
    }
    if (!Array.isArray(data?.events)) return page === 1 ? null : out;
    for (const e of data.events) {
      const title = decode(String(e.title ?? "")).trim();
      const text = `${title} ${e.description ?? ""}`;
      const dm = String(e.start_date ?? "").match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/);
      if (!dm || e.all_day || !/mah[\s-]?j/i.test(title) || OTHER_STYLES.test(text.slice(0, 400))) continue;
      const v = e.venue && !Array.isArray(e.venue) ? e.venue : {};
      const venue = v.venue ? [decode(v.venue), v.address, v.city, v.stateprovince ?? v.state].filter(Boolean).join(", ") : "";
      const cost = Number(String(e.cost ?? "").replace(/[^0-9.]/g, ""));
      out.push({ name: title, date: dm[1], time: dm[2], venue, price: /free/i.test(String(e.cost)) ? 0 : Number.isFinite(cost) && cost > 0 ? cost : null, url: e.url, type: guessType(title) });
    }
    if (page >= (data.total_pages ?? 1)) break;
  }
  return out;
}

export async function eventbriteOrg(url) {
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

export async function jsonLd(url) {
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

