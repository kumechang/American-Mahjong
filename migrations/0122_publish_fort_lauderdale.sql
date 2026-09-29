-- Fort Lauderdale has 5 ACTIVE rows (1 instructor, 4 events; docs/CITY_PAGE_POLICY.md
-- §11 minimum is >=5), all from one instructor. Charleston (4), Albuquerque (1),
-- Boise (1), Louisville (3) and the four new cities stay unpublished.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'fort-lauderdale';
UPDATE "City" SET "intro" = 'Fort Lauderdale''s listings center on Your Mahjong Mama, a certified American Mahjong instructor who offers private lessons and events, including guided play and open play at Shooters Waterfront. Guided play is a good way to learn on the table with help from an instructor, and open play is a relaxed way to practice afterward. Event times are posted on her profile page, so check there for the latest details before you go.' WHERE "slug" = 'fort-lauderdale';
