-- Fresno has 6 ACTIVE rows (1 club, 5 events; docs/CITY_PAGE_POLICY.md §11 minimum is >=5),
-- all from one group. Colorado Springs (2), Columbia (4), Wichita (1), Lexington (0)
-- stay unpublished.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'fresno';
UPDATE "City" SET "intro" = 'Fresno''s American Mahjong is run by Charleston Society, a community group for the Fresno and Clovis area. It holds American Mahjong 101 classes and guided play at wine rooms and wineries around the valley, including Kingsburg. The 101 class is an introduction to the American game, and guided play is a good next step. Events carry a ticket price and venues change, so check the group''s page for the time and location before you go.' WHERE "slug" = 'fresno';
