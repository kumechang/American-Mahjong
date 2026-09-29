-- New city, added unpublished until its data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_tampa', 'Tampa', 'FL', 'tampa', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
