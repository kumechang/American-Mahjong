-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_durham', 'Durham', 'NC', 'durham', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_greenville', 'Greenville', 'SC', 'greenville', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_providence', 'Providence', 'RI', 'providence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_knoxville', 'Knoxville', 'TN', 'knoxville', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
