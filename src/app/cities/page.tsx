import type { Metadata } from "next";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities } from "@/db/schema";
import { getCityCounts } from "@/lib/city-counts";
import { CityDirectory } from "@/components/CityDirectory";

export const metadata: Metadata = {
  title: "American Mahjong by City",
  description:
    "Find beginner-friendly American Mahjong clubs, lessons, and events in your city.",
};

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so this route can't be statically
// prerendered or revalidated on a timer — it's rendered per request.
export const dynamic = "force-dynamic";

export default async function CitiesPage() {
  const db = await getDb();
  const cityRows = await db
    .select()
    .from(cities)
    .where(eq(cities.published, true))
    .orderBy(asc(cities.name));

  const counts = await getCityCounts(
    db,
    cityRows.map((city) => city.id),
  );
  const citiesWithCounts = cityRows.map((city) => ({
    ...city,
    ...counts.get(city.id)!,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        American Mahjong by city
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300">
        We only publish a city page once we have real, verified clubs,
        lessons, or events for it.
      </p>

      {citiesWithCounts.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line p-6 text-sm text-zinc-600">
          No city pages are published yet. Check back soon.
        </p>
      ) : (
        <div className="mt-8">
          <CityDirectory cities={citiesWithCounts} />
        </div>
      )}
    </div>
  );
}
