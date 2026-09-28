-- Denver has 4 ACTIVE clubs, 1 ACTIVE instructor, and 2 ACTIVE events
-- (7 ACTIVE rows total) after research — meets the docs/CITY_PAGE_POLICY.md
-- §11 minimum bar (≥5 ACTIVE listings) to publish.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'denver';
