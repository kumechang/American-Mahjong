import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find American Mahjong Near You",
  description:
    "Find beginner-friendly American Mahjong clubs, lessons, instructors, open play, and events by city.",
};

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

export default function FindPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        Find American Mahjong near you
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Clubs, lessons, instructors, and events are organized by city. Pick
        your city to see what&apos;s available.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <li
            key={category.title}
            className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"
          >
            <h2 className="font-semibold">{category.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {category.description}
            </p>
          </li>
        ))}
      </ul>

      <Link
        href="/cities"
        className="mt-10 inline-flex items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
      >
        Browse by city
      </Link>
    </div>
  );
}
