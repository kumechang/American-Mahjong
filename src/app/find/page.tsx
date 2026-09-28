import Link from "next/link";
import type { Metadata } from "next";
import { eq, and, asc, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities, clubs, instructors, events } from "@/db/schema";

export const metadata: Metadata = {
  title: "Find American Mahjong Near You",
  description:
    "Find beginner-friendly American Mahjong clubs, lessons, instructors, open play, and events by city.",
};

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so this route can't be statically
// prerendered or revalidated on a timer — it's rendered per request.
export const dynamic = "force-dynamic";

const CATEGORIES = [
  {
    title: "Clubs",
    description: "Beginner-friendly and social Mahjong clubs.",
  },
  {
    title: "Lessons",
    description: "Group and private lessons for new players.",
  },
  {
    title: "Instructors",
    description: "Instructors offering private, group, or online lessons.",
  },
  {
    title: "Open Play",
    description: "Drop-in games where beginners are welcome.",
  },
  {
    title: "Events",
    description: "One-off Mahjong meetups and social events.",
  },
  {
    title: "Tournaments",
    description: "Competitive American Mahjong tournaments.",
  },
];

export default async function FindPage() {
  const db = await getDb();
  const cityRows = await db
    .select()
    .from(cities)
    .where(eq(cities.published, true))
    .orderBy(asc(cities.name));

  const citiesWithCounts = await Promise.all(
    cityRows.map(async (city) => {
      // Counts match what the city page actually shows publicly — see the
      // status-filtering note in src/app/cities/[slug]/page.tsx.
      const [[clubCount], [instructorCount], [eventCount]] = await Promise.all(
        [
          db
            .select({ value: count() })
            .from(clubs)
            .where(and(eq(clubs.cityId, city.id), eq(clubs.status, "ACTIVE"))),
          db
            .select({ value: count() })
            .from(instructors)
            .where(
              and(
                eq(instructors.cityId, city.id),
                eq(instructors.status, "ACTIVE"),
              ),
            ),
          db
            .select({ value: count() })
            .from(events)
            .where(and(eq(events.cityId, city.id), eq(events.status, "ACTIVE"))),
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
        Find American Mahjong near you
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Clubs, lessons, instructors, and events are organized by city. Pick
        your city below to see what&apos;s available.
      </p>

      <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        {CATEGORIES.map((category) => (
          <li key={category.title} title={category.description}>
            {category.title}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Pick your city</h2>

      {citiesWithCounts.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-black/20 p-6 text-sm text-zinc-500 dark:border-white/20">
          No city pages are published yet. Check back soon.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {citiesWithCounts.map((city) => (
            <li key={city.id}>
              <Link
                href={`/cities/${city.slug}`}
                className="block rounded-xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
              >
                <h3 className="font-semibold">
                  {city.name}, {city.state}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {city.clubCount} clubs &middot; {city.instructorCount}{" "}
                  instructors &middot; {city.eventCount} events
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
        Don&apos;t see your city yet? We&apos;re adding more all the time —
        check back soon.
      </p>
    </div>
  );
}
