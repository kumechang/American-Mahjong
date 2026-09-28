import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "American Mahjong by City",
  description:
    "Find beginner-friendly American Mahjong clubs, lessons, and events in your city.",
};

export const revalidate = 3600;

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    where: { published: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { clubs: true, instructors: true, events: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        American Mahjong by city
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        We only publish a city page once we have real, verified clubs,
        lessons, or events for it.
      </p>

      {cities.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-black/20 p-6 text-sm text-zinc-500 dark:border-white/20">
          No city pages are published yet. Run the database seed script to
          add sample cities.
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {cities.map((city) => (
            <li key={city.id}>
              <Link
                href={`/cities/${city.slug}`}
                className="block rounded-xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
              >
                <h2 className="font-semibold">
                  {city.name}, {city.state}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {city._count.clubs} clubs &middot; {city._count.instructors}{" "}
                  instructors &middot; {city._count.events} events
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
