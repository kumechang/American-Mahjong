-- New city, added unpublished until its data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow). Published in a
-- follow-up migration once confirmed.
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_seattle', 'Seattle', 'WA', 'seattle', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
