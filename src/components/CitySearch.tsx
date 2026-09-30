"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { stateName } from "@/lib/us-states";

export type SearchCity = { slug: string; name: string; state: string };

export function CitySearch({ cities }: { cities: SearchCity[] }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cities
      .filter((c) => {
        const label = `${c.name}, ${c.state}`.toLowerCase();
        return (
          label.startsWith(q) ||
          c.name.toLowerCase().startsWith(q) ||
          stateName(c.state).toLowerCase().startsWith(q) ||
          label.includes(q)
        );
      })
      .slice(0, 6);
  }, [cities, query]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/cities/${slug}`);
  }

  const showList = open && query.trim() !== "";

  return (
    <div className="relative mx-auto w-full max-w-xl text-left">
      <label htmlFor={`${id}-input`} className="sr-only">
        Search for your city
      </label>
      <input
        id={`${id}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && matches[active] ? `${id}-opt-${active}` : undefined
        }
        autoComplete="off"
        placeholder="Enter your city, e.g. Austin"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, Math.max(matches.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && matches[active]) {
            e.preventDefault();
            go(matches[active].slug);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-full border border-line bg-surface px-6 py-4 text-base shadow-sm placeholder:text-muted focus:border-jade"
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Matching cities"
        hidden={!showList}
        className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg"
      >
        {matches.length === 0 ? (
          <li className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">
            No city page yet — browse{" "}
            <Link href="/cities" className="underline">
              all cities
            </Link>
            .
          </li>
        ) : (
          matches.map((c, i) => (
            <li
              key={c.slug}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                go(c.slug);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-5 py-3 text-sm ${
                i === active ? "bg-jade/10" : ""
              }`}
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-zinc-600 dark:text-zinc-400">
                , {stateName(c.state)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
