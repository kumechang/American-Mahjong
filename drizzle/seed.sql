-- Sample data for local development, applied with:
--   npx wrangler d1 execute american-mahjong-db --local --file=prisma/seed.sql
-- (add --remote once the real D1 database is created via `wrangler d1 create`)

INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt")
VALUES ('city_dallas', 'Dallas', 'TX', 'dallas', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Club"
  ("id", "name", "slug", "cityId", "beginnerFriendly", "lessonsAvailable", "openPlay", "schedule", "price", "status", "createdAt", "updatedAt")
VALUES
  ('club_dallas_beginner', 'Dallas Beginner Mahjong Club', 'dallas-beginner-mahjong-club', 'city_dallas', 1, 1, 1, 'Saturdays, 1:00 PM', 20, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('club_dallas_social', 'Dallas Social Mahjong', 'dallas-social-mahjong', 'city_dallas', 1, 0, 0, 'Sundays, 2:00 PM', NULL, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE "Club" SET "free" = 1 WHERE "id" = 'club_dallas_social';

INSERT OR IGNORE INTO "Instructor"
  ("id", "name", "slug", "cityId", "privateLesson", "groupLesson", "beginnerLesson", "status", "createdAt", "updatedAt")
VALUES
  ('instructor_jane_dallas', 'Jane, Certified Instructor', 'jane-instructor-dallas', 'city_dallas', 1, 1, 1, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Event"
  ("id", "name", "slug", "eventDate", "cityId", "eventType", "beginnerFriendly", "status", "createdAt", "updatedAt")
VALUES
  ('event_dallas_open_play_0', 'Beginner Open Play', 'dallas-beginner-open-play-0', '2026-10-03 00:00:00', 'city_dallas', 'OPEN_PLAY', 1, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('event_dallas_open_play_1', 'Beginner Open Play', 'dallas-beginner-open-play-1', '2026-10-05 00:00:00', 'city_dallas', 'OPEN_PLAY', 1, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('event_dallas_open_play_2', 'Beginner Open Play', 'dallas-beginner-open-play-2', '2026-10-10 00:00:00', 'city_dallas', 'OPEN_PLAY', 1, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Product"
  ("id", "name", "slug", "category", "description", "affiliateUrl", "beginnerPick", "createdAt", "updatedAt")
VALUES
  ('product_beginner_set', 'Beginner American Mahjong Set (166 Tiles)', 'beginner-mahjong-set', 'Mahjong Sets', 'A complete 166-tile set with racks, recommended for first-time buyers.', '#', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('product_scoring_card', 'Current Year Scoring Card', 'current-year-scoring-card', 'Cards', 'The official National Mah Jongg League scoring card.', '#', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
