-- New cities, added unpublished until their data is reviewed (per
-- docs/DATA_COLLECTION.md's publish workflow).
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_cincinnati', 'Cincinnati', 'OH', 'cincinnati', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_cleveland', 'Cleveland', 'OH', 'cleveland', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_indianapolis', 'Indianapolis', 'IN', 'indianapolis', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_milwaukee', 'Milwaukee', 'WI', 'milwaukee', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_st-louis', 'St. Louis', 'MO', 'st-louis', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
