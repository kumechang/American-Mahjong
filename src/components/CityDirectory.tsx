"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { stateName } from "@/lib/us-states";
import { pluralize } from "@/lib/format";

export type DirectoryCity = {
  slug: string;
  name: string;
  state: string;
  clubCount: number;
  instructorCount: number;
  eventCount: number;
};

export function CityDirectory({ cities }: { cities: DirectoryCity[] }) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? cities.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.state.toLowerCase() === q ||
            stateName(c.state).toLowerCase().includes(q),
        )
      : cities;
    const byState = new Map<string, DirectoryCity[]>();
    for (const c of filtered) {
      const list = byState.get(c.state) ?? [];
      list.push(c);
      byState.set(c.state, list);
    }
    return [...byState.entries()].sort((a, b) =>
      stateName(a[0]).localeCompare(stateName(b[0])),
    );
  }, [cities, query]);

  const total = groups.reduce((n, [, list]) => n + list.length, 0);

  return (
    <div>
      <label htmlFor="city-filter" className="sr-only">
        Filter cities by name or state
      </label>
      <input
        id="city-filter"
        type="search"
        placeholder="Filter by city or state"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md rounded-full border border-line bg-surface px-5 py-3 text-base placeholder:text-muted focus:border-jade"
      />
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
        {pluralize(total, "city", "cities")}
        {query.trim() ? " match" + (total === 1 ? "es" : "") : ""}
      </p>

      {groups.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line p-6 text-sm text-zinc-600 dark:text-zinc-400">
          No matching city yet. We add new cities regularly.
        </p>
      ) : (
        groups.map(([state, list]) => (
          <section key={state} className="mt-10" aria-labelledby={`state-${state}`}>
            <h2
              id={`state-${state}`}
              className="border-b border-line pb-2 text-sm font-semibold uppercase tracking-widest text-jade"
            >
              {stateName(state)}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {list.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/cities/${city.slug}`}
                    className="tile-card block p-5 transition-shadow hover:shadow-md"
                  >
                    <span className="font-semibold">{city.name}</span>
                    <span className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      {city.clubCount > 0 && (
                        <span className="rounded-full bg-jade/10 px-2 py-0.5 text-jade-strong">
                          {pluralize(city.clubCount, "club")}
                        </span>
                      )}
                      {city.instructorCount > 0 && (
                        <span className="rounded-full bg-jade/10 px-2 py-0.5 text-jade-strong">
                          {pluralize(city.instructorCount, "teacher")}
                        </span>
                      )}
                      {city.eventCount > 0 && (
                        <span className="rounded-full bg-tile-red/10 px-2 py-0.5 text-tile-red">
                          {pluralize(city.eventCount, "upcoming event")}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
