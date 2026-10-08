import { and, asc, eq, gte, lte } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { cities, events } from "@/db/schema";
import { todayEventDate } from "@/lib/city-counts";

type Db = Awaited<ReturnType<typeof getDb>>;

export type UpcomingEvent = {
  id: string;
  name: string;
  eventDate: string;
  startTime: string | null;
  eventType: string;
  beginnerFriendly: boolean;
  price: number | null;
  cityName: string;
  cityState: string;
  citySlug: string;
};

// Next games across the site for the home page: ACTIVE events in published
// cities within the next two weeks, one per city so a single busy city
// doesn't fill the list, beginner-friendly ones first.
export async function getUpcomingHighlights(
  db: Db,
  limit = 6,
): Promise<UpcomingEvent[]> {
  const now = new Date();
  const horizon = new Date(now.getTime() + 14 * 864e5);

  const rows = await db
    .select({
      id: events.id,
      name: events.name,
      eventDate: events.eventDate,
      startTime: events.startTime,
      eventType: events.eventType,
      beginnerFriendly: events.beginnerFriendly,
      price: events.price,
      cityName: cities.name,
      cityState: cities.state,
      citySlug: cities.slug,
    })
    .from(events)
    .innerJoin(cities, eq(events.cityId, cities.id))
    .where(
      and(
        eq(events.status, "ACTIVE"),
        eq(cities.published, true),
        gte(events.eventDate, todayEventDate(now)),
        lte(events.eventDate, `${horizon.toISOString().slice(0, 10)} 23:59:59`),
      ),
    )
    .orderBy(asc(events.eventDate), asc(events.startTime))
    .limit(300);

  const bestPerCity = new Map<string, UpcomingEvent>();
  for (const row of rows) {
    const current = bestPerCity.get(row.citySlug);
    if (!current || (!current.beginnerFriendly && row.beginnerFriendly)) {
      bestPerCity.set(row.citySlug, row);
    }
  }
  return [...bestPerCity.values()]
    .sort(
      (a, b) =>
        Number(b.beginnerFriendly) - Number(a.beginnerFriendly) ||
        a.eventDate.localeCompare(b.eventDate) ||
        (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    )
    .slice(0, limit)
    .sort(
      (a, b) =>
        a.eventDate.localeCompare(b.eventDate) ||
        (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    );
}
