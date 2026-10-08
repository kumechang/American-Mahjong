import Link from "next/link";
import type { Metadata } from "next";
import { LEARN_TOPIC_META as TOPICS, LEARN_TOPICS } from "@/content/learn";
import { readingMinutes } from "@/lib/learn-utils";

export const metadata: Metadata = {
  title: "Learn American Mahjong",
  description:
    "Beginner guides to American Mahjong: rules, terms, the Charleston, scoring, jokers and etiquette.",
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-jade">
        Learn
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Learn American Mahjong
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300">
        Start here if you&apos;re new. Read the guides in order, or jump to
        the one you need — each takes just a few minutes.
      </p>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2">
        {TOPICS.map((topic, index) => {
          const full = LEARN_TOPICS[topic.slug];
          return (
            <li key={topic.slug}>
              <Link
                href={`/learn/${topic.slug}`}
                className="tile-card flex h-full gap-4 p-5 transition-shadow hover:shadow-md"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jade/10 text-lg font-bold text-jade-strong"
                >
                  {index + 1}
                </span>
                <span>
                  <span className="block font-semibold">{topic.title}</span>
                  <span className="mt-1 block text-sm text-zinc-700 dark:text-zinc-300">
                    {topic.description}
                  </span>
                  <span className="mt-2 block text-xs text-zinc-600 dark:text-zinc-400">
                    {full
                      ? `${readingMinutes(full)} min read`
                      : "Coming soon"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <section className="tile-card mt-12 p-6">
        <h2 className="text-xl font-semibold">Ready to play?</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Once you know the basics, find a beginner-friendly club, lesson or
          open play near you.
        </p>
        <Link
          href="/cities"
          className="mt-4 inline-flex items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Find a place to play
        </Link>
      </section>
    </div>
  );
}
