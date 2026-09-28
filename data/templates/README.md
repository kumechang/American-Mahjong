# Data collection CSV templates

These templates are the handoff format between manual research (a person
looking at club/instructor/event websites) and the database. Fill them in,
then they get imported into D1 — see `docs/DATA_COLLECTION.md` for the
full research procedure.

Each file's sample row is the same placeholder data already seeded into
local dev (`drizzle/seed.sql`) — replace it with real, verified rows.

## Conventions

- **Booleans**: `TRUE` / `FALSE` (any spreadsheet tool exports these
  as-is; don't use `1`/`0` or `Yes`/`No`).
- **Dates**: `YYYY-MM-DD` (e.g. `2026-10-03`).
- **Times**: 24-hour `HH:MM` (e.g. `19:00`), city-local time. Leave blank
  if unknown.
- **Empty fields**: leave the cell blank — don't write `N/A` or `-`.
- **`city` / `state`**: must exactly match an existing `City` row (e.g.
  `Dallas` / `TX`) — this is how a row gets linked to the right city page.
  Two-letter state code.
- **`source_url`**: required. The exact page you read this information
  from (a club's own site, a Meetup group page, etc.) — this is what
  `last_verified_at` refers back to.
- **`last_verified_at`**: the date *you* checked this row was accurate,
  not when the club was founded. Re-check and bump this periodically —
  see the re-verification cadence in `docs/DATA_COLLECTION.md`.
- **`status`**: one of `ACTIVE`, `INACTIVE`, `NEEDS_REVIEW`. Use
  `NEEDS_REVIEW` for anything you're not fully confident about instead of
  guessing — a page with unreviewed data is safer than a wrong claim.

## clubs.csv

| Column | Notes |
|---|---|
| `name` | Club's public name |
| `city`, `state` | Must match an existing City |
| `description` | 1–2 sentences, your own words (don't copy site text verbatim) |
| `address` | Street address if the club meets at a fixed public venue; leave blank for private/rotating locations |
| `website`, `phone`, `email` | Optional contact info |
| `latitude`, `longitude` | Optional; only fill in if you have a real geocoded address |
| `beginner_friendly` | Judgment call — see the field guidance in `docs/DATA_COLLECTION.md` |
| `lessons_available`, `open_play`, `social_play`, `women_only`, `free` | Booleans describing the club |
| `price` | Per-session price in USD, numeric only (e.g. `20`), blank if free or unknown |
| `schedule` | Free text, e.g. `"Saturdays, 1:00 PM"` |
| `source_url`, `last_verified_at`, `status` | See Conventions above |

## instructors.csv

| Column | Notes |
|---|---|
| `name` | Instructor's public name |
| `city`, `state` | Where they primarily teach |
| `website`, `contact` | Optional |
| `private_lesson`, `group_lesson`, `online_lesson`, `beginner_lesson` | Booleans |
| `price` | Numeric, USD, blank if unknown/varies |
| `source_url`, `last_verified_at`, `status` | See Conventions above |

## events.csv

| Column | Notes |
|---|---|
| `name` | Event name |
| `city`, `state` | Must match an existing City |
| `event_date` | `YYYY-MM-DD` |
| `start_time`, `end_time` | `HH:MM`, optional |
| `venue` | Only if different from the hosting club's usual location |
| `club_name` | Optional — must exactly match a `name` in `clubs.csv` (or an existing DB row) to link the event to that club |
| `instructor_name` | Optional, same matching rule against `instructors.csv` |
| `event_type` | One of `OPEN_PLAY`, `TOURNAMENT`, `SOCIAL`, `LESSON`, `OTHER` |
| `beginner_friendly` | Boolean |
| `price` | Numeric, USD, blank if free/unknown |
| `registration_url` | Sign-up link if there is one |
| `source_url`, `last_verified_at`, `status` | See Conventions above |
