ALTER TABLE "City" ADD COLUMN "areaId" TEXT;
CREATE INDEX IF NOT EXISTS "City_areaId_idx" ON "City" ("areaId");

-- Towns folded into a nearby city's area page (data/city-areas.txt); their URLs redirect to the hub
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'birmingham'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'chelsea'; -- Chelsea, AL > Birmingham
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'birmingham'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'trussville'; -- Trussville, AL > Birmingham
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'birmingham'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'pell-city'; -- Pell City, AL > Birmingham
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'birmingham'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'inverness'; -- Inverness, AL > Birmingham
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'opelika'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'auburn'; -- Auburn, AL > Opelika
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'daphne'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'gulf-shores'; -- Gulf Shores, AL > Daphne
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'little-rock'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'lonoke'; -- Lonoke, AR > Little Rock
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'phoenix'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'cave-creek'; -- Cave Creek, AZ > Phoenix
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'gilbert'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'queen-creek'; -- Queen Creek, AZ > Gilbert
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'oakland'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'alamo'; -- Alamo, CA > Oakland
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'oakland'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'danville'; -- Danville, CA > Oakland
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'fresno'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'clovis'; -- Clovis, CA > Fresno
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'los-angeles'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'santa-monica'; -- Santa Monica, CA > Los Angeles
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'los-angeles'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'thousand-oaks'; -- Thousand Oaks, CA > Los Angeles
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'los-angeles'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'lake-forest'; -- Lake Forest, CA > Los Angeles
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'greenwich'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'darien'; -- Darien, CT > Greenwich
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'greenwich'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'stamford'; -- Stamford, CT > Greenwich
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'greenwich'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'new-canaan'; -- New Canaan, CT > Greenwich
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'greenwich'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'westport'; -- Westport, CT > Greenwich
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'west-hartford'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hartford'; -- Hartford, CT > West Hartford
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'west-hartford'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'newington'; -- Newington, CT > West Hartford
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'west-palm-beach'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'palm-beach-gardens'; -- Palm Beach Gardens, FL > West Palm Beach
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'west-palm-beach'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'jupiter'; -- Jupiter, FL > West Palm Beach
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'west-palm-beach'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'lake-worth'; -- Lake Worth, FL > West Palm Beach
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'west-palm-beach'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'boynton-beach'; -- Boynton Beach, FL > West Palm Beach
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'boca-raton'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'delray-beach'; -- Delray Beach, FL > Boca Raton
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'fort-lauderdale'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'margate'; -- Margate, FL > Fort Lauderdale
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'fort-myers'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'bonita-springs'; -- Bonita Springs, FL > Fort Myers
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'orlando'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'altamonte-springs'; -- Altamonte Springs, FL > Orlando
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'orlando'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'windermere'; -- Windermere, FL > Orlando
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'orlando'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'winter-garden'; -- Winter Garden, FL > Orlando
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'orlando'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'winter-park'; -- Winter Park, FL > Orlando
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'orlando'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'deland'; -- DeLand, FL > Orlando
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'sarasota'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'bradenton'; -- Bradenton, FL > Sarasota
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'tampa'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'st-petersburg'; -- St. Petersburg, FL > Tampa
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'roswell'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'johns-creek'; -- Johns Creek, GA > Roswell
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'roswell'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'cumming'; -- Cumming, GA > Roswell
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'atlanta'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'marietta'; -- Marietta, GA > Atlanta
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'atlanta'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'woodstock'; -- Woodstock, GA > Atlanta
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'atlanta'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'canton'; -- Canton, GA > Atlanta
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newnan'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'peachtree-city'; -- Peachtree City, GA > Newnan
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newnan'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'palmetto'; -- Palmetto, GA > Newnan
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newnan'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'moreland'; -- Moreland, GA > Newnan
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newnan'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'tyrone'; -- Tyrone, GA > Newnan
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'downers-grove'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'elmhurst'; -- Elmhurst, IL > Downers Grove
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'downers-grove'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'burr-ridge'; -- Burr Ridge, IL > Downers Grove
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'downers-grove'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'glen-ellyn'; -- Glen Ellyn, IL > Downers Grove
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'naperville'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'batavia'; -- Batavia, IL > Naperville
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'naperville'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'geneva'; -- Geneva, IL > Naperville
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'wichita'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'el-dorado'; -- El Dorado, KS > Wichita
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'new-orleans'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'slidell'; -- Slidell, LA > New Orleans
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'boston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'cambridge'; -- Cambridge, MA > Boston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'boston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'charlestown'; -- Charlestown, MA > Boston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'boston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'watertown'; -- Watertown, MA > Boston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'boston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'belmont'; -- Belmont, MA > Boston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'boston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'wilmington'; -- Wilmington, MA > Boston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newburyport'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'ipswich'; -- Ipswich, MA > Newburyport
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'grafton'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'milford'; -- Milford, MA > Grafton
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'baltimore'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'elkridge'; -- Elkridge, MD > Baltimore
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'minneapolis'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'coon-rapids'; -- Coon Rapids, MN > Minneapolis
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'minneapolis'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'maplewood'; -- Maplewood, MN > Minneapolis
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'minneapolis'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'wayzata'; -- Wayzata, MN > Minneapolis
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'st-louis'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'webster-groves'; -- Webster Groves, MO > St. Louis
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'columbia-mo'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hallsville'; -- Hallsville, MO > Columbia
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'ocean-springs'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'd-iberville'; -- D’Iberville, MS > Ocean Springs
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'raleigh'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'cary'; -- Cary, NC > Raleigh
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'raleigh'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'holly-springs'; -- Holly Springs, NC > Raleigh
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'durham'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'chapel-hill'; -- Chapel Hill, NC > Durham
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'portsmouth'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'north-hampton'; -- North Hampton, NH > Portsmouth
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'cherry-hill'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'haddonfield'; -- Haddonfield, NJ > Cherry Hill
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newark'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hoboken'; -- Hoboken, NJ > Newark
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newark'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'wyckoff'; -- Wyckoff, NJ > Newark
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'newark'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'wharton'; -- Wharton, NJ > Newark
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'farmingdale'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'marlboro-township'; -- Marlboro Township, NJ > Farmingdale
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'whitehouse-station'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'flemington'; -- Flemington, NJ > Whitehouse Station
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'rye'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'scarsdale'; -- Scarsdale, NY > Rye
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'island-park'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'east-hills'; -- East Hills, NY > Island Park
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'island-park'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'east-meadow'; -- East Meadow, NY > Island Park
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'southampton'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'montauk'; -- Montauk, NY > Southampton
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'southampton'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'sagaponack'; -- Sagaponack, NY > Southampton
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'rochester'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'brighton'; -- Brighton, NY > Rochester
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'albany'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'troy'; -- Troy, NY > Albany
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'albany'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'saratoga-springs'; -- Saratoga Springs, NY > Albany
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'cleveland'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'lakewood'; -- Lakewood, OH > Cleveland
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'cleveland'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'avon'; -- Avon, OH > Cleveland
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'philadelphia'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'ambler'; -- Ambler, PA > Philadelphia
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'gettysburg'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'carlisle'; -- Carlisle, PA > Gettysburg
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'providence'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'newport'; -- Newport, RI > Providence
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'charleston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'johns-island'; -- Johns Island, SC > Charleston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'greenville'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'simpsonville'; -- Simpsonville, SC > Greenville
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'greenville'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'spartanburg'; -- Spartanburg, SC > Greenville
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'charlotte'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'york'; -- York, SC > Charlotte
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'houston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'friendswood'; -- Friendswood, TX > Houston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'houston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'mont-belvieu'; -- Mont Belvieu, TX > Houston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'houston'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'angleton'; -- Angleton, TX > Houston
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'round-rock'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'georgetown'; -- Georgetown, TX > Round Rock
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'denton'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'little-elm'; -- Little Elm, TX > Denton
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'fort-worth'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'keller'; -- Keller, TX > Fort Worth
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'bryan'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'brenham'; -- Brenham, TX > Bryan
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'salt-lake-city'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'layton'; -- Layton, UT > Salt Lake City
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'washington-dc'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'alexandria'; -- Alexandria, VA > Washington
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'virginia-beach'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'norfolk'; -- Norfolk, VA > Virginia Beach
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'virginia-beach'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hampton-roads'; -- Hampton Roads, VA > Virginia Beach
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'haymarket'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'new-baltimore'; -- New Baltimore, VA > Haymarket
UPDATE "City" SET "areaId" = (SELECT id FROM "City" WHERE "slug" = 'gainesville'), "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'nokesville'; -- Nokesville, VA > Gainesville

-- The same group or teacher filed under two towns of one area: keep the first (the hub's own, else the first town), retire the copies
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hartford-river-bend-bookshop'; -- same as west-hartford-river-bend-bookshop
UPDATE "Instructor" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hartford-linda-houde'; -- same as west-hartford-linda-houde
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'altamonte-springs-my-mahjong-room'; -- same as orlando-my-mahjong-room
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'deland-my-mahjong-room'; -- same as orlando-my-mahjong-room
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'winter-park-my-mahjong-room'; -- same as orlando-my-mahjong-room
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'burr-ridge-colleen-loftus-mariposa-mahjong'; -- same as downers-grove-colleen-loftus-mariposa-mahjong
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'watertown-mahjesty-mahjong'; -- same as cambridge-mahjesty-mahjong
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hoboken-keep-mahjing-on'; -- same as newark-keep-mahjing-on
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'marlboro-township-keep-mahjing-on'; -- same as farmingdale-keep-mahjing-on
UPDATE "Instructor" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'saratoga-springs-rhona-koretzky'; -- same as albany-rhona-koretzky
UPDATE "Club" SET "status" = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'new-baltimore-blue-ridge-mahj'; -- same as haymarket-blue-ridge-mahj

-- Intros written for the area pages (data/area-intros.json)
UPDATE "City" SET "intro" = 'Mariposa Mahjong teaches American mahjong around Downers Grove, with Mahjong 101 and 102 sessions at local cafes and restaurants in the western suburbs. Nearby, Mahjong Mischief and a teacher in Elmhurst run beginner classes and guided play at breweries and bars, and Blue Tiger Mahj Club hosts open play and wine nights in Glen Ellyn. Most events sell tickets in advance, so book ahead. If you are brand new, start with a Mahjong 101 session; it introduces the game from the tiles up.', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'downers-grove';
UPDATE "City" SET "intro" = 'South of Atlanta, American mahjong is played at the library and in small local groups. The Newnan Carnegie Library hosts open play, the Peachtree City Library runs its own open play sessions, and Tile & Table Tyrone teaches Mahj 101 classes and guided play. Palmetto Mahj holds meetups in the neighbourhood too. Classes are small and social, and schedules change, so check each listing before you go. If you have never played, the Mahj 101 class is the place to start.', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'newnan';
UPDATE "City" SET "intro" = 'North of Atlanta, The Tiled Sparrow hosts open play, guided play and Mahjong 101 lessons at breweries and restaurants in Roswell and nearby Milton, following the NMJL card. In Johns Creek, the Mahjong League and a city Mahjong Mondays meetup play open games, and Evenings at the Table in Cumming teaches a Mahjong Foundations series from the tiles through the Charleston. Venues change from week to week, so check the address on each event. If you are new, start with a Mahjong 101 lesson or the Foundations series.', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'roswell';
UPDATE "City" SET "intro" = 'In the East Bay, JCC East Bay offers American Mah Jongg with lessons and open play that welcome beginners. Over the hills in Danville, Bay Area Mahj runs lessons and open play, the Town of Danville offers an introduction to American mahjong, and Jean Melgar teaches American Mah Jongg. Ask each group which National Mah Jongg League card year it plays and how to sign up, since sessions and rooms change. If you are new, start with an introduction class in Danville or a beginner session at the JCC.', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'oakland';
UPDATE "City" SET "intro" = 'New Orleans has a parlor and a JCC program, and the north shore has a weekly game. Fleur de Mahj, in Metairie, offers beginner and strategy classes, guided play and tournaments under official National Mah Jongg League (NMJL) rules. The New Orleans JCC runs multi-session beginner classes at its Metairie and Uptown locations. Across Lake Pontchartrain, Crescent & Tile Mahjong Co hosts Scramble Nights in Slidell for players who already know the game. If you are new, start with a beginner class at Fleur de Mahj or the JCC.', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'new-orleans';
UPDATE "City" SET "intro" = 'In the Fresno and Clovis area, American Mahjong comes from Charleston Society, a community group that holds American Mahjong 101 classes and guided play at wine rooms and wineries around the valley, including Kingsburg. Clovis Mahjong Club also runs a Mahjong 101 session for newcomers. Events carry a ticket price and venues change, so check each listing before you go. If you are new, start with a Charleston Society Mahjong 101 class, then move on to guided play.', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'fresno';

-- A hub is published once its whole area has five active rows and an intro
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'birmingham' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'opelika' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'daphne' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'little-rock' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'phoenix' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'gilbert' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'oakland' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'fresno' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'los-angeles' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'greenwich' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'west-hartford' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'west-palm-beach' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'boca-raton' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'fort-lauderdale' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'fort-myers' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'orlando' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'sarasota' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'tampa' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'roswell' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'atlanta' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'newnan' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'downers-grove' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'naperville' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'wichita' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'new-orleans' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'boston' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'newburyport' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'grafton' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'baltimore' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'minneapolis' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'st-louis' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'columbia-mo' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'ocean-springs' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'raleigh' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'durham' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'portsmouth' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'cherry-hill' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'newark' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'farmingdale' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'whitehouse-station' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'rye' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'island-park' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'southampton' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'rochester' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'albany' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'cleveland' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'philadelphia' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'gettysburg' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'providence' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'charleston' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'greenville' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'charlotte' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'houston' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'round-rock' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'denton' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'fort-worth' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'bryan' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'salt-lake-city' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'washington-dc' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'virginia-beach' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'haymarket' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
UPDATE "City" SET "published" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'gainesville' AND "published" = 0 AND "intro" IS NOT NULL AND "areaId" IS NULL AND
  (SELECT count(*) FROM "Club" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Instructor" WHERE "status" = 'ACTIVE' AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) +
  (SELECT count(*) FROM "Event" WHERE "status" = 'ACTIVE' AND "eventDate" >= date('now') AND "cityId" IN (SELECT t.id FROM "City" t WHERE t.id = "City".id OR t."areaId" = "City".id)) >= 5;
