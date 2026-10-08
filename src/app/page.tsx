import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities } from "@/db/schema";
import { CitySearch } from "@/components/CitySearch";
import { getUpcomingHighlights } from "@/lib/upcoming";
import { eventDateParts, formatClockTime } from "@/lib/format";

// City list and events come from D1, which only exists at request time.
export const dynamic = "force-dynamic";

const JOURNEY_STEPS = [
  {
    href: "/learn",
    title: "Learn how to play",
    description:
      "What American Mahjong is, the Charleston, scoring, jokers and etiquette, explained for total beginners.",
  },
  {
    href: "/find",
    title: "Find a place to play",
    description:
      "Beginner-friendly clubs, lessons, teachers, open play and events, searchable by city.",
  },
  {
    href: "/community",
    title: "Start playing",
    description:
      "Join a beginner game, a social group or a weekly open play session near you.",
  },
];

const TYPE_LABEL: Record<string, string> = {
  OPEN_PLAY: "Open play",
  LESSON: "Lesson",
  SOCIAL: "Social",
  TOURNAMENT: "Tournament",
};

export default async function Home() {
  const db = await getDb();
  const [published, upcoming] = await Promise.all([
    db
      .select({ slug: cities.slug, name: cities.name, state: cities.state })
      .from(cities)
      .where(eq(cities.published, true))
      .orderBy(asc(cities.name)),
    getUpcomingHighlights(db, 6),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
      <section
        className={`grid gap-12 ${upcoming.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16" : ""}`}
      >
        <div>
          <h1 className="max-w-[24ch] text-balance text-4xl font-bold leading-[1.12] sm:text-5xl">
            Find an American Mahjong game near you
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            Knowing the rules is half of it. The other half is finding a
            table that welcomes beginners. Pick your city to see the clubs,
            lessons and games nearby.
          </p>
          <div className="mt-8">
            <CitySearch cities={published} className="" />
          </div>
          <p className="mt-4 text-sm text-muted">
            {published.length} cities so far.{" "}
            <Link href="/cities" className="underline hover:no-underline">
              Browse them all
            </Link>
            .
          </p>
          <p className="mt-10 max-w-[34rem] border-l-4 border-jade pl-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            New to the game? Start with{" "}
            <Link
              href="/learn/what-is-american-mahjong"
              className="font-medium text-jade-strong underline hover:no-underline"
            >
              what American Mahjong is
            </Link>{" "}
            and the{" "}
            <Link
              href="/learn/beginner-guide"
              className="font-medium text-jade-strong underline hover:no-underline"
            >
              beginner guide
            </Link>
            , then pick a game from the list.
          </p>
        </div>

        {upcoming.length > 0 && (
          <aside aria-labelledby="coming-up">
            <h2 id="coming-up" className="text-2xl font-semibold">
              Coming up in the next two weeks
            </h2>
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
              {upcoming.map((event) => {
                const date = eventDateParts(event.eventDate);
                const time = formatClockTime(event.startTime);
                const type = TYPE_LABEL[event.eventType];
                return (
                  <li key={event.id}>
                    <Link
                      href={`/cities/${event.citySlug}`}
                      className="flex gap-4 px-4 py-3.5 transition-colors hover:bg-jade/5"
                    >
                      {date && (
                        <span
                          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-jade/10 text-jade-strong"
                          aria-hidden="true"
                        >
                          <span className="text-xs font-semibold">
                            {date.weekday}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {date.day}
                          </span>
                          <span className="text-xs">{date.month}</span>
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-semibold leading-snug">
                          {event.name}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted">
                          {date && (
                            <span className="sr-only">{date.long}. </span>
                          )}
                          {event.cityName}, {event.cityState}
                          {time ? `, ${time}` : ""}
                        </span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                          {type && (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {type}
                            </span>
                          )}
                          {event.beginnerFriendly && (
                            <span className="rounded-full bg-jade/10 px-2 py-0.5 text-jade-strong">
                              Beginner friendly
                            </span>
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </section>

      <section className="mt-20 border-t border-line pt-10">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-6 grid gap-8 sm:grid-cols-3">
          {JOURNEY_STEPS.map((item, index) => (
            <li key={item.href} className="flex gap-4">
              <span
                className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-jade"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">
                  <Link href={item.href} className="underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
