// "1 club", "2 clubs" — for counts shown in lists.
export function pluralize(n: number, singular: string, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function cityCountsLabel(counts: {
  clubCount: number;
  instructorCount: number;
  eventCount: number;
}) {
  return [
    pluralize(counts.clubCount, "club"),
    pluralize(counts.instructorCount, "instructor"),
    pluralize(counts.eventCount, "event"),
  ].join(" \u00b7 ");
}

// "6:00 PM" from "18:00" (or null when the time is missing or malformed).
export function formatClockTime(time: string | null | undefined) {
  const m = time?.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

// "6:00 PM – 8:30 PM", "6:00 PM", or null.
export function formatTimeRange(start?: string | null, end?: string | null) {
  const s = formatClockTime(start);
  const e = formatClockTime(end);
  if (s && e) return `${s} – ${e}`;
  return s ?? null;
}

// Month, day and weekday from "2026-10-07 00:00:00", read as a calendar date
// (no time zone shift).
export function eventDateParts(dateString: string) {
  const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...o }).format(d);
  return {
    month: fmt({ month: "short" }),
    day: fmt({ day: "numeric" }),
    weekday: fmt({ weekday: "short" }),
    long: fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  };
}

// Listings often store "Schedule text Price: $60/person". Show the two parts
// on separate lines instead of running them together.
export function splitPrice(text: string | null | undefined) {
  if (!text) return { main: null as string | null, price: null as string | null };
  const i = text.search(/\s*\bPrice:\s*/i);
  if (i < 0) return { main: text, price: null };
  const main = text.slice(0, i).trim().replace(/[.;,]$/, "");
  const price = text.slice(i).replace(/^\s*Price:\s*/i, "").trim();
  return { main: main || null, price: price || null };
}
