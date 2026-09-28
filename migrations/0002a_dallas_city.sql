-- Dallas was the very first city imported, before the migrations/
-- pipeline existed — its City row was inserted by hand outside of any
-- tracked migration file, so a fresh database (or this migration
-- history replayed from scratch) has no City row for it and every
-- later migration that references Dallas (0003_dallas.sql onward)
-- fails its cityId foreign-key lookup. This backfills that row.
--
-- INSERT OR IGNORE makes this a safe no-op against the real production
-- database, where the Dallas row already exists (conflict on the
-- unique "slug" column) — it only matters for rebuilding a database
-- from an empty state.
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_dallas', 'Dallas', 'TX', 'dallas', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
