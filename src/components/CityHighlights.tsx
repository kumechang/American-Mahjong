import type { clubs, instructors } from "@/db/schema";
import { pluralize, splitPrice } from "@/lib/format";

type Club = typeof clubs.$inferSelect;
type Instructor = typeof instructors.$inferSelect;

// "Beginner First": surface the most beginner-friendly listing. Uses only
// what the listing itself says (flags from its own materials), never our
// own judgment of quality.
function pickStart(clubList: Club[], instructorList: Instructor[]) {
  const score = (c: Club) =>
    (c.beginnerFriendly ? 4 : 0) +
    (c.lessonsAvailable ? 2 : 0) +
    (c.schedule ? 1 : 0) +
    (c.website ? 1 : 0);
  const bestClub = [...clubList].sort((a, b) => score(b) - score(a))[0];
  if (bestClub && (bestClub.beginnerFriendly || bestClub.lessonsAvailable)) {
    return {
      name: bestClub.name,
      kind: "club" as const,
      why: bestClub.beginnerFriendly
        ? "Says it welcomes beginners"
        : "Offers lessons",
      detail: bestClub.schedule,
      href: bestClub.website,
    };
  }
  const teacher = instructorList.find((i) => i.beginnerLesson);
  if (teacher) {
    return {
      name: teacher.name,
      kind: "teacher" as const,
      why: "Offers beginner lessons",
      detail: null,
      href: teacher.website,
    };
  }
  return null;
}

export function CityHighlights({
  clubs: clubList,
  instructors: instructorList,
  eventCount,
  nextEventLabel,
}: {
  clubs: Club[];
  instructors: Instructor[];
  eventCount: number;
  nextEventLabel: string | null;
}) {
  const start = pickStart(clubList, instructorList);
  const detail = splitPrice(start?.detail);

  return (
    <div className="mt-6">
      <ul className="flex flex-wrap gap-2 text-sm">
        {clubList.length > 0 && (
          <li className="rounded-full bg-jade/10 px-3 py-1 text-jade-strong">
            {pluralize(clubList.length, "club")}
          </li>
        )}
        {instructorList.length > 0 && (
          <li className="rounded-full bg-jade/10 px-3 py-1 text-jade-strong">
            {pluralize(instructorList.length, "teacher")}
          </li>
        )}
        {eventCount > 0 && (
          <li className="rounded-full bg-tile-red/10 px-3 py-1 text-tile-red">
            {pluralize(eventCount, "upcoming event")}
            {nextEventLabel ? `, next on ${nextEventLabel}` : ""}
          </li>
        )}
      </ul>

      {start && (
        <div className="tile-card mt-5 p-5">
          <p className="text-sm font-semibold text-jade-strong">
            Good place to start
          </p>
          <h2 className="mt-1 text-lg font-semibold">{start.name}</h2>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {start.why}
          </p>
          {detail.main && (
            <p className="mt-1 text-sm text-muted">{detail.main}</p>
          )}
          {detail.price && (
            <p className="mt-1 text-sm text-muted">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Price:
              </span>{" "}
              {detail.price}
            </p>
          )}
          {start.href && (
            <p className="mt-2 text-sm">
              <a
                href={start.href}
                rel="noopener noreferrer"
                className="font-medium text-jade underline hover:no-underline"
              >
                Visit {start.kind === "club" ? "their" : "the"} website
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
