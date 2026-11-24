-- Sarasota (26 impressions, position 9.5) and Salt Lake City (14 impressions, position 16) were unpublished by the five-row rule and answer 404 now:
-- both have two groups and an intro, and are in data/seo-keep-published.txt, so they are published again (auto-import keeps them there).
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" IN ('sarasota', 'salt-lake-city') AND "intro" IS NOT NULL;
