-- Clubs with no website of their own whose only source is a directory page
-- (BamBuddies) are moved to NEEDS_REVIEW until the group's or venue's own
-- page confirms the schedule. Cincinnati and Pittsburgh drop below the
-- docs/CITY_PAGE_POLICY.md §11 minimum (>=5 ACTIVE rows) and are unpublished.
UPDATE "Club" SET "status" = 'NEEDS_REVIEW', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" IN (
  'club_cincinnati-mayerson-jcc-mah-jongg-drop-in',
  'club_cincinnati-mariemont-branch-library-open-play-mahjong',
  'club_detroit-birmingham-berkley-first-umc-mah-jongg-open-play',
  'club_pittsburgh-lauri-ann-west-community-center-beginner-mah-jongg',
  'club_pittsburgh-cooper-siegel-community-library-open-mah-jong-play',
  'club_pittsburgh-pittsburgh-mahjong-club-at-rodef-shalom'
);
UPDATE "City" SET "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" IN ('cincinnati', 'pittsburgh');
UPDATE "City" SET "intro" = 'Metro Detroit has lessons and several open-play options. Mahjong Social Club Michigan offers Mahjong 101 classes and guided play, while Westland Public Library hosts open play. Katie Wallace and Mah Jongg Mommas teach across Southeast Michigan, and Mah Jongg Mommas also offers online lessons. Locations are spread across the suburbs, so check the address first. Beginners may prefer a class before joining open play.' WHERE "slug" = 'detroit';
