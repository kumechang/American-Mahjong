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
      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
        Learn American Mahjong
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
        Start here if you&apos;re new. Read the guides in order, or jump to
        the one you need. Each takes a few minutes.
      </p>

      <ol className="mt-10 divide-y divide-line border-y border-line">
        {TOPICS.map((topic, index) => {
          const full = LEARN_TOPICS[topic.slug];
          return (
            <li key={topic.slug}>
              <Link
                href={`/learn/${topic.slug}`}
                className="group flex gap-5 py-5 hover:bg-jade/5"
              >
                <span
                  aria-hidden="true"
                  className="w-8 shrink-0 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-jade"
                >
                  {index + 1}
                </span>
                <span>
                  <span className="block text-lg font-semibold text-jade-strong underline-offset-4 group-hover:underline">
                    {topic.title}
                  </span>
                  <span className="mt-1 block text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {topic.description}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {full ? `${readingMinutes(full)} min read` : "Coming soon"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <section className="mt-12 border-l-4 border-jade pl-5">
        <h2 className="text-2xl font-semibold">Ready to play?</h2>
        <p className="mt-2 text-lg text-zinc-700 dark:text-zinc-300">
          Once you know the basics, find a beginner-friendly club, lesson or
          open play near you.
        </p>
        <Link
          href="/cities"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-emerald-700 px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Find a place to play
        </Link>
      </section>
    </div>
  );
}
