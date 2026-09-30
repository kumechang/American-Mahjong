-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_little-rock', 'Little Rock', 'AR', 'little-rock', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_fort-worth', 'Fort Worth', 'TX', 'fort-worth', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_spokane', 'Spokane', 'WA', 'spokane', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_wichita', 'Wichita', 'KS', 'wichita', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
