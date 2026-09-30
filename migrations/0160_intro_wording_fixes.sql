-- Wording fixes from an independent editorial review: remove a leftover word,
-- clarify vague sentences, attribute claims to their source, and soften
-- guarantee-style phrases ("the clearest first step", "the simplest way in").
UPDATE "City" SET "intro" = REPLACE("intro", 'Chicago''s American Mahjong here runs through', 'Chicago''s American Mahjong runs through') WHERE "slug" = 'chicago';
UPDATE "City" SET "intro" = REPLACE("intro", 'The one group listed, Mahjong for People who Work, is a Meetup group with recurring games where American Mahjong may be played when enough players attend, so confirm before you go.', 'One group, Mahjong for People who Work, holds recurring Meetup games. Its games are not always American Mahjong, so confirm the style before you go.') WHERE "slug" = 'phoenix';
UPDATE "City" SET "intro" = REPLACE("intro", 'Because venues are spread across the metro, check locations, and confirm the version taught, since one teacher also plays other styles.', 'Venues are spread across the metro, so check each location. One teacher also plays other styles, so confirm you are booking American Mahjong.') WHERE "slug" = 'kansas-city';
UPDATE "City" SET "intro" = REPLACE(REPLACE("intro", 'a social league and two-player events', 'a social league and special events'), 'the natural place to start', 'a good place to start') WHERE "slug" = 'oklahoma-city';
UPDATE "City" SET "intro" = REPLACE("intro", ', and it references the National Mah Jongg League card on its own site', '') WHERE "slug" = 'las-vegas';
UPDATE "City" SET "intro" = REPLACE("intro", ', and prices are modest', '; prices are listed on the calendar') WHERE "slug" = 'sacramento';
UPDATE "City" SET "intro" = REPLACE("intro", 'a certified American Mahjong instructor who offers', 'an instructor who describes herself as a certified American Mahjong teacher and offers') WHERE "slug" = 'fort-lauderdale';
UPDATE "City" SET "intro" = REPLACE("intro", 'is the clearest first step', 'is a good first step') WHERE "intro" LIKE '%is the clearest first step%';
UPDATE "City" SET "intro" = REPLACE("intro", 'is the natural place to start', 'is a good place to start') WHERE "intro" LIKE '%is the natural place to start%';
UPDATE "City" SET "intro" = REPLACE("intro", 'is the natural first step', 'is a good first step') WHERE "intro" LIKE '%is the natural first step%';
UPDATE "City" SET "intro" = REPLACE("intro", 'is the simplest way in', 'is a good way in') WHERE "intro" LIKE '%is the simplest way in%';
