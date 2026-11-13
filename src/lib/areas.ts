import { alias } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { cities } from "@/db/schema";

type Db = Awaited<ReturnType<typeof getDb>>;

// Area pages: a small town can be folded into a nearby city (City.areaId, from data/city-areas.txt). Its rows keep their own cityId;
// everything that groups or filters by city on the public site goes through the page the row belongs to — its own city, or the
// city it was folded into. Joins:  .innerJoin(cities, eq(clubs.cityId, cities.id)).innerJoin(areaPage, onAreaPage)
export const areaPage = alias(cities, "areaPage");
export const onAreaPage = eq(areaPage.id, sql`coalesce(${cities.areaId}, ${cities.id})`);

// town id -> the id of the page it is folded into (towns that stand on their own are absent)
export async function getAreaMap(db: Db): Promise<Map<string, string>> {
  const rows = await db.select({ id: cities.id, areaId: cities.areaId }).from(cities);
  const map = new Map<string, string>();
  for (const r of rows) if (r.areaId) map.set(r.id, r.areaId);
  return map;
}
