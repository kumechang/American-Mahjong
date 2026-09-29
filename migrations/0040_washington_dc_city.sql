-- New city, added unpublished until its data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_washington_dc', 'Washington', 'DC', 'washington-dc', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
