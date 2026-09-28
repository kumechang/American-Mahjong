import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn American Mahjong",
  description:
    "Beginner guides to American Mahjong: rules, terms, the Charleston, scoring, jokers, and etiquette.",
};

const TOPICS = [
  {
    slug: "what-is-american-mahjong",
    title: "What Is American Mahjong?",
    description:
      "How American Mahjong differs from Chinese and Japanese Riichi Mahjong, and why it's played with a card.",
  },
  {
    slug: "beginner-guide",
    title: "Beginner Guide",
    description: "Everything a first-time player needs before their first game.",
  },
  {
    slug: "rules",
    title: "Rules",
    description: "The full rules of American Mahjong, step by step.",
  },
  {
    slug: "terms",
    title: "Terms",
    description: "A glossary of American Mahjong terms and slang.",
  },
  {
    slug: "charleston",
    title: "The Charleston",
    description: "How the tile-passing phase works and basic strategy.",
  },
  {
    slug: "scoring",
    title: "Scoring",
    description: "How hands are scored using the National Mah Jongg League card.",
  },
  {
    slug: "jokers",
    title: "Jokers",
    description: "How jokers work and when they can and can't be used.",
  },
  {
    slug: "etiquette",
    title: "Etiquette",
    description: "Unwritten rules and etiquette for playing with a new group.",
  },
];

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
              className="block h-full rounded-xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
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
