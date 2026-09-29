-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_omaha', 'Omaha', 'NE', 'omaha', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_boise', 'Boise', 'ID', 'boise', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_albuquerque', 'Albuquerque', 'NM', 'albuquerque', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_buffalo', 'Buffalo', 'NY', 'buffalo', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_fort-lauderdale', 'Fort Lauderdale', 'FL', 'fort-lauderdale', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_charleston', 'Charleston', 'SC', 'charleston', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
