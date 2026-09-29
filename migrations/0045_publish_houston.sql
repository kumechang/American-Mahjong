-- Houston has 3 ACTIVE clubs, 4 ACTIVE instructors, and 8 ACTIVE events
-- (15 ACTIVE rows) — well above the docs/CITY_PAGE_POLICY.md §11 minimum
-- (>=5). The members-only Houston Heights Woman's Club is NEEDS_REVIEW
-- and stays hidden.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'houston';
