-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_memphis', 'Memphis', 'TN', 'memphis', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_new-orleans', 'New Orleans', 'LA', 'new-orleans', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_birmingham', 'Birmingham', 'AL', 'birmingham', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_richmond', 'Richmond', 'VA', 'richmond', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_jacksonville', 'Jacksonville', 'FL', 'jacksonville', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_tucson', 'Tucson', 'AZ', 'tucson', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
