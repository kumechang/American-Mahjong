-- Adds the per-city "Getting Started" intro paragraph required by
-- docs/CITY_PAGE_POLICY.md §2. Filled in by the next migration.
ALTER TABLE "City" ADD COLUMN "intro" text;
