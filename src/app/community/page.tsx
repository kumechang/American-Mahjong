import Link from "next/link";
import type { Metadata } from "next";
import { eq, and, asc } from "drizzle-orm";
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

type CityLink = { slug: string; name: string; state: string };

async function citiesWithClubFlag(
  db: Awaited<ReturnType<typeof getDb>>,
  flag: "beginnerFriendly" | "socialPlay" | "womenOnly",
): Promise<CityLink[]> {
  const rows = await db
    .selectDistinct({
      slug: cities.slug,
      name: cities.name,
      state: cities.state,
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
    .orderBy(asc(cities.name));

  return rows;
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
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        American Mahjong community
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Mahjong is best with people. Here&apos;s how to find your group.
      </p>

      <CityGroupSection
        title="Beginners"
        description="Cities with clubs that welcome first-time players."
        cities={beginnerCities}
      />

      <CityGroupSection
        title="Social Mahjong"
        description="Cities with clubs focused on casual, low-pressure social play."
        cities={socialCities}
      />

      <CityGroupSection
        title="Women's Groups"
        description="Cities with women-only clubs and games."
        cities={womenOnlyCities}
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Online Groups</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Instructors offering online lessons — play or learn from anywhere.
        </p>
        {onlineInstructors.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No online instructors listed yet — check back soon.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {onlineInstructors.map((instructor) => (
              <li
                key={instructor.name}
                className="rounded-xl border border-line bg-surface p-5"
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

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Find Players</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Looking for a fourth? A way to post and find an open seat near you
          is coming soon — for now, city pages list clubs and open play events
          where you can join in.
        </p>
      </section>
    </div>
  );
}

function CityGroupSection({
  title,
  description,
  cities: cityLinks,
}: {
  title: string;
  description: string;
  cities: CityLink[];
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {cityLinks.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          None published yet — check back soon.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {cityLinks.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-jade dark:text-zinc-300"
              >
                {city.name}, {city.state}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
