-- Raleigh has 3 ACTIVE clubs, 4 ACTIVE instructors, and 5 ACTIVE events
-- (12 ACTIVE rows) — above the docs/CITY_PAGE_POLICY.md §11 minimum (>=5).
UPDATE "City" SET "published" = 1 WHERE "slug" = 'raleigh';
UPDATE "City" SET "intro" = 'Raleigh has open play in a few different settings. The Kitchen Table hosts open play and beginner classes, Mahj With R+M holds Monday sessions at BottleRev3, and Beth Meyer Synagogue runs a Sunday drop-in in its library where beginners are welcome. Mahj with McMillan, GatherMahj and other local teachers offer lessons for newcomers. Most groups ask you to bring a current National Mah Jongg League card, so check with the host before your first visit.' WHERE "slug" = 'raleigh';
