-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_baltimore', 'Baltimore', 'MD', 'baltimore', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_columbus', 'Columbus', 'OH', 'columbus', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_detroit', 'Detroit', 'MI', 'detroit', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_kansas-city', 'Kansas City', 'MO', 'kansas-city', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_pittsburgh', 'Pittsburgh', 'PA', 'pittsburgh', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
