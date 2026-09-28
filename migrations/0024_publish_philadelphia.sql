-- Philadelphia has 3 ACTIVE clubs and 2 ACTIVE instructors (5 ACTIVE
-- rows total, no confirmed upcoming event) after research — meets the
-- docs/CITY_PAGE_POLICY.md §11 minimum bar (≥5 ACTIVE listings) to
-- publish.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'philadelphia';
