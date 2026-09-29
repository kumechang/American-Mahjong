-- Cleveland now has 5 ACTIVE rows (docs/CITY_PAGE_POLICY.md §11 minimum).
-- Milwaukee has 4 and stays unpublished.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'cleveland';
UPDATE "City" SET "intro" = 'Cleveland''s American Mahjong scene is built around events at local venues. Southwest Cleveland Mahjong runs Mahjong 101 and open play in Brunswick, and Mahjong IRL holds sessions at Flight Cleveland that pair play with a glass of wine. Some sessions are beginner classes and others assume you know the rules, so read the event description before signing up. Bring a current National Mah Jongg League card, and check the venue address, since play is spread across the metro.' WHERE "slug" = 'cleveland';
