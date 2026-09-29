-- Portland has 17 ACTIVE rows (5 clubs, 6 instructors, 6 events) after
-- research — well above the docs/CITY_PAGE_POLICY.md §11 minimum (≥5).
-- One further club (Portland Parks & Rec) is NEEDS_REVIEW and stays hidden.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'portland';
