-- Fort Worth has 5 ACTIVE rows (1 club, 4 events; docs/CITY_PAGE_POLICY.md §11 minimum
-- is >=5), all from one organizer. Little Rock (2), Des Moines (1), Columbia (3),
-- Spokane (0), Wichita (0) stay unpublished.
UPDATE "City" SET "published" = 1 WHERE "slug" = 'fort-worth';
UPDATE "City" SET "intro" = 'Fort Worth''s American Mahjong is centered on The Mahj Clubhouse, a social club with a fixed address on Pershing Avenue. It runs six-week open-play and social series, tournament play with prizes, and pop-up open play at a local saloon. Series are priced for the full run, so check what is included before you sign up. If you are new, ask the club about its learning series. Times and dates are posted on the club''s website.' WHERE "slug" = 'fort-worth';
