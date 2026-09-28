-- Baseline data for local development, applied with:
--   npx wrangler d1 execute american-mahjong-db --local --file=drizzle/seed.sql
-- (add --remote once the real D1 database is created via `wrangler d1 create`)
--
-- Only City and Product placeholders live here. Club/Instructor/Event rows
-- are real, researched data imported via scripts/import-csv.mjs — see
-- data/collected/ and drizzle/imports/ — not placeholders, so they don't
-- belong in this file.

INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt")
VALUES ('city_dallas', 'Dallas', 'TX', 'dallas', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Product"
  ("id", "name", "slug", "category", "description", "affiliateUrl", "beginnerPick", "createdAt", "updatedAt")
VALUES
  ('product_beginner_set', 'Beginner American Mahjong Set (166 Tiles)', 'beginner-mahjong-set', 'Mahjong Sets', 'A complete 166-tile set with racks, recommended for first-time buyers.', '#', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('product_scoring_card', 'Current Year Scoring Card', 'current-year-scoring-card', 'Cards', 'The official National Mah Jongg League scoring card.', '#', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
