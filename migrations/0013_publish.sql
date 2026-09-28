-- Publishes the 8 of 9 newly-imported cities that had enough ACTIVE
-- (non-NEEDS_REVIEW, non-INACTIVE) clubs/instructors/events to be worth a
-- public page, per docs/DATA_COLLECTION.md's "only publish once there's
-- real, verified data" principle.
--
-- Phoenix is deliberately left unpublished: after filtering out
-- NEEDS_REVIEW rows, it has zero ACTIVE clubs and zero ACTIVE events —
-- only one instructor. Revisit once more Phoenix data is collected.

UPDATE "City" SET "published" = 1
WHERE "slug" IN (
  'austin', 'boston', 'chicago', 'los-angeles', 'miami',
  'new-york', 'san-francisco', 'scottsdale'
);
