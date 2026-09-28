// A listing is past its reverification window per docs/DATA_COLLECTION.md's
// 90-day cadence — still shown (removing it would throw away good
// information over a paperwork lapse), but flagged so a reader knows to
// double-check before relying on it.
const STALE_AFTER_DAYS = 90;

export function getVerifiedInfo(lastVerifiedAt: string | null) {
  if (!lastVerifiedAt) return null;

  const verifiedDate = new Date(lastVerifiedAt);
  if (Number.isNaN(verifiedDate.getTime())) return null;

  const daysSince = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

  return {
    label: new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(verifiedDate),
    fullDate: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(verifiedDate),
    stale: daysSince > STALE_AFTER_DAYS,
  };
}
