import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities } from "@/db/schema";
import { CitySearch } from "@/components/CitySearch";
import { TileRow } from "@/components/TileRow";

// City list comes from D1, which only exists at request time.
export const dynamic = "force-dynamic";

const JOURNEY_STEPS = [
  {
    step: "Learn",
    href: "/learn",
    title: "Learn how to play",
    description:
      "What is American Mahjong? Rules, the Charleston, scoring, jokers and etiquette — explained for total beginners.",
  },
  {
    step: "Find",
    href: "/find",
    title: "Find a place to play",
    description:
      "Beginner-friendly clubs, lessons, instructors, open play, and events — searchable by city.",
  },
  {
    step: "Play",
    href: "/community",
    title: "Start playing",
    description:
      "Join a beginner game, a social group, or a weekly open play session near you.",
  },
];

export default async function Home() {
  const db = await getDb();
  const published = await db
    .select({ slug: cities.slug, name: cities.name, state: cities.state })
    .from(cities)
    .where(eq(cities.published, true))
    .orderBy(asc(cities.name));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <TileRow />
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-jade">
          Learn &rarr; Find &rarr; Play
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Start playing American Mahjong
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-700 dark:text-zinc-300">
          Beginners don&apos;t just need to know the rules — they need to know
          how to actually get started. Find a beginner-friendly club, lesson
          or open play near you.
        </p>
        <div className="mt-8">
          <CitySearch cities={published} />
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Clubs, teachers and events in {published.length} cities.{" "}
          <Link href="/cities" className="underline hover:no-underline">
            Browse all cities
          </Link>
        </p>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {JOURNEY_STEPS.map((item) => (
          <Link
            key={item.step}
            href={item.href}
            className="tile-card p-6 transition-shadow hover:shadow-md"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-jade">
              {item.step}
            </span>
            <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {item.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border border-line bg-surface p-8">
        <h2 className="text-2xl font-semibold">
          Find American Mahjong near you
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Browse beginner-friendly clubs, lessons, and events by city.
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
