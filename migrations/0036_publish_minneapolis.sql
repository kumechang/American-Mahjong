-- Minneapolis has 3 ACTIVE clubs, 6 ACTIVE instructors, and 8 ACTIVE
-- events (17 ACTIVE rows total) after research — well above the
-- docs/CITY_PAGE_POLICY.md §11 minimum bar (≥5 ACTIVE listings) to
-- publish.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'minneapolis';
