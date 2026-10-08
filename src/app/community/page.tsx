import Link from "next/link";
import type { Metadata } from "next";
import { eq, and, asc, desc, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities, clubs, instructors } from "@/db/schema";

export const metadata: Metadata = {
  title: "American Mahjong Community",
  description:
    "Beginner groups, social Mahjong, women's groups, and online lessons for American Mahjong players.",
};

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so this route can't be statically
// prerendered or revalidated on a timer — it's rendered per request.
export const dynamic = "force-dynamic";

type CityLink = { slug: string; name: string; state: string; n?: number };

const TOP_CITIES = 12;

// Cities with the most ACTIVE clubs carrying a flag. Nearly every city
// qualifies for "beginner friendly", so the page shows the top few plus a
// total rather than a wall of names.
async function citiesWithClubFlag(
  db: Awaited<ReturnType<typeof getDb>>,
  flag: "beginnerFriendly" | "socialPlay" | "womenOnly",
): Promise<{ top: CityLink[]; total: number }> {
  const rows = await db
    .select({
      slug: cities.slug,
      name: cities.name,
      state: cities.state,
      n: count(),
    })
    .from(clubs)
    .innerJoin(cities, eq(clubs.cityId, cities.id))
    .where(
      and(
        eq(clubs.status, "ACTIVE"),
        eq(cities.published, true),
        eq(clubs[flag], true),
      ),
    )
    .groupBy(cities.id)
    .orderBy(desc(count()), asc(cities.name));

  return { top: rows.slice(0, TOP_CITIES), total: rows.length };
}

export default async function CommunityPage() {
  const db = await getDb();

  const [beginnerCities, socialCities, womenOnlyCities, onlineInstructors] =
    await Promise.all([
      citiesWithClubFlag(db, "beginnerFriendly"),
      citiesWithClubFlag(db, "socialPlay"),
      citiesWithClubFlag(db, "womenOnly"),
      db
        .select({
          name: instructors.name,
          website: instructors.website,
          citySlug: cities.slug,
          cityName: cities.name,
          cityState: cities.state,
        })
        .from(instructors)
        .innerJoin(cities, eq(instructors.cityId, cities.id))
        .where(
          and(
            eq(instructors.status, "ACTIVE"),
            eq(cities.published, true),
            eq(instructors.onlineLesson, true),
          ),
        )
        .orderBy(asc(instructors.name)),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-jade">
        Community
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        American Mahjong community
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300">
        Mahjong is best with people. Here&apos;s how to find your group.
      </p>

      <CityGroupSection
        title="Beginners"
        description="Cities with clubs that welcome first-time players."
        cities={beginnerCities.top}
        total={beginnerCities.total}
      />

      <CityGroupSection
        title="Social Mahjong"
        description="Cities with clubs focused on casual, low-pressure social play."
        cities={socialCities.top}
        total={socialCities.total}
      />

      <CityGroupSection
        title="Women's Groups"
        description="Cities with women-only clubs and games."
        cities={womenOnlyCities.top}
        total={womenOnlyCities.total}
      />

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Online lessons</h2>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          Instructors offering online lessons — play or learn from anywhere.
        </p>
        {onlineInstructors.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No online instructors listed yet — check back soon.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {onlineInstructors.map((instructor) => (
              <li
                key={instructor.name}
                className="tile-card p-5"
              >
                <h3 className="font-semibold">{instructor.name}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Based in{" "}
                  <Link
                    href={`/cities/${instructor.citySlug}`}
                    className="underline hover:no-underline"
                  >
                    {instructor.cityName}, {instructor.cityState}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="tile-card mt-12 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-tile-red">
          Coming soon
        </p>
        <h2 className="mt-1 text-xl font-semibold">Find players</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Looking for a fourth? A way to post and find an open seat near you
          is on the way. For now, city pages list clubs and open play events
          where you can join in.
        </p>
        <Link
          href="/cities"
          className="mt-4 inline-flex items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Browse cities
        </Link>
      </section>
    </div>
  );
}

function CityGroupSection({
  title,
  description,
  cities: cityLinks,
  total,
}: {
  title: string;
  description: string;
  cities: CityLink[];
  total: number;
}) {
  return (
    <section className="tile-card mt-8 p-6">
      <h2 className="text-xl font-semibold">
        {title}
        {total > 0 && (
          <span className="ml-2 text-sm font-normal text-zinc-600 dark:text-zinc-400">
            {total} {total === 1 ? "city" : "cities"}
          </span>
        )}
      </h2>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
        {description}
      </p>
      {cityLinks.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          None published yet — check back soon.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {cityLinks.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="inline-block rounded-full border border-line px-3 py-1 text-sm transition-colors hover:border-jade"
              >
                {city.name}, {city.state}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {total > cityLinks.length && (
        <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
          Showing the {cityLinks.length} with the most clubs.{" "}
          <Link href="/cities" className="font-medium text-jade underline hover:no-underline">
            Browse all cities
          </Link>
        </p>
      )}
    </section>
  );
}
