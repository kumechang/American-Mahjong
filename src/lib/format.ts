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
