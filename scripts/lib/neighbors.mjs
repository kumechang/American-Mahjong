// Towns around the places that already have the most mahjong, for searches that start from a town name (Eventbrite).
// Source: the US Census Bureau place gazetteer (public domain; name, state, latitude, longitude of every incorporated place and CDP).
// A "dense" place is one of our cities with at least MIN_ROWS active rows (clubs + teachers + upcoming sessions); every incorporated
// place within RADIUS miles of one that is not already a city on the site is a candidate, nearest to the densest metro first.
// Population comes from the Census city/town population estimates (sub-est2023.csv); places under MIN_POP are skipped, bigger ones come first.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_POP = "https://www2.census.gov/programs-surveys/popest/datasets/2020-2023/cities/totals/sub-est2023.csv";
const URL_ZIP = "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_place_national.zip";
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const miles = (a, b) => {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
};

function loadPop() {
  const cache = join(tmpdir(), "sub-est2023.csv");
  if (!existsSync(cache)) execFileSync("curl", ["-sS", "-L", "--fail", "-m", "90", "-o", cache, URL_POP]);
  const pop = new Map(); // GEOID (state + place) -> 2023 estimate
  for (const l of readFileSync(cache, "latin1").split("\n").slice(1)) {
    const f = l.split(",");
    if (f[0] === "162") pop.set(`${f[1]}${f[3]}`, Number(f[14]));
  }
  return pop;
}

function loadPlaces() {
  const pop = loadPop();
  const cache = join(tmpdir(), "gaz_place_national.txt");
  let text;
  if (existsSync(cache)) text = readFileSync(cache, "utf8");
  else {
    const dir = mkdtempSync(join(tmpdir(), "gaz-"));
    const zip = join(dir, "g.zip");
    execFileSync("curl", ["-sS", "-L", "--fail", "-m", "60", "-o", zip, URL_ZIP]);
    text = execFileSync("unzip", ["-p", zip], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    writeFileSync(cache, text);
  }
  const lines = text.split("\n").filter(Boolean);
  const head = lines[0].split("\t").map((h) => h.trim());
  const col = (n) => head.indexOf(n);
  const places = [];
  for (const l of lines.slice(1)) {
    const f = l.split("\t").map((x) => x.trim());
    const lsad = f[col("LSAD")];
    if (lsad === "57") continue; // CDP: not a town people search by
    const name = f[col("NAME")].replace(/\s+(city|town|village|borough|municipality|city and borough|\(balance\))$/i, "").replace(/\s+\(balance\)$/i, "").trim();
    const lat = Number(f[col("INTPTLAT")]), lon = Number(f[col("INTPTLONG")]);
    const people = pop.get(f[col("GEOID")]);
    if (name && Number.isFinite(lat) && Number.isFinite(lon) && people) places.push({ name, state: f[col("USPS")], lat, lon, pop: people });
  }
  return places;
}

// q: the crawl-lib query helper. Returns [{ name, state, miles, near }] nearest-first by density.
export function neighborTowns(q, { radius = 25, minRows = 6, minPop = 8000 } = {}) {
  const places = loadPlaces();
  // the dense places themselves are looked up among all places, not only the big ones
  const at = new Map(places.map((p) => [`${norm(p.name)}|${p.state}`, p]));
  const ours = q(`SELECT name, state FROM City`);
  const have = new Set(ours.map((c) => `${norm(c.name)}|${c.state}`));
  const rows = q(`SELECT ci.name, ci.state,
    (SELECT COUNT(*) FROM Club WHERE cityId = ci.id AND status = 'ACTIVE') +
    (SELECT COUNT(*) FROM Instructor WHERE cityId = ci.id AND status = 'ACTIVE') +
    (SELECT COUNT(*) FROM Event WHERE cityId = ci.id AND status = 'ACTIVE' AND eventDate >= date('now')) AS n FROM City ci`);
  const dense = rows.filter((r) => r.n >= minRows).map((r) => ({ ...r, p: at.get(`${norm(r.name)}|${r.state}`) })).filter((r) => r.p);
  const best = new Map();
  for (const p of places) {
    const key = `${norm(p.name)}|${p.state}`;
    if (have.has(key) || p.pop < minPop) continue;
    for (const d of dense) {
      if (Math.abs(p.lat - d.p.lat) > radius / 55 || Math.abs(p.lon - d.p.lon) > radius / 40) continue; // cheap box before haversine
      const m = miles(p, d.p);
      if (m > radius) continue;
      const score = m / Math.sqrt(d.n) / Math.log10(p.pop);
      if (!best.has(key) || score < best.get(key).score) best.set(key, { name: p.name, state: p.state, miles: Math.round(m), near: d.name, pop: p.pop, score });
    }
  }
  return [...best.values()].sort((a, b) => a.score - b.score);
}
