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
      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {pluralize(total, "city", "cities")}
        {query.trim() ? " match" + (total === 1 ? "es" : "") : ""}
      </p>

      {groups.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line p-6 text-sm text-muted">
          No matching city yet. We add new cities regularly.
        </p>
      ) : (
        <div className="mt-8 gap-x-10 sm:columns-2 lg:columns-3">
          {groups.map(([state, list]) => (
            <section
              key={state}
              className="mb-8 break-inside-avoid"
              aria-labelledby={`state-${state}`}
            >
              <h2
                id={`state-${state}`}
                className="border-b border-line pb-1.5 text-xl font-semibold"
              >
                {stateName(state)}
              </h2>
              <ul className="mt-2 divide-y divide-line">
                {list.map((city) => {
                  const parts = [
                    city.clubCount > 0 ? pluralize(city.clubCount, "club") : null,
                    city.instructorCount > 0
                      ? pluralize(city.instructorCount, "teacher")
                      : null,
                  ].filter(Boolean);
                  return (
                    <li key={city.slug}>
                      <Link
                        href={`/cities/${city.slug}`}
                        className="block py-3 hover:bg-jade/5"
                      >
                        <span className="font-semibold text-jade-strong underline-offset-4 hover:underline">
                          {city.name}
                        </span>
                        {parts.length > 0 && (
                          <span className="mt-0.5 block text-sm text-muted">
                            {parts.join(", ")}
                          </span>
                        )}
                        {city.eventCount > 0 && (
                          <span className="block text-sm font-medium text-tile-red">
                            {pluralize(city.eventCount, "upcoming event")}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
