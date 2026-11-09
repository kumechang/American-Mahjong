-- Automatic import 2026-11-09 (discover-2026-11-09-1703, verify-2026-11-09-1712). Written by scripts/auto-import.mjs; see docs/PROJECT_STATUS.md.
-- Owners whose own page says American / NMJL (scripts/verify-owners.mjs), with their ready sessions
UPDATE "Instructor" SET "status" = 'ACTIVE', "lastVerifiedAt" = '2026-11-09', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'aurora-mountain-mermaid-mahjong' AND "status" = 'NEEDS_REVIEW'; -- Mountain Mermaid Mahjong (Aurora, CO): "Perfect for beginners! We cover the basics… tiles, terms, dealing, strategy, and rules set by the National Mahjong League. Learn with boutique tiles, mats, and tile guides. We’ll get you playing by th" https://www.mountainmermaidmahjong.com/

-- Publish rule (five active rows)
UPDATE "City" SET "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'johns-creek'; -- Johns Creek, GA: 4 active rows for 3+ days (rule: 5)
