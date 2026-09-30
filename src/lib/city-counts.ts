import { and, eq, gte, inArray, count } from "drizzle-orm";
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
      .where(and(inArray(clubs.cityId, cityIds), eq(clubs.status, "ACTIVE")))
      .groupBy(clubs.cityId),
    db
      .select({ cityId: instructors.cityId, value: count() })
      .from(instructors)
      .where(
        and(
          inArray(instructors.cityId, cityIds),
          eq(instructors.status, "ACTIVE"),
        ),
      )
      .groupBy(instructors.cityId),
    db
      .select({ cityId: events.cityId, value: count() })
      .from(events)
      .where(
        and(
          inArray(events.cityId, cityIds),
          eq(events.status, "ACTIVE"),
          gte(events.eventDate, todayEventDate()),
        ),
      )
      .groupBy(events.cityId),
  ]);

  for (const row of clubRows) result.get(row.cityId)!.clubCount = row.value;
  for (const row of instructorRows)
    result.get(row.cityId)!.instructorCount = row.value;
  for (const row of eventRows) result.get(row.cityId)!.eventCount = row.value;
  return result;
}
