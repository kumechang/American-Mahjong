import { getVerifiedInfo } from "@/lib/trust";

/**
 * Trust/freshness line for a Club, Instructor, or Event card — per
 * docs/CITY_PAGE_POLICY.md §4. lastVerifiedAt and sourceUrl already exist
 * on every researched row; this just makes them visible to the reader.
 */
export function VerifiedNote({
  lastVerifiedAt,
  sourceUrl,
}: {
  lastVerifiedAt: string | null;
  sourceUrl: string | null;
}) {
  const verified = getVerifiedInfo(lastVerifiedAt);
  if (!verified) return null;

  return (
    <p className="mt-2 text-xs text-muted">
      Verified {verified.label}
      {sourceUrl && (
        <>
          {" · "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Source
          </a>
        </>
      )}
      {verified.stale && (
        <span className="block text-amber-700 dark:text-amber-500">
          Details last confirmed {verified.fullDate} — please verify before
          visiting.
        </span>
      )}
    </p>
  );
}
