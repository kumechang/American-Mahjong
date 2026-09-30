-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_orlando', 'Orlando', 'FL', 'orlando', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_west-palm-beach', 'West Palm Beach', 'FL', 'west-palm-beach', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_newark', 'Newark', 'NJ', 'newark', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
