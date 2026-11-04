-- Evidence clean-up for the 18 live ACTIVE rows whose only stored evidence page was a directory (BamBuddies / MahJongg Maven / Mahjong 4 Friends), found while exporting the listings for the state-ranking article.
-- 1) Own pages found and read (or confirmed by search results of the page itself): the stored URL now points to them.
-- Aldridge Gardens (read): "Mah Jongg Open Play is free and open to anyone who knows how to play American Mah Jongg ... NMJL rules."
UPDATE "Club" SET "website" = 'https://aldridgegardens.com/education/adulteducation/mah-jongg.html', "sourceUrl" = 'https://aldridgegardens.com/education/adulteducation/mah-jongg.html' WHERE "slug" = 'birmingham-aldridge-gardens-mahjong-classes-open-play-cynde-morgan';
-- Levis JCC: programs page (the site blocks our fetch; the page text "Students must bring a National Mah Jongg League card" was returned by a search).
UPDATE "Club" SET "website" = 'https://levisjcc.org/culture/programs_classes/', "sourceUrl" = 'https://levisjcc.org/culture/programs_classes/' WHERE "slug" = 'boca-raton-levis-jcc-phyllis-harvey-sandler-center-beginner-mah-jongg';
-- Mahj on the Beach (read): home page says "American Mahjong lessons, corporate events, fundraisers, international retreats & more!"
UPDATE "Instructor" SET "website" = 'https://mahjonthebeach.com', "sourceUrl" = 'https://mahjonthebeach.com' WHERE "slug" = 'boca-raton-mahj-on-the-beach-kari-long';
-- Samson Family JCC: the JCC's own Mah Jongg program page (blocked for our fetch; a search result of the page describes the American card game). Quote still to be read in a browser (prompt 10).
UPDATE "Club" SET "website" = 'https://www.jccmilwaukee.org/program/mah-jongg', "sourceUrl" = 'https://www.jccmilwaukee.org/program/mah-jongg' WHERE "slug" = 'milwaukee-harry-rose-samson-family-jcc-mah-jongg';
-- 2) Directory-only rows (no page of the group or teacher says American / NMJL) go back to NEEDS_REVIEW, as for the other directory leads.
UPDATE "Instructor" SET "status" = 'NEEDS_REVIEW', "updatedAt" = CURRENT_TIMESTAMP WHERE "status" = 'ACTIVE' AND "slug" IN ('washington-caryn-f', 'baltimore-heather-s', 'kansas-city-emily-levine-kc-mahjong-mama', 'kansas-city-val-h', 'raleigh-carol-m', 'raleigh-michelle-nice-the-mahj-lady', 'columbus-alice-s', 'nashville-liza-gaston-mahj-madness');
UPDATE "Club" SET "status" = 'NEEDS_REVIEW', "updatedAt" = CURRENT_TIMESTAMP WHERE "status" = 'ACTIVE' AND "slug" = 'milwaukee-american-mah-jongg-at-whole-foods-market';
-- 3) Rows whose quoted own-page wording was read in a browser pass but whose URL was not stored (Riverchase UMC, All About Mahj Bham, Tapping Mahjette, 904 Mahj, Waukesha) stay ACTIVE; the URLs are collected by docs/browser-prompts/10-evidence-urls.md.
