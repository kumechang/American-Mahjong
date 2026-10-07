"use client";

import { useMemo, useState } from "react";
import type { clubs } from "@/db/schema";
import { VerifiedNote } from "@/components/VerifiedNote";
import { splitPrice } from "@/lib/format";

function ScheduleLines({ text }: { text: string | null }) {
  const { main, price } = splitPrice(text);
  return (
    <>
      {main && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{main}</p>
      )}
      {price && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Price:</span> {price}
        </p>
      )}
    </>
  );
}

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

  const resultSummary =
    filtered.length === 0
      ? "No clubs match these filters yet."
      : `${filtered.length} club${filtered.length === 1 ? "" : "s"} match these filters.`;

  return (
    <div>
      <div
        role="group"
        aria-label="Filter clubs"
        className="flex flex-wrap gap-2"
      >
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
                  : "border-line bg-surface text-zinc-700 hover:border-jade dark:text-zinc-300"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Announced to screen reader users on every filter change, since the
          list below updates without a page navigation. */}
      <p role="status" aria-live="polite" className="sr-only">
        {resultSummary}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{resultSummary}</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {filtered.map((club) => (
            <li
              key={club.id}
              className="rounded-xl border border-line bg-surface p-5"
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
              {club.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {club.description}
                </p>
              )}
              <ScheduleLines text={club.schedule} />
              {club.website && (
                <p className="mt-2 text-sm">
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Visit {club.name}&apos;s website
                  </a>
                </p>
              )}
              <VerifiedNote
                lastVerifiedAt={club.lastVerifiedAt}
                sourceUrl={club.sourceUrl}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
