#!/usr/bin/env node
// Third discovery source: the Mahjong 4 Friends teacher directory (mahjong4friends.com/teachers/<state>, about 47 state pages).
// Each card gives a teacher's name, business name, town(s), website and a self-written note. Phone, email and Instagram are
// personal contact details and are never read into our files. Every row is a LEAD (NEEDS_REVIEW): the teacher's own site is
// checked later (scripts/verify-owners.mjs and the nightly research), and a note that says NMJL / American is only a hint.
// Never writes to the database.
//
//   node scripts/discover-mahjong4friends.mjs [--out-dir=data/inbox/<id>] [--max=150]
//
// Output: <out-dir>/m4f-<city>-<st>/instructors.csv + report.md. Exit code 3 = nothing new.

import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { arg, today, q, get, decode, csvCell, pages, OTHER_STYLES } from "./lib/crawl-lib.mjs";

// state code -> name, read from the site's own table (src/lib/us-states.ts)
const STATE_NAMES = Object.fromEntries([...readFileSync("src/lib/us-states.ts", "utf8").matchAll(/\b([A-Z]{2}): "([^"]+)"/g)].map((m) => [m[1], m[2]]));

const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const outDir = arg("out-dir") ?? `data/inbox/discover-m4f-${stamp}`;
const MAX_NEW = Number(arg("max") ?? 150);
const slugify = (t) => String(t).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const US_STATES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
const host = (u) => { try { return new URL(/^https?:/i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };

// ---------- what we already have ----------
const knownNames = new Set(), knownHosts = new Set();
for (const t of ["Club", "Instructor"]) for (const r of q(`SELECT name, website, sourceUrl FROM ${t}`)) {
  knownNames.add(norm(r.name));
  for (const u of [r.website, r.sourceUrl]) { const h = host(u ?? ""); if (h) knownHosts.add(h); }
}
const ourTowns = new Set(q(`SELECT name, state FROM City`).map((c) => `${norm(c.name)}|${c.state}`));
const archived = new Set(); // leads an earlier run already wrote
if (existsSync("data/inbox")) {
  for (const d of readdirSync("data/inbox").filter((x) => x.startsWith("discover-"))) {
    for (const c of readdirSync(`data/inbox/${d}`, { withFileTypes: true }).filter((x) => x.isDirectory() && x.name.startsWith("m4f-"))) {
      const f = `data/inbox/${d}/${c.name}/instructors.csv`;
      if (existsSync(f)) for (const m of readFileSync(f, "utf8").split("\n").slice(1)) archived.add(norm(m.split(",")[0].replace(/^"|"$/g, "")));
    }
  }
}

// ---------- the directory ----------
const index = await get("https://mahjong4friends.com/teachers");
const states = [...new Set([...index.matchAll(/href="\/teachers\/([a-z]{2})"/g)].map((m) => m[1].toUpperCase()))].filter((s) => US_STATES.has(s)).sort();
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const leads = [];
let readStates = 0, ambiguous = 0;
const seen = new Set();
for (const st of states) {
  if (leads.length >= MAX_NEW) break;
  let html;
  try { html = await get(`https://mahjong4friends.com/teachers/${st.toLowerCase()}`); } catch { continue; }
  readStates++;
  for (const card of html.split('<div class="teacher-card">').slice(1)) {
    const person = text((card.match(/<h3>([\s\S]*?)<\/h3>/) ?? [])[1] ?? "");
    const business = text((card.match(/class="teacher-business">([\s\S]*?)<\/div>/) ?? [])[1] ?? "");
    const location = text((card.match(/Location:<\/span>([\s\S]*?)<\/p>/) ?? [])[1] ?? "");
    const site = ((card.match(/Website:<\/span>\s*<a href="([^"]+)"/) ?? [])[1] ?? "").trim();
    const note = text((card.match(/Notes:<\/span>([\s\S]*?)<\/p>/) ?? [])[1] ?? "");
    const tags = [...card.matchAll(/teacher-state-tag"[^>]*>([A-Z]{2})</g)].map((m) => m[1]).filter((t) => US_STATES.has(t));
    const name = business || person;
    if (!name || !location) continue;
    if (OTHER_STYLES.test(`${name} ${note}`) && !/american|nmjl/i.test(note)) continue;
    if (knownNames.has(norm(name)) || knownNames.has(norm(person)) || archived.has(norm(name)) || seen.has(norm(name))) continue;
    const h = host(site);
    if (h && knownHosts.has(h)) continue;
    // the town: first place named ("Bentonville, Fayetteville, Rogers - Washington County, AR" -> Bentonville); one we already have wins
    const towns = location.split(/[,;\/]|\s[—–-]\s|\sand\s/).map((x) => x.replace(/\b[A-Z]{2}\b$/, "").replace(/\(.*?\)/g, "").trim()).filter((x) => x && !/county|area|metro|northwest|southwest|northeast|southeast|north|south|east|west|virtual|online|zoom/i.test(x) && x.split(" ").length <= 3);
    // a teacher is listed under every state served: the state of the town is the one we already know it in, or the one the location names
    const stateOf = (t) => tags.find((s) => ourTowns.has(`${norm(t)}|${s}`)) ?? tags.find((s) => new RegExp(`\\b(${s}|${STATE_NAMES[s] ?? "~"})\\b`).test(location)) ?? (tags.length === 1 ? tags[0] : st);
    const known = towns.find((t) => ourTowns.has(`${norm(t)}|${stateOf(t)}`));
    const city = known ?? towns[0];
    if (!city) continue;
    const state = stateOf(city);
    if (tags.length > 1 && !known && !tags.some((s) => new RegExp(`\\b(${s}|${STATE_NAMES[s] ?? "~"})\\b`).test(location))) { ambiguous++; continue; } // cannot tell which of several states
    seen.add(norm(name));
    const evidence = /american|nmjl|national mah/i.test(note);
    leads.push({ name, person, city, state, site: site ? (/^https?:/i.test(site) ? site : `https://${site}`) : "", note, evidence, location });
    if (leads.length >= MAX_NEW) break;
  }
}

if (leads.length === 0) {
  console.log(`# Mahjong 4 Friends discovery ${today}\n\n- State pages read: ${readStates} of ${states.length}\n- New teachers: 0 (${ambiguous} skipped: state unclear)`);
  process.exit(3);
}

// ---------- write ----------
const HEAD = "name,city,state,website,contact,private_lesson,group_lesson,online_lesson,beginner_lesson,price,notes,source_url,last_verified_at,status".split(",");
const byCity = new Map();
for (const l of leads) {
  const key = `m4f-${slugify(l.city)}-${l.state.toLowerCase()}`;
  if (!byCity.has(key)) byCity.set(key, []);
  byCity.get(key).push(l);
}
const summary = [];
for (const [key, list] of byCity) {
  const dir = `${outDir}/${key}`;
  mkdirSync(dir, { recursive: true });
  const rows = list.map((l) => ({
    name: l.name, city: l.city, state: l.state, website: l.site, contact: "",
    private_lesson: /private/i.test(l.note) ? "TRUE" : "FALSE", group_lesson: /group|class|workshop/i.test(l.note) ? "TRUE" : "FALSE",
    online_lesson: /online|virtual|zoom/i.test(l.note) ? "TRUE" : "FALSE", beginner_lesson: /beginner|learn|basics|new to/i.test(l.note) ? "TRUE" : "FALSE", price: "",
    notes: `Listed in the Mahjong 4 Friends teacher directory (${l.location}); the teacher's own site has not been checked.${l.evidence ? ` Directory note: "${l.note.slice(0, 220)}"` : ""}`.slice(0, 600),
    source_url: `https://mahjong4friends.com/teachers/${l.state.toLowerCase()}`, last_verified_at: today, status: "NEEDS_REVIEW",
  }));
  writeFileSync(`${dir}/instructors.csv`, [HEAD.join(","), ...rows.map((r) => HEAD.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
  const known = ourTowns.has(`${norm(list[0].city)}|${list[0].state}`);
  writeFileSync(
    `${dir}/report.md`,
    `# ${list[0].city}, ${list[0].state}: Mahjong 4 Friends discovery (${today})\n\n${known ? "This city is already on the site." : "**This city is not on the site yet.**"}\n\n## Teachers listed\n${list.map((l) => `- ${l.name} (${l.location}) ${l.site || "no website"}${l.evidence ? " [note mentions American/NMJL]" : ""}`).join("\n")}\n\n## Next step\nCheck the teacher's own site for American / NMJL and dated classes, then promote. Rows here are NEEDS_REVIEW by design; the directory is a lead, not a source.\n`,
  );
  summary.push(`- ${list[0].city}, ${list[0].state}${known ? "" : " (new place)"}: ${list.map((l) => `${l.name}${l.evidence ? " [NMJL/American in note]" : ""}${l.site ? "" : " [no site]"}`).join("; ")}`);
}
console.log(`# Mahjong 4 Friends discovery ${today}\n\n- State pages read: ${readStates} of ${states.length}\n- Pages fetched: ${pages()}\n- New teachers: ${leads.length} in ${byCity.size} towns (${ambiguous} skipped: state unclear)\n${summary.join("\n")}\n- Output: ${outDir}`);
process.exit(0);
