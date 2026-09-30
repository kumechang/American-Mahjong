-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_hartford', 'Hartford', 'CT', 'hartford', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_columbia', 'Columbia', 'SC', 'columbia', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_des-moines', 'Des Moines', 'IA', 'des-moines', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_chattanooga', 'Chattanooga', 'TN', 'chattanooga', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
