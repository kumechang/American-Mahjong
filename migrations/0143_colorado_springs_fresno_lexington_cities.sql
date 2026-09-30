-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_colorado-springs', 'Colorado Springs', 'CO', 'colorado-springs', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_fresno', 'Fresno', 'CA', 'fresno', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_lexington', 'Lexington', 'KY', 'lexington', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
