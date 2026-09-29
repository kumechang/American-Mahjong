-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_louisville', 'Louisville', 'KY', 'louisville', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_oklahoma-city', 'Oklahoma City', 'OK', 'oklahoma-city', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_salt-lake-city', 'Salt Lake City', 'UT', 'salt-lake-city', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_las-vegas', 'Las Vegas', 'NV', 'las-vegas', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_sacramento', 'Sacramento', 'CA', 'sacramento', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_san-antonio', 'San Antonio', 'TX', 'san-antonio', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
