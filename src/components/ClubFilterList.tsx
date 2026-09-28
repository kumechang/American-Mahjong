"use client";

import { useMemo, useState } from "react";
import type { clubs } from "@/db/schema";

type Club = typeof clubs.$inferSelect;

type FilterKey =
  | "beginnerFriendly"
  | "lessonsAvailable"
  | "openPlay"
  | "socialPlay"
  | "free";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "beginnerFriendly", label: "Beginner Friendly" },
  { key: "lessonsAvailable", label: "Lessons Available" },
  { key: "openPlay", label: "Open Play" },
  { key: "socialPlay", label: "Social" },
  { key: "free", label: "Free" },
];

export function ClubFilterList({ clubs }: { clubs: Club[] }) {
  const [active, setActive] = useState<Set<FilterKey>>(
    new Set(["beginnerFriendly"]),
  );

  const filtered = useMemo(
    () =>
      clubs.filter((club) =>
        [...active].every((key) => club[key] === true),
      ),
    [clubs, active],
  );

  function toggle(key: FilterKey) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = active.has(filter.key);
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => toggle(filter.key)}
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-black/10 bg-white text-zinc-700 hover:border-black/20 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No clubs match these filters yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {filtered.map((club) => (
            <li
              key={club.id}
              className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"
            >
              <h3 className="font-semibold">{club.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                {club.beginnerFriendly && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Beginner Friendly
                  </span>
                )}
                {club.lessonsAvailable && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Lessons Available
                  </span>
                )}
                {club.openPlay && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Open Play
                  </span>
                )}
                {club.socialPlay && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Social
                  </span>
                )}
                {club.free && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Free
                  </span>
                )}
              </div>
              {club.schedule && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {club.schedule}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
