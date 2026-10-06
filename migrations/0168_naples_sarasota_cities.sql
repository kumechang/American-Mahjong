-- New cities, added unpublished until their data is reviewed.
INSERT OR IGNORE INTO "City" ("id", "name", "state", "slug", "published", "createdAt", "updatedAt") VALUES
('city_naples', 'Naples', 'FL', 'naples', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city_sarasota', 'Sarasota', 'FL', 'sarasota', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
