#!/usr/bin/env node
// Weekly freshness report. Reads the local D1 (run
// `npx wrangler d1 migrations apply DB --local` first) and prints Markdown:
//   1. published cities under the 5-row publish rule (or close to it)
//   2. ACTIVE events already past their date (hidden on the site, but should be
//      retired in the data) and events coming up in the next 14 days
//   3. ACTIVE rows not verified for 75+ days (the site shows a stale note at 90)
//   4. dead or unreachable source links
//
//   node scripts/freshness-report.mjs [--skip-links] [--out=report.md]
//
// Report only: it never edits data. Fixes go through a researcher CSV and a
// migration like everything else.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const skipLinks = args.includes("--skip-links");
const out = args.find((a) => a.startsWith("--out="))?.slice(6);
const MIN_ROWS = 5;
const STALE_DAYS = 75;

function query(sql) {
  const raw = execFileSync("npx", ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command", sql], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  return JSON.parse(raw.slice(raw.indexOf("[")))[0].results;
}

const now = new Date();
const today = now.toISOString().slice(0, 10);
const inTwoWeeks = new Date(now.getTime() + 14 * 864e5).toISOString().slice(0, 10);
const daysAgo = (s) => (s ? Math.floor((now - new Date(s)) / 864e5) : null);

const cities = query(`SELECT id, slug, name, state FROM City WHERE published = 1 ORDER BY name`);
const clubs = query(`SELECT name, cityId, sourceUrl, lastVerifiedAt FROM Club WHERE status = 'ACTIVE'`);
const instructors = query(`SELECT name, cityId, sourceUrl, lastVerifiedAt FROM Instructor WHERE status = 'ACTIVE'`);
const events = query(`SELECT name, cityId, eventDate, sourceUrl, registrationUrl, lastVerifiedAt FROM Event WHERE status = 'ACTIVE'`);

const cityById = new Map(cities.map((c) => [c.id, c]));
const label = (r) => `${r.name} (${cityById.get(r.cityId)?.name ?? "unpublished city"})`;
const upcoming = events.filter((e) => e.eventDate.slice(0, 10) >= today);

// 1. Coverage
const coverage = cities
  .map((c) => {
    const n = clubs.filter((r) => r.cityId === c.id).length
      + instructors.filter((r) => r.cityId === c.id).length
      + upcoming.filter((r) => r.cityId === c.id).length;
    const soon = upcoming.filter((r) => r.cityId === c.id && r.eventDate.slice(0, 10) <= inTwoWeeks).length;
    return { name: c.name, n, soon, after: n - soon };
  })
  .sort((a, b) => a.n - b.n);
const below = coverage.filter((c) => c.n < MIN_ROWS);
const atRisk = coverage.filter((c) => c.n >= MIN_ROWS && c.after < MIN_ROWS);

// 2. Events
const expired = events.filter((e) => e.eventDate.slice(0, 10) < today);

// 3. Stale
const stale = [...clubs.map((r) => ["club", r]), ...instructors.map((r) => ["instructor", r]), ...upcoming.map((r) => ["event", r])]
  .map(([kind, r]) => ({ kind, r, age: daysAgo(r.lastVerifiedAt) }))
  .filter((x) => x.age !== null && x.age >= STALE_DAYS)
  .sort((a, b) => b.age - a.age);
const unverified = [...clubs, ...instructors, ...upcoming].filter((r) => !r.lastVerifiedAt).length;

// 4. Links
const urlOwners = new Map();
for (const [kind, rows] of [["club", clubs], ["instructor", instructors], ["event", upcoming]]) {
  for (const r of rows) {
    for (const u of [r.sourceUrl, r.registrationUrl]) {
      if (!u || !/^https?:\/\//i.test(u)) continue;
      if (!urlOwners.has(u)) urlOwners.set(u, []);
      urlOwners.get(u).push(`${kind}: ${label(r)}`);
    }
  }
}

async function check(url) {
  const attempt = async (method) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    try {
      return await fetch(url, { method, redirect: "follow", signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; mahjong-map-freshness/1.0; +https://mahjong-map.com)" } });
    } finally {
      clearTimeout(t);
    }
  };
  try {
    let res = await attempt("HEAD");
    if (res.status >= 400) res = await attempt("GET");
    return res.status;
  } catch (e) {
    return e.name === "AbortError" ? "timeout" : `error (${e.cause?.code ?? e.message})`;
  }
}

const dead = [];
const unsure = [];
if (!skipLinks) {
  const urls = [...urlOwners.keys()];
  let i = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (i < urls.length) {
        const url = urls[i++];
        const s = await check(url);
        if (s === 404 || s === 410 || (typeof s === "string" && /ENOTFOUND/.test(s))) dead.push({ url, s });
        else if (typeof s === "string" || s >= 400) unsure.push({ url, s }); // 403/429/timeouts: often bot blocking, look by hand
      }
    }),
  );
}

const rows = (list, fn) => (list.length ? list.map(fn).join("\n") : "_None._");
const md = `# Freshness report — ${today}

Active rows: ${clubs.length} clubs, ${instructors.length} instructors, ${upcoming.length} upcoming events. Published cities: ${cities.length}.

## 1. Cities under the publish rule (${MIN_ROWS} active rows)
${rows(below, (c) => `- **${c.name}**: ${c.n} rows. Needs ${MIN_ROWS - c.n} more or should be unpublished.`)}

## 2. Cities that fall under ${MIN_ROWS} once events in the next 14 days pass
${rows(atRisk, (c) => `- **${c.name}**: ${c.n} rows now, ${c.after} after ${c.soon} event(s) pass. Ask the researcher for new dates.`)}

## 3. Events already past their date but still ACTIVE (${expired.length})
${expired.length ? `Hidden on the site already; set to INACTIVE in a cleanup migration.\n\n${rows(expired.slice(0, 40), (e) => `- ${e.eventDate.slice(0, 10)} — ${label(e)}`)}${expired.length > 40 ? `\n- …and ${expired.length - 40} more` : ""}` : "_None._"}

## 4. Not verified for ${STALE_DAYS}+ days (${stale.length}; ${unverified} with no date)
${rows(stale.slice(0, 40), (x) => `- ${x.age} days — ${x.kind}: ${label(x.r)}`)}${stale.length > 40 ? `\n- …and ${stale.length - 40} more` : ""}

## 5. Dead source links (${skipLinks ? "skipped" : dead.length})
${skipLinks ? "_Skipped._" : rows(dead, (d) => `- ${d.url} → ${d.s}\n  - ${[...new Set(urlOwners.get(d.url))].join("; ")}`)}

## 6. Links to check by hand (${skipLinks ? "skipped" : unsure.length})
Blocked, rate-limited or timed out. Many are bot protection, not dead pages.
${skipLinks ? "" : rows(unsure, (d) => `- ${d.url} → ${d.s}`)}
`;

if (out) writeFileSync(out, md);
else console.log(md);
