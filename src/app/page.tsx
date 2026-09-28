import Link from "next/link";

const JOURNEY_STEPS = [
  {
    step: "Learn",
    href: "/learn",
    title: "Learn how to play",
    description:
      "What is American Mahjong? Rules, the Charleston, scoring, jokers, and etiquette — explained for total beginners.",
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

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Learn &rarr; Find &rarr; Play
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Start playing American Mahjong
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Beginners don&apos;t just need to know the rules — they need to know
          how to actually get started. We help you learn the game, find a
          beginner-friendly club or lesson near you, and start playing.
        </p>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {JOURNEY_STEPS.map((item) => (
          <Link
            key={item.step}
            href={item.href}
            className="rounded-2xl border border-black/10 bg-white p-6 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {item.step}
            </span>
            <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {item.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
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
