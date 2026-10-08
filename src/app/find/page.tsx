import Link from "next/link";
import type { Metadata } from "next";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities } from "@/db/schema";
import { CitySearch } from "@/components/CitySearch";
import { getCategoryCities, type CategoryKey } from "@/lib/find-categories";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Find American Mahjong Near You",
  description:
    "Find beginner-friendly American Mahjong clubs, lessons, instructors, open play, and events by city.",
};

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so this route can't be statically
// prerendered or revalidated on a timer — it's rendered per request.
export const dynamic = "force-dynamic";

const CATEGORIES: {
  key: CategoryKey;
  title: string;
  description: string;
}[] = [
  {
    key: "lessons",
    title: "Lessons",
    description: "Beginner classes and private or group lessons.",
  },
  {
    key: "openPlay",
    title: "Open play",
    description: "Drop-in games where you can just show up and play.",
  },
  {
    key: "clubs",
    title: "Clubs",
    description: "Beginner-friendly and social Mahjong clubs.",
  },
  {
    key: "instructors",
    title: "Teachers",
    description: "Instructors offering private, group, or online lessons.",
  },
  {
    key: "events",
    title: "Events",
    description: "Upcoming classes, socials and meetups.",
  },
  {
    key: "tournaments",
    title: "Tournaments",
    description: "Competitive American Mahjong tournaments.",
  },
];

export default async function FindPage() {
  const db = await getDb();
  const [cityRows, byCategory] = await Promise.all([
    db
      .select({ slug: cities.slug, name: cities.name, state: cities.state })
      .from(cities)
      .where(eq(cities.published, true))
      .orderBy(asc(cities.name)),
    getCategoryCities(db),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-jade">
        Find
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Find American Mahjong near you
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300">
        Search for your city, or start from what you are looking for.
      </p>

      <div className="mt-8">
        <CitySearch cities={cityRows} />
      </div>

      <h2 className="mt-14 text-xl font-semibold">What are you looking for?</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => {
          const list = byCategory[category.key];
          const shown = list.slice(0, 6);
          return (
            <section key={category.key} className="tile-card p-5">
              <h3 className="font-semibold">{category.title}</h3>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {category.description}
              </p>
              {shown.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  None listed yet.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                    Most listings in
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {shown.map((city) => (
                      <li key={city.slug}>
                        <Link
                          href={`/cities/${city.slug}`}
                          className="inline-flex min-h-10 items-center rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-jade"
                        >
                          {city.name}
                          <span className="ml-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {city.n}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {pluralize(list.length, "city", "cities")} with{" "}
                    {category.title.toLowerCase()}
                  </p>
                </>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-sm text-zinc-700 dark:text-zinc-300">
        Want to see everything?{" "}
        <Link href="/cities" className="font-medium text-jade underline hover:no-underline">
          Browse all {cityRows.length} cities
        </Link>
        . Don&apos;t see yours? We&apos;re adding more all the time.
      </p>
    </div>
  );
}
