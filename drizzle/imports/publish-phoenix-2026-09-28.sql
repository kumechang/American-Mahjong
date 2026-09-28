-- Phoenix was held back in the first publish pass (see
-- publish-2026-09-28.sql) because after filtering to ACTIVE-only rows it
-- had zero clubs and zero events, just one instructor. Follow-up research
-- (via WebFetch against clubs'/instructors' own sites, not third-party
-- directories where avoidable) found enough to clear the bar:
--   - Mahjong for People who Work: upgraded NEEDS_REVIEW -> ACTIVE with a
--     specific corroborated weekly Phoenix slot (Wed 5pm, Fate Brewing).
--   - 3 new ACTIVE instructors (Maj by Daron upgraded off a weak
--     third-party citation onto their own site; Mod Mahj; So Bam Fun
--     Phoenix), plus one NEEDS_REVIEW (Joan S. — directory-only, no own
--     site to verify against).
--   - The existing NEEDS_REVIEW event was upgraded to ACTIVE, and a second
--     real dated event (Eventbrite, Nov 7, Desert Ridge Marketplace) added.
-- Now: 1 ACTIVE club, 4 ACTIVE instructors, 2 ACTIVE events.

UPDATE "City" SET "published" = 1 WHERE "slug" = 'phoenix';
