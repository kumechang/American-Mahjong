import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "American Mahjong Community",
  description:
    "Beginner groups, social Mahjong, and online communities for American Mahjong players.",
};

const GROUPS = [
  {
    title: "Beginners",
    description: "Groups specifically for people who are new to the game.",
  },
  {
    title: "Social Mahjong",
    description: "Casual, low-pressure games focused on socializing.",
  },
  {
    title: "Women's Groups",
    description: "Women-only clubs and games.",
  },
  {
    title: "Online Groups",
    description: "Play or learn American Mahjong online.",
  },
  {
    title: "Find Players",
    description:
      "Looking for a fourth? Coming soon: post and find an open seat near you.",
  },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        American Mahjong community
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Mahjong is best with people. Here&apos;s how to find your group.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <li
            key={group.title}
            className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"
          >
            <h2 className="font-semibold">{group.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {group.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
