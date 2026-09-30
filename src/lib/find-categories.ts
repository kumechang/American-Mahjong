import { and, eq, gte, count } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { cities, clubs, instructors, events } from "@/db/schema";
import { todayEventDate } from "@/lib/city-counts";

type Db = Awaited<ReturnType<typeof getDb>>;

export type CategoryCity = {
  slug: string;
  name: string;
  state: string;
  n: number;
};

export type CategoryKey =
  | "clubs"
  | "lessons"
  | "instructors"
  | "openPlay"
  | "events"
  | "tournaments";

const cityCols = {
  slug: cities.slug,
  name: cities.name,
  state: cities.state,
};

// For each Find category, the published cities that have the most ACTIVE
// (and, for events, upcoming) listings of that kind. Counts follow what a
// city page actually shows.
export async function getCategoryCities(
  db: Db,
): Promise<Record<CategoryKey, CategoryCity[]>> {
  const published = eq(cities.published, true);
  const today = todayEventDate();

  const [clubRows, lessonClubRows, openPlayRows, instructorRows, eventRows, tournamentRows] =
    await Promise.all([
      db
        .select({ ...cityCols, n: count() })
        .from(clubs)
        .innerJoin(cities, eq(clubs.cityId, cities.id))
        .where(and(published, eq(clubs.status, "ACTIVE")))
        .groupBy(cities.id),
      db
        .select({ ...cityCols, n: count() })
        .from(clubs)
        .innerJoin(cities, eq(clubs.cityId, cities.id))
        .where(
          and(published, eq(clubs.status, "ACTIVE"), eq(clubs.lessonsAvailable, true)),
        )
        .groupBy(cities.id),
      db
        .select({ ...cityCols, n: count() })
        .from(clubs)
        .innerJoin(cities, eq(clubs.cityId, cities.id))
        .where(and(published, eq(clubs.status, "ACTIVE"), eq(clubs.openPlay, true)))
        .groupBy(cities.id),
      db
        .select({ ...cityCols, n: count() })
        .from(instructors)
        .innerJoin(cities, eq(instructors.cityId, cities.id))
        .where(and(published, eq(instructors.status, "ACTIVE")))
        .groupBy(cities.id),
      db
        .select({ ...cityCols, n: count() })
        .from(events)
        .innerJoin(cities, eq(events.cityId, cities.id))
        .where(
          and(published, eq(events.status, "ACTIVE"), gte(events.eventDate, today)),
        )
        .groupBy(cities.id),
      db
        .select({ ...cityCols, n: count() })
        .from(events)
        .innerJoin(cities, eq(events.cityId, cities.id))
        .where(
          and(
            published,
            eq(events.status, "ACTIVE"),
            eq(events.eventType, "TOURNAMENT"),
            gte(events.eventDate, today),
          ),
        )
        .groupBy(cities.id),
    ]);

  // Lessons = cities with teachers or clubs that offer lessons.
  const lessonMap = new Map<string, CategoryCity>();
  for (const row of [...lessonClubRows, ...instructorRows]) {
    const existing = lessonMap.get(row.slug);
    lessonMap.set(row.slug, {
      ...row,
      n: (existing?.n ?? 0) + row.n,
    });
  }

  const top = (rows: CategoryCity[]) =>
    [...rows].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));

  return {
    clubs: top(clubRows),
    lessons: top([...lessonMap.values()]),
    instructors: top(instructorRows),
    openPlay: top(openPlayRows),
    events: top(eventRows),
    tournaments: top(tournamentRows),
  };
}
