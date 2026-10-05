# Project Status

Living record of where the project stands. Update it at the end of each work
session (date at the top, then the sections below). Snapshot: **2026-10-01**.

**Business goal:** grow organic page views with programmatic city pages, add an
ad model later. Shop is deliberately deferred. Site: mahjong-map.com (Cloudflare
Workers + D1). Working branch: `claude/ecstatic-archimedes-n8cojp`, PRs
squash-merged to `main` (PR numbers below run through #60).

## By the numbers (local DB, 2026-09-30)
- Cities: **69 total, 53 published** (16 unpublished, listed below)
- ACTIVE rows: 113 clubs, 115 instructors, 213 upcoming events
- NEEDS_REVIEW rows held back: 33 clubs, 14 instructors, 49 events
- Migrations: 0000–0167 (`migrations/`, applied automatically at deploy)
- Publish rule: at least 5 ACTIVE rows (clubs + instructors + upcoming events)

### Unpublished cities and what each needs
| City | ACTIVE now | Needs |
|---|---|---|
| Milwaukee | 4 | 1 more (a dated event; last one passed 10/3) |
| Columbia, SC | 5 (4 are USC 10/14 sessions that end soon) | dates after 10/14; is "Alice" American? Hold publishing |
| Pittsburgh | 3 | 2 more; own-site sources for Rodef Shalom / Cooper-Siegel etc. |
| Cincinnati | 4 | 1 more; Cincy Mahjong Club / Mayerson JCC / Mariemont need American/NMJL on their own pages |
| Louisville | 3 | 2 more; Studio One and Keneseth Israel variant |
| Little Rock | 2 | 3 more; dated events (Little Rock Mahjong) |
| Colorado Springs | 2 | 3 more; dated events |
| Albuquerque, Des Moines, Wichita | 1 each | 4 more each |
| Greenville, Providence, Knoxville, Chattanooga, Spokane, Lexington | 0 | American/NMJL-confirmed sources |

Published but fragile: about 20 cities sit at exactly 5–6 upcoming rows, so they
will drop under 5 as events pass (see "Next steps").

## Done
**Site and infrastructure:** Next.js 16 on Cloudflare (OpenNext), D1 with Drizzle,
data migrations at deploy, sitemap/robots, JSON-LD, GA4, city pages with filters,
verified-date notes, city intros, `/about`, `/privacy`, `/terms`.
**Design (PRs #47–#55):** tokens (ivory/jade/tile-red, muted text), tile art, hero
city search, grouped `/cities`, city summary and "Good place to start", Learn
restyle, Find category hub, Community top cities, share image (`public/og/`),
axe accessibility audit (0 violations, `scripts/a11y-audit.mjs`).
**Data pipeline:** external researcher → `npm run validate:csv` → per-city
`data/collected/` → `scripts/import-csv.mjs` → numbered migrations. The importer
now rejects rows with the wrong field count; the validator catches shifted
columns, slug collisions, directory-only sources and more. Prompt for the
researcher: `docs/CITY_RESEARCH_PROMPT.md`.
**Quality decisions:** directory-only clubs without a website were downgraded
(Cincinnati and Pittsburgh unpublished); events hidden after their date; private
instructor contacts stored but never shown.
**Expert reviews:** role-played SEO, E-E-A-T, local reader, accessibility, legal
and privacy, brand/visual and UX, data engineering; independent AI rules and
editorial reviews; a domain expert's written answer (applied to `learn.ts`,
PR #60). Records in `docs/` and `docs/review/`.

## In progress / waiting on people
1. **Contact email:** set `NEXT_PUBLIC_CONTACT_EMAIL` (Cloudflare build
   variable). Until then `/privacy`, `/terms`, `/about` say the address is being
   set up.
2. **Human reviewers:** a real American Mahjong player to confirm the wall-game
   deal, the C-hand last discard and the jokerless bonus; a native US English
   editor for the Learn guides and city intros. Outreach kit and candidate
   profiles are in `docs/review/outreach/` (sent to the owner as zips).
3. **Attorney review** of `/privacy` and `/terms` before ads or affiliate links.
4. **Researcher batches** for the unpublished cities above and for New York
   (only 5 rows for the largest market: Long Island, Westchester, Brooklyn).

## Next steps (suggested order)
1. ~~Weekly freshness job~~ Built 2026-10-01: `.github/workflows/freshness.yml` (Mondays) runs `scripts/freshness-report.mjs` and posts the report to a `freshness` GitHub issue. Report only; fixes go through researcher CSV + migration. First run found 5 dead links and 6 past events still ACTIVE.
2. ~~Rewrite the city intros~~ Done 2026-10-01 (`0161_intro_rewrite.sql`, all 53, editor's structures A/B/C, no generic closers; the city page now carries one sitewide "check the event page" line). Still to check: program-title wording ("Mah Jongg" vs "Mahjong") against each source page, and send the new intros back to the editor.
3. `db:audit` script comparing `data/collected/` with the local D1.
4. Event slug disambiguation for new imports (same name and date collide).
5. Learn/Find OG variants, Shop page later, a listing-request form after the
   contact email exists.
6. First re-verification round before late December 2026 (the 90-day stale
   note appears on almost every listing then).

## External research server (2026-10-05)
`kick-claude` workflow (cron-job.org or manual) sends `prompts/city-research.md` to the research server.
The server pushes CSVs to branch `inbox/<date>` under `data/inbox/<date>/<city>/`; `ingest-inbox`
validates them and opens a PR. A person curates what is new, writes `data/collected/<city>/update*.csv`
and a migration. Edit the target cities at the top of the prompt before each run. First run (PR #71)
mostly repeated rows already in the DB under different names; the prompt now says to read `data/collected/` first.

Run 2 (2026-10-05, prompt with embedded existing rows): the server obeyed (no resends; reports only where nothing
new was found) but found little: Cincinnati +Mrs Mahj promoted, +Cincy Mahjong Club and 3 events (NEEDS_REVIEW);
Pittsburgh, Louisville, Milwaukee, Columbia nothing publishable. Raw output in `data/inbox/2026-10-05-run2/`.
Branch names now carry the time (`inbox/YYYY-MM-DD-HHMM`) so reruns on the same day don't collide.

## Nightly research (built 2026-10-05)
`.github/workflows/nightly-research.yml` is started daily at 02:00 JST by cron-job.org (workflow_dispatch; no GitHub schedule, to avoid double runs) and on demand. `scripts/build-nightly-prompt.mjs`
picks the mode: **events** (the 4 published cities closest to dropping under 5 rows) or **cities** (next 2 from
`data/city-queue.txt`); every third day of the year is reserved for a new city. It skips the night if 2+ `inbox/` PRs are open.
The server's output arrives as an `inbox/YYYY-MM-DD-HHMM` PR (validated by `ingest-inbox`); a person curates and imports
(step 1 of 3: later the event-only PRs may get an auto-generated migration, then auto-merge). The prompt rules live in
`prompts/city-research.md`; its marked blocks are replaced per night. Manual run: Actions → nightly-research → Run workflow.

First nightly run (events mode, 2026-10-05, PR kumechang/American-Mahjong#78): +16 Las Vegas, +2 Fort Worth, +1 Cleveland dated
events (all validated, imported as `0165`); Fort Lauderdale had nothing new (Calendly page unreadable). This mode works well for
cities whose clubs publish a booking calendar. Raw output: `data/inbox/2026-10-05-1301/`. `ingest-inbox` now validates only folders
changed relative to `main`.
Second run (cron-job.org test, PR #80, `0166`): +1 Tucson event (Dec 7, ACTIVE); Jacksonville (5) and Cleveland (1) events as NEEDS_REVIEW
(no start time or individual link; or no American/NMJL on the event page). Fort Lauderdale again nothing: needs a person to read its Calendly page.

Run 3 (cron-job.org's first real night, server-made PR #83, `0167`): Fort Lauderdale 3 events and Jacksonville 2 events as NEEDS_REVIEW
(Jacksonville's Gaa Cafe events were sent as ACTIVE but the year is inferred and the venue's style is unverified). Cleveland and San Antonio:
nothing new. San Antonio's ACTIVE rows (Polished Tile classes) all ended 10/3; the city page is thin until new dates appear.

Housekeeping: `close-imported-inbox` (runs on every push to `main`) closes the `inbox/<id>` PR and deletes the branch once
`data/inbox/<id>/` is in `main`. So the routine is: the import PR archives the raw folder; the inbox PR closes itself.

## How to resume
```bash
git checkout claude/ecstatic-archimedes-n8cojp && git fetch origin main && git merge origin/main
npm ci && npx wrangler d1 migrations apply DB --local
npm run dev                      # site on :3000
npm run validate:csv -- --clubs=… --instructors=… --events=…   # check new researcher CSVs
node scripts/import-csv.mjs --clubs=… --out=migrations/NNNN_city.sql   # generate a migration
node --experimental-strip-types scripts/export-review-packet.mjs      # refresh docs/review/
```
Workflow notes: squash merges make the branch diverge from `main`; merge `main`
into the branch (keep the branch version of docs) and push normally, never
force-push. Add city rows unpublished, then a separate publish migration and an
intro migration once a city reaches 5 ACTIVE rows.

## Where things are
| Topic | File |
|---|---|
| Researcher prompt and import steps | `docs/CITY_RESEARCH_PROMPT.md` |
| City page and SEO policy | `docs/CITY_PAGE_POLICY.md` |
| Data collection and freshness | `docs/DATA_COLLECTION.md` |
| Data engineering review | `docs/DATA_ENGINEERING_REVIEW.md` |
| Voice and tone (Learn) | `docs/VOICE_AND_TONE.md` |
| Legal and privacy notes | `docs/LEGAL_AND_PRIVACY.md` |
| Design direction, accessibility | `docs/DESIGN_DIRECTION.md` |
| Share image brief | `docs/OG_IMAGE_PROMPTS.md` |
| Human review kit and feedback | `docs/EXPERT_REVIEW_PACKET.md`, `docs/review/` |
| NotebookLM evidence-check workflows | `docs/NOTEBOOKLM_WORKFLOWS.md` |
