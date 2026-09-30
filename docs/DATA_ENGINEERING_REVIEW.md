# Data Engineering Review

Role-played review by a **Data Engineer** (business plan ch. 28) of how city
data flows from research to the live site. Snapshot 2026-09-30: 69 cities
(≈50 published), 146 clubs, 129 instructors, 263 events, ~160 migration
files (1.3 MB), canonical CSVs in `data/collected/` (1.1 MB). Not a security
audit and not run by a human engineer — treat as a prioritized checklist.

## How data flows today
1. External researcher → CSVs (3 files, 21/14/16 columns).
2. `npm run validate:csv` (new) → errors/warnings for the researcher.
3. Split per city into `data/collected/<city>/` (canonical CSVs, in git).
4. `scripts/import-csv.mjs` → SQL migration (`INSERT ... ON CONFLICT(slug)
   DO UPDATE`), plus hand-written city, publish and intro migrations.
5. Deploy runs `wrangler d1 migrations apply DB --remote`, then the site
   reads D1 per request (`force-dynamic`).

## What is solid
- **Idempotent upserts.** Re-running an import updates rather than duplicates.
- **Migrations are the audit trail**: every data change is a reviewed,
  numbered SQL file in git; DB and repo can't silently diverge through
  the deploy path.
- **Status gate.** Only `ACTIVE` reaches pages, and the publish threshold is
  enforced by hand-written `published` migrations.
- **Explicit provenance**: every row has `sourceUrl` and `lastVerifiedAt`.
- Indexes exist for `cityId` on Club/Instructor/Event and `eventDate`; at
  these volumes (hundreds of rows) queries are effectively instant.
- D1 Time Travel gives point-in-time restore for a limited window; no extra
  backup job is needed yet.

## Findings, in priority order

### High
1. **Row identity is the slug, and it can collide silently.** Club and
   instructor slug = `city-name`; event slug = `city-name-date`. Two events
   with the same name on the same day (different venues or times) overwrite
   each other, and the importer says nothing. *Done:* `validate-csv` now
   reports an ERROR for a same-name/same-date pair in one file and a WARN
   when an event would overwrite an imported one with a different venue.
   *Still to do:* add a short disambiguator to event names (time or venue)
   or add `start_time` to the slug for new imports (needs a migration plan
   for existing slugs).
2. **Nothing expires events or re-checks links.** Past events are hidden in
   the UI but stay `ACTIVE`; dead `source_url`s are found only by hand. All
   rows were verified 2026-09-28..30, so the 90-day "stale" flag starts
   showing on nearly everything at once in late December. *Next step:* a
   weekly job (GitHub Actions) that lists dead links and marks events older
   than N days `INACTIVE` through a generated migration/PR.
3. **Malformed rows were imported silently.** Extra or missing fields
   shifted columns and the importer ignored the surplus. *Done:* the
   importer now errors on a field-count mismatch and the validator catches
   it with the exact line.

### Medium
4. **Publish threshold uses stored rows, the page shows upcoming ones.**
   A city with exactly five rows can drop below five visible ones within a
   month. *Next step:* a report (script) listing published cities whose
   *upcoming* ACTIVE count is below 5, run before each re-verification round;
   unpublish or top up through a migration.
5. **Data changes require a migration each time**, so `migrations/` grows by
   ~5–10 files per batch. Fine now; at a few hundred files consider
   consolidating already-applied data migrations into a snapshot for fresh
   databases (never rename or delete applied files on the remote).
6. **Canonical CSVs vs D1 can drift** if someone edits one and not the
   other. *Next step:* a `db:audit` script that compares row counts and key
   fields between `data/collected/` and a local D1 built from migrations.
7. **Every page view queries D1** (`force-dynamic`). The city page runs 3
   queries, `/find` about 6, `/cities` 3. Fine at current traffic; when
   traffic grows, add HTTP cache headers (short `s-maxage` with
   stale-while-revalidate) or ISR through OpenNext's incremental cache, since
   data only changes at deploy time.

### Low
8. Add a composite index `(cityId, status, eventDate)` on Event and
   `(cityId, status)` on Club/Instructor if tables reach tens of thousands
   of rows. Not needed now.
9. Store the source *type* (official site, directory, event platform) as a
   column so the validator's "directory-only" rule doesn't need URL
   pattern matching.
10. Record which researcher/batch supplied a row (`import_batch`) for
    traceability when a source disputes a listing.

## Suggested next steps (in order)
1. Weekly freshness job: dead-link report + expired events → PR.
2. `report:coverage` script (published cities with < 5 upcoming ACTIVE).
3. `db:audit` (CSV ↔ D1) before each deploy.
4. Event slug disambiguation for new imports.
