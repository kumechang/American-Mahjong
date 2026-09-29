-- Charlotte has 4 ACTIVE clubs, 5 ACTIVE instructors, and 8 ACTIVE events
-- (17 ACTIVE rows) — well above the docs/CITY_PAGE_POLICY.md §11 minimum
-- (>=5).
UPDATE "City" SET "published" = 1 WHERE "slug" = 'charlotte';
