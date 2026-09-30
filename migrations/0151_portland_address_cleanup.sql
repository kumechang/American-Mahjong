-- Address columns hold an address, not prose (docs/CITY_RESEARCH_PROMPT.md).
-- Move the location wording into the description and keep the city as the address.
UPDATE "Club" SET "description" = "description" || ' Location: ' || "address" || '.', "address" = 'Portland, OR'
WHERE "cityId" = (SELECT id FROM City WHERE slug = 'portland')
  AND "address" NOT GLOB '*[0-9]*'
  AND ("name" LIKE 'Gracey Tile Club%' OR "name" LIKE 'PDX Mahjong Club%' OR "name" LIKE 'Bird Bam Beth%');
