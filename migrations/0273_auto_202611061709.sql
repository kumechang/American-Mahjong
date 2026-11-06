-- Automatic import 2026-11-06 (discover-2026-11-06-1703). Written by scripts/auto-import.mjs; see docs/PROJECT_STATUS.md.
-- Publish rule (five active rows)
UPDATE "City" SET "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'roswell'; -- Roswell, GA: 4 active rows for 3+ days (rule: 5)
UPDATE "City" SET "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'downers-grove'; -- Downers Grove, IL: 4 active rows for 3+ days (rule: 5)
UPDATE "City" SET "published" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'bonita-springs'; -- Bonita Springs, FL: 4 active rows for 3+ days (rule: 5)
