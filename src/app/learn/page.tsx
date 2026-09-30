import Link from "next/link";
import type { Metadata } from "next";
import { LEARN_TOPIC_META as TOPICS } from "@/content/learn";

export const metadata: Metadata = {
  title: "Learn American Mahjong",
  description:
    "Beginner guides to American Mahjong: rules, terms, the Charleston, scoring, jokers, and etiquette.",
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Learn American Mahjong</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Start here if you&apos;re new to American Mahjong. These guides cover
        everything from what the game is to how scoring works.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {TOPICS.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/learn/${topic.slug}`}
              className="block h-full rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <h2 className="font-semibold">{topic.title}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {topic.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
