import Link from "next/link";
import type { Metadata } from "next";
import { eq, asc, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities, clubs, instructors, events } from "@/db/schema";

export const metadata: Metadata = {
  title: "American Mahjong by City",
  description:
    "Find beginner-friendly American Mahjong clubs, lessons, and events in your city.",
};

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so this route can't be statically
// prerendered or revalidated on a timer — it's rendered per request.
export const dynamic = "force-dynamic";

export default async function CitiesPage() {
  const db = await getDb();
  const cityRows = await db
    .select()
    .from(cities)
    .where(eq(cities.published, true))
    .orderBy(asc(cities.name));

  const citiesWithCounts = await Promise.all(
    cityRows.map(async (city) => {
      const [[clubCount], [instructorCount], [eventCount]] = await Promise.all(
        [
          db
            .select({ value: count() })
            .from(clubs)
            .where(eq(clubs.cityId, city.id)),
          db
            .select({ value: count() })
            .from(instructors)
            .where(eq(instructors.cityId, city.id)),
          db
            .select({ value: count() })
            .from(events)
            .where(eq(events.cityId, city.id)),
        ],
      );
      return {
        ...city,
        clubCount: clubCount.value,
        instructorCount: instructorCount.value,
        eventCount: eventCount.value,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        American Mahjong by city
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        We only publish a city page once we have real, verified clubs,
        lessons, or events for it.
      </p>

      {citiesWithCounts.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-black/20 p-6 text-sm text-zinc-500 dark:border-white/20">
          No city pages are published yet. Run the database seed script to
          add sample cities.
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {citiesWithCounts.map((city) => (
            <li key={city.id}>
              <Link
                href={`/cities/${city.slug}`}
                className="block rounded-xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
              >
                <h2 className="font-semibold">
                  {city.name}, {city.state}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {city.clubCount} clubs &middot; {city.instructorCount}{" "}
                  instructors &middot; {city.eventCount} events
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
