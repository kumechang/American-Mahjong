import type { events } from "@/db/schema";
import { eventDateParts, formatTimeRange } from "@/lib/format";

type Event = typeof events.$inferSelect;

const TYPE_LABEL: Record<string, string> = {
  OPEN_PLAY: "Open play",
  LESSON: "Lesson",
  SOCIAL: "Social",
  TOURNAMENT: "Tournament",
};

const INITIAL_COUNT = 8;

// Lists stay scannable with the place name only ("Lucky Hare"); the full
// address is on the event page.
function shortVenue(venue: string | null) {
  if (!venue) return null;
  const parts = venue.split(",").map((p) => p.trim());
  return /^\d/.test(parts[0]) && parts[1] ? `${parts[0]}, ${parts[1]}` : parts[0];
}

function EventRow({ event }: { event: Event }) {
  const date = eventDateParts(event.eventDate);
  const time = formatTimeRange(event.startTime, event.endTime);
  const href = event.registrationUrl ?? event.sourceUrl;
  const typeLabel = TYPE_LABEL[event.eventType];
  const price =
    event.price == null
      ? null
      : event.price === 0
        ? "Free"
        : `$${Number.isInteger(event.price) ? event.price : event.price.toFixed(2)}`;

  return (
    <li className="flex gap-4 px-4 py-4 sm:px-5">
      {date && (
        <div
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-jade/10 text-jade-strong"
          aria-hidden="true"
        >
          <span className="text-xs font-semibold uppercase tracking-wide">
            {date.weekday}
          </span>
          <span className="text-xl font-bold leading-none">{date.day}</span>
          <span className="text-xs uppercase">{date.month}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug">{event.name}</h3>
        <p className="mt-1 text-sm text-muted">
          {date && <span className="sr-only">{date.long}. </span>}
          {[time, shortVenue(event.venue)].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {typeLabel && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {typeLabel}
            </span>
          )}
          {event.beginnerFriendly && (
            <span className="rounded-full bg-jade/10 px-2 py-0.5 text-jade-strong">
              Beginner friendly
            </span>
          )}
          {price && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {price}
            </span>
          )}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-1 ml-1 inline-flex min-h-10 items-center px-1 font-medium text-jade underline hover:no-underline"
            >
              Details<span className="sr-only"> for {event.name}</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function EventList({ events: list }: { events: Event[] }) {
  const first = list.slice(0, INITIAL_COUNT);
  const rest = list.slice(INITIAL_COUNT);
  const listClass =
    "divide-y divide-line rounded-xl border border-line bg-surface";

  return (
    <div className="mt-4">
      <ul className={listClass}>
        {first.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer rounded-full border border-line bg-surface px-4 py-2 text-center text-sm font-medium text-jade-strong hover:border-jade">
            <span className="group-open:hidden">
              Show {rest.length} more {rest.length === 1 ? "event" : "events"}
            </span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <ul className={`${listClass} mt-3`}>
            {rest.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
