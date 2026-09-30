-- Charleston now has 5 ACTIVE rows (1 club, 3 instructors from the same business,
-- 1 event; docs/CITY_PAGE_POLICY.md §11 minimum is >=5). Boise (4), Louisville (3),
-- Albuquerque (1), Durham (1) and the other new cities stay unpublished.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'charleston';
UPDATE "City" SET "intro" = 'Charleston''s American Mahjong is built around Holy Mahj, which runs a dedicated card room on Line Street with a public beginner series, open play and leagues. Its teachers include Cara Stein, who leads an under-30 club and kids classes, along with Debbie Engel and Ashley O''Brien. A Ladies Mahjong Night at the Tidewater Club is another way to play. If you are new, start with the beginner series, then join open play. Check the official event page for current dates.' WHERE "slug" = 'charleston';
