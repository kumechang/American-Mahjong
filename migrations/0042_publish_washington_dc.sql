-- Washington DC has 2 ACTIVE clubs, 5 ACTIVE instructors, and 7 ACTIVE
-- events (14 ACTIVE rows) — well above the docs/CITY_PAGE_POLICY.md §11
-- minimum (>=5).
UPDATE "City" SET "published" = 1 WHERE "slug" = 'washington-dc';
