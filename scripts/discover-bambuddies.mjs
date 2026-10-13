#!/usr/bin/env node
// Second discovery source: the BamBuddies "American mahjong near me" directory
// (bambuddies.org/mahjong-near-me/<city>-<st>, about 80 metro pages). The directory only lists American
// mahjong, groups and teachers, with the area, a one-line schedule and often a street address, but it
// gives no website for the group. So every row is a LEAD: NEEDS_REVIEW, the directory's own words in
// the description and schedule, and a person (or the research server) finds the group's own page and
// confirms American / NMJL before anything is published. Never writes to the database.
//
//   node scripts/discover-bambuddies.mjs [--out-dir=data/inbox/<id>] [--max=120]
//
// Output goes to <out-dir>/bb-<city>-<st>/clubs.csv and instructors.csv (same layout as the other
// discovery output, so the workflow validates and the nightly prompt builder reads it the same way).
// Places already on the site (by name or street address) and leads archived by an earlier run are skipped.
// Exit code 3 = nothing new.

import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { arg, today, q, get, decode, csvCell, pages, OTHER_STYLES } from "./lib/crawl-lib.mjs";

const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const outDir = arg("out-dir") ?? `data/inbox/discover-bb-${stamp}`;
const MAX_NEW = Number(arg("max") ?? 80);
const slugify = (t) => String(t).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const US_STATES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));

// ---------- what we already have ----------
const knownNames = new Set();
const knownStreets = new Set(); // "123 main" (number + first street word) from addresses we hold
const street = (s) => { const m = String(s ?? "").match(/\b(\d{2,6})\s+((?:[NSEW]\.?\s+)?[A-Za-z0-9]+)/); return m ? norm(`${m[1]} ${m[2]}`) : ""; };
for (const t of ["Club", "Instructor"]) {
  for (const r of q(`SELECT name${t === "Club" ? ", address" : ""} FROM ${t}`)) {
    knownNames.add(norm(r.name));
    if (r.address) knownStreets.add(street(r.address));
  }
}
const names = [...knownNames].filter((n) => n.length >= 7);
// "Mahjong Mondays at The Landmark (Knox Tiles)" is known when "Knox Tiles" is
const alreadyOurs = (name, text) => {
  const n = norm(name);
  if (knownNames.has(n)) return true;
  for (const p of name.matchAll(/\(([^)]+)\)/g)) if (knownNames.has(norm(p[1]))) return true;
  const st = street(text);
  return Boolean(st) && knownStreets.has(st);
};
const archived = new Set(); // leads an earlier run already wrote
if (existsSync("data/inbox")) {
  for (const d of readdirSync("data/inbox").filter((x) => x.startsWith("discover-"))) {
    for (const c of readdirSync(`data/inbox/${d}`, { withFileTypes: true }).filter((x) => x.isDirectory() && x.name.startsWith("bb-"))) {
      for (const f of ["clubs.csv", "instructors.csv"]) {
        const p = `data/inbox/${d}/${c.name}/${f}`;
        if (!existsSync(p)) continue;
        for (const m of readFileSync(p, "utf8").split("\n").slice(1)) archived.add(norm(m.split(",")[0].replace(/^"|"$/g, "")));
      }
    }
  }
}
const ourCities = new Set(q(`SELECT name, state FROM City`).map((c) => `${norm(c.name)}|${c.state}`));

// ---------- the directory ----------
const index = await get("https://www.bambuddies.org/mahjong-near-me/");
const paths = [...new Set([...index.matchAll(/href="(\/mahjong-near-me\/[a-z0-9-]+)"/g)].map((m) => m[1]))].sort();
const leads = []; // {kind, name, city, state, area, sched, address, hub}
let readPages = 0;
for (const path of paths) {
  if (leads.length >= MAX_NEW) break;
  const m = path.match(/-([a-z]{2})$/);
  const hubState = m ? m[1].toUpperCase() : "";
  let html;
  try { html = await get(`https://www.bambuddies.org${path}`); } catch { continue; }
  readPages++;
  const hubName = decode((html.match(/<h1[^>]*>([^<]*)<\/h1>/i) ?? [])[1] ?? "").replace(/^American Mahjong (?:in|near)\s*/i, "").trim();
  const teacherAt = html.search(/id="teachers"/);
  for (const li of html.matchAll(/<li class="venue"[^>]*>([\s\S]*?)<\/li>/g)) {
    const body = li[1];
    const name = decode((body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) ?? [])[1] ?? "").replace(/<[^>]+>/g, "").trim();
    const area = decode((body.match(/class="area"[^>]*>([\s\S]*?)<\/p>/) ?? [])[1] ?? "").replace(/<[^>]+>/g, "").trim();
    const sched = decode((body.match(/class="sched"[^>]*>([\s\S]*?)<\/p>/) ?? [])[1] ?? "").replace(/<[^>]+>/g, "").trim();
    if (!name) continue;
    const kind = teacherAt >= 0 && li.index > teacherAt ? "instructor" : "club";
    // The town: the last place name of a street address in the schedule line ("…, 145 Awohili Dr, Loudon"), else a town in the
    // area ("Maryville", "Knoxville (Halls)", "Tellico Village / Loudon"), else the metro page's own city. A town we already
    // have on the site wins; a neighbourhood or a "Metro …" label is not a town.
    const tail = (sched.match(/\b\d{2,6}\s+[A-Za-z0-9.' ]+?(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Way|Pkwy|Hwy|Ct|Pl|Tpke|Cir)\b\.?,\s*([A-Z][A-Za-z .]+?)(?:[,;.)]|\s+\d|$)/) ?? [])[1]?.trim();
    const state = hubState || "";
    const hubCity = hubName.split(/[–,\/]/)[0].trim();
    const generic = /^(metro|greater|north|south|east|west|northeast|northwest|southeast|southwest|nw|ne|sw|se|intown|midtown|downtown|central|inside|outside|near)\b/i;
    const parts = area.split(/[\/(),–]|\s-\s/).map((x) => x.trim()).filter(Boolean);
    const candidates = [tail, ...parts, hubCity].filter((x) => x && !/\d/.test(x) && x.split(/\s+/).length <= 3);
    const city = candidates.find((x) => ourCities.has(`${norm(x)}|${state}`)) ?? candidates.find((x) => !generic.test(x)) ?? hubCity;
    if (alreadyOurs(name, sched) || archived.has(norm(name)) || OTHER_STYLES.test(`${name} ${sched}`)) continue;
    if (leads.some((l) => norm(l.name) === norm(name) && l.city === city)) continue;
    leads.push({ kind, name, city, state, area, sched, address: (sched.match(/\b\d{2,6}\s+[A-Za-z0-9.' ]+?(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Way|Pkwy|Hwy|Ct|Pl|Tpke|Cir)\b\.?(?:,\s*[A-Za-z .]+)?/) ?? [""])[0].trim(), hub: `${hubName}${hubState ? ", " + hubState : ""}` });
  }
}

if (leads.length === 0) {
  console.log(`# BamBuddies discovery ${today}\n\n- Metro pages read: ${readPages} of ${paths.length}\n- New places: 0`);
  process.exit(3);
}

// ---------- write ----------
const CLUB_H = "name,city,state,description,address,website,phone,email,latitude,longitude,beginner_friendly,lessons_available,open_play,social_play,women_only,free,price,schedule,source_url,last_verified_at,status".split(",");
const INSTR_H = "name,city,state,website,contact,private_lesson,group_lesson,online_lesson,beginner_lesson,price,notes,source_url,last_verified_at,status".split(",");
const byCity = new Map();
for (const l of leads) {
  const key = `bb-${slugify(l.city)}-${l.state.toLowerCase()}`;
  if (!byCity.has(key)) byCity.set(key, []);
  byCity.get(key).push(l);
}
const summary = [];
for (const [key, list] of byCity) {
  const dir = `${outDir}/${key}`;
  mkdirSync(dir, { recursive: true });
  const clubs = list.filter((l) => l.kind === "club").map((l) => ({
    name: l.name, city: l.city, state: l.state,
    description: `Listed by the BamBuddies American mahjong directory (${l.hub}); the group's own site has not been read. Directory says: ${l.sched}`.slice(0, 600),
    address: l.address, website: "", phone: "", email: "", latitude: "", longitude: "",
    beginner_friendly: /beginner|learn|lesson|class|101/i.test(l.sched) ? "TRUE" : "FALSE", lessons_available: /lesson|class|101/i.test(l.sched) ? "TRUE" : "FALSE",
    open_play: /open play/i.test(l.sched) ? "TRUE" : "FALSE", social_play: "TRUE", women_only: "FALSE", free: "FALSE", price: "",
    schedule: l.sched.slice(0, 300), source_url: "https://www.bambuddies.org/mahjong-near-me/", last_verified_at: today, status: "NEEDS_REVIEW",
  }));
  const teachers = list.filter((l) => l.kind === "instructor").map((l) => ({
    name: l.name, city: l.city, state: l.state, website: "", contact: "",
    private_lesson: /private/i.test(l.sched) ? "TRUE" : "FALSE", group_lesson: "TRUE", online_lesson: /online|virtual/i.test(l.sched) ? "TRUE" : "FALSE", beginner_lesson: /beginner|learn|101/i.test(l.sched) ? "TRUE" : "FALSE",
    price: "", notes: `Listed by the BamBuddies American mahjong directory (${l.hub}); the teacher's own site has not been read. Directory says: ${l.sched}`.slice(0, 600),
    source_url: "https://www.bambuddies.org/mahjong-near-me/", last_verified_at: today, status: "NEEDS_REVIEW",
  }));
  if (clubs.length) writeFileSync(`${dir}/clubs.csv`, [CLUB_H.join(","), ...clubs.map((r) => CLUB_H.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
  if (teachers.length) writeFileSync(`${dir}/instructors.csv`, [INSTR_H.join(","), ...teachers.map((r) => INSTR_H.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n");
  const known = ourCities.has(`${norm(list[0].city)}|${list[0].state}`);
  writeFileSync(
    `${dir}/report.md`,
    `# ${list[0].city}, ${list[0].state}: BamBuddies discovery (${today})\n\n${known ? "This city is already on the site." : "**This city is not on the site yet** (it may belong to a nearby metro page)."}\n\n## Leads from the BamBuddies directory\n${list.map((l) => `- ${l.kind === "club" ? "Group" : "Teacher"}: ${l.name} (${l.area}): ${l.sched}`).join("\n")}\n\n## Next step\nFind each one's own page, confirm American / NMJL and a dated session, then promote. Rows here are NEEDS_REVIEW by design; the directory is a lead, not a source.\n`,
  );
  summary.push(`- ${list[0].city}, ${list[0].state}${known ? "" : " (new place)"}: ${list.map((l) => l.name).join("; ")}`);
}
console.log(`# BamBuddies discovery ${today}\n\n- Metro pages read: ${readPages} of ${paths.length}\n- Pages fetched: ${pages()}\n- New places: ${leads.length} in ${byCity.size} towns\n${summary.join("\n")}\n- Output: ${outDir}`);
process.exit(0);
