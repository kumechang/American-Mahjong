import { and, eq, gte, count } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { clubs, instructors, events } from "@/db/schema";

type Db = Awaited<ReturnType<typeof getDb>>;

// Events are stored as naive "YYYY-MM-DD HH:MM:SS" strings (no timezone),
// so "today" is compared as the same shape. Uses the UTC date, which can
// keep an event visible for a few hours after it ends in the US — better
// than hiding one that is still upcoming.
export function todayEventDate(now: Date = new Date()): string {
  return `${now.toISOString().slice(0, 10)} 00:00:00`;
}

export type CityCounts = {
  clubCount: number;
  instructorCount: number;
  eventCount: number;
};

// One grouped query per table instead of three per city. Counts match what
// each city page shows publicly: ACTIVE rows only, upcoming events only.
// The queries deliberately do not filter by `IN (cityIds)`: D1 allows at most
// 100 bound variables per statement, and /cities broke the day more than 100
// cities were published. Grouping every city (a few hundred rows at most) and
// keeping the ones asked for is cheaper than splitting the list.
export async function getCityCounts(
  db: Db,
  cityIds: string[],
): Promise<Map<string, CityCounts>> {
  const result = new Map<string, CityCounts>();
  for (const id of cityIds) {
    result.set(id, { clubCount: 0, instructorCount: 0, eventCount: 0 });
  }
  if (cityIds.length === 0) return result;

  const [clubRows, instructorRows, eventRows] = await Promise.all([
    db
      .select({ cityId: clubs.cityId, value: count() })
      .from(clubs)
      .where(eq(clubs.status, "ACTIVE"))
      .groupBy(clubs.cityId),
    db
      .select({ cityId: instructors.cityId, value: count() })
      .from(instructors)
      .where(eq(instructors.status, "ACTIVE"))
      .groupBy(instructors.cityId),
    db
      .select({ cityId: events.cityId, value: count() })
      .from(events)
      .where(
        and(eq(events.status, "ACTIVE"), gte(events.eventDate, todayEventDate())),
      )
      .groupBy(events.cityId),
  ]);

  for (const row of clubRows) {
    const c = result.get(row.cityId);
    if (c) c.clubCount = row.value;
  }
  for (const row of instructorRows) {
    const c = result.get(row.cityId);
    if (c) c.instructorCount = row.value;
  }
  for (const row of eventRows) {
    const c = result.get(row.cityId);
    if (c) c.eventCount = row.value;
  }
  return result;
}
