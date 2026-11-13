#!/usr/bin/env node
// Turns data/city-areas.txt ("<town>, ST > <hub>, ST" per line) into migration SQL:
//   - City.areaId for every folded town (and published = 0 for it: its URL redirects to the hub's page)
//   - the same group or teacher filed under two towns of one area is retired once (INACTIVE) so the hub page shows it once
//   - the hub is published when the whole area has five active rows (clubs + teachers + upcoming sessions) and an intro
// Intros for hubs come from data/area-intros.json ({slug: intro}).
// Usage: node scripts/city-areas-sql.mjs [--alter] [--out=migrations/0284_city_areas.sql]
//   --alter adds the ALTER TABLE for City.areaId (first migration only). Reads the local D1 for the duplicate check.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { arg, q } from "./lib/crawl-lib.mjs";

const key = (n, s) => `${n.toLowerCase().replace(/’/g, "'")}|${s}`;
const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;
const cities = q(`SELECT id, name, state, slug FROM City`);
const byKey = new Map(cities.map((c) => [key(c.name, c.state), c]));
const find = (text) => {
  const m = text.trim().match(/^(.+), ([A-Z]{2})$/);
  const c = m && (byKey.get(key(m[1], m[2])) ?? (m[2] === "DC" ? byKey.get(key("Washington", "DC")) : null));
  if (!c) throw new Error(`unknown city: ${text}`);
  return c;
};

const pairs = readFileSync("data/city-areas.txt", "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split(">").map(find)).map(([town, hub]) => ({ town, hub }));
const hubs = new Map();
for (const { town, hub } of pairs) { if (!hubs.has(hub.id)) hubs.set(hub.id, { hub, towns: [] }); hubs.get(hub.id).towns.push(town); }
for (const { town } of pairs) if (hubs.has(town.id)) throw new Error(`${town.name} is both a town and a hub`);

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\b(the|mahjong|mah jongg|mahjongg|mahj|club|llc|inc)\b/g, " ").replace(/\s+/g, " ").trim();
const out = [];
if (process.argv.includes("--alter")) out.push(`ALTER TABLE "City" ADD COLUMN "areaId" TEXT;`, `CREATE INDEX IF NOT EXISTS "City_areaId_idx" ON "City" ("areaId");`, "");
out.push("-- Towns folded into a nearby city's area page (data/city-areas.txt); their URLs redirect to the hub");
for (const { town, hub } of pairs) out.push(`UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = ${sqlStr(hub.slug)}), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(town.slug)}; -- ${town.name}, ${town.state} > ${hub.name}`);

out.push("", "-- The same group or teacher filed under two towns of one area: keep the first (the hub's own, else the first town), retire the copies");
for (const { hub, towns } of hubs.values()) {
  const ids = [hub, ...towns].map((c) => c.id);
  const marks = ids.map((i) => sqlStr(i)).join(",");
  for (const table of ["Club", "Instructor"]) {
    const rows = q(`SELECT slug, name, cityId FROM ${table} WHERE status = 'ACTIVE' AND cityId IN (${marks}) ORDER BY (cityId = ${sqlStr(hub.id)}) DESC, slug`);
    const seen = new Map();
    for (const r of rows) {
      const k = norm(r.name), first = seen.get(k);
      if (first && first.cityId !== r.cityId) out.push(`UPDATE "${table}" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(r.slug)}; -- same as ${first.slug}`);
      else if (!first) seen.set(k, r);
    }
  }
}

const intros = existsSync("data/area-intros.json") ? JSON.parse(readFileSync("data/area-intros.json", "utf8")) : {};
const hubSlugs = new Set([...hubs.values()].map((h) => h.hub.slug));
out.push("", "-- Intros written for the area pages (data/area-intros.json)");
for (const [slug, intro] of Object.entries(intros)) {
  if (!hubSlugs.has(slug)) throw new Error(`intro for ${slug}, which is not a hub in data/city-areas.txt`);
  out.push(`UPDATE "City" SET "intro" = ${sqlStr(intro)}, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(slug)};`);
}

out.push("", "-- A hub is published once its whole area has five active rows and an intro");
for (const { hub } of hubs.values()) {
  out.push(`UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = ${sqlStr(hub.slug)} AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;`);
}
const path = arg("out");
const text = out.join("\n") + "\n";
if (path) { writeFileSync(path, text); console.log(`wrote ${path}: ${pairs.length} towns into ${hubs.size} areas`); } else console.log(text);
process.exit(0);
