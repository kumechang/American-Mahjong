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
- Migrations: 0000–0191 (`migrations/`, applied automatically at deploy)
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

Prompt tuning after run 3: ACTIVE events need an explicit year, time, venue and American/NMJL (or an already ACTIVE organizer); never guess
the style from the venue; unreadable pages (Calendly, Eventbrite organizer) must be retried via individual event pages and listed under
"人が見る必要があるページ"; fixed `report.md` headings. The builder sends cities researched in the last 3 days (folders in `data/inbox/`) to
the back of the line, so one stubborn city doesn't take a slot every night.

Run 4 (new-city night, PR #87, `0168`–`0170`): Naples (2 ACTIVE, 12 waiting) and Sarasota (0 ACTIVE, 13 waiting), both unpublished.
Open questions per city are collected in `docs/HUMAN_CHECKS.md` (the nightly reports' "pages a person needs to check").

UI pass 1 (2026-10-07, no skill): city pages now list events as rows with weekday/date tile, time, place, type, beginner and price tags,
a Details link and "Show N more"; schedule and price no longer run together in "Good place to start" and club cards. axe: 0 violations.
Next candidates: header/content width alignment on inner pages, home and /cities search, mobile tap targets, instructor cards.

Run 5 (events night, PR #90, `0171`): only Cleveland produced rows (3 Cleveland Mahjong Collective events, NEEDS_REVIEW); Fort Lauderdale,
Fresno, Orlando had nothing new. Fresno's Charleston Society site is a "Coming Soon" page, so its events need a person to find them.

Hand-checked (2026-10-08): the owner read Charleston Society's package page and sent a screenshot; 2 Fresno events (10/27 101, 10/28 guided play) imported as `0172`.
The pages the server can't read (bamgoodtime package pages, Calendly) are best checked by a person.

UI pass 2 (2026-10-08, following the frontend-design skill file at /mnt/skills/public/frontend-design/SKILL.md): home page rebuilt around
real data (a "coming up in the next two weeks" list: one event per city, beginner-friendly first, from `src/lib/upcoming.ts`), left-aligned
hero, display serif (Literata) for h1/h2, no all-caps eyebrows or dot-joined chip strings, "How it works" as a real numbered sequence.
UI pass 3: `/cities` is a dense three-column list by state (no card per city, no all-caps state labels); page content is left-aligned with the header on every page (6xl container, `*:max-w-4xl/3xl` for text pages). UI pass 4: tap targets (header nav, footer links, filter buttons, Details/website/nearby-city links) now at least 40px tall on a phone; instructor cards show beginner/private/group/online tags. UI pass 5: Learn index is one numbered list of guides (a real sequence); guide pages use a 42rem measure (about 70 characters), a plain "In this guide" list, a ruled glossary instead of a card per term, and plain previous/next links. A phone tap-size check script lives only in the session notes (Playwright: list a/button/summary under 40px at 390px).

Event crawler (2026-10-09): `scripts/crawl-events.mjs` + `.github/workflows/crawl-events.yml` (started by cron-job.org, like nightly-research).
It reads each trusted club's own booking page with plain HTTP (no headless browser was needed): Bam Good Time `/events`, Bookwhen schedule
(event ids carry the date and time), and schema.org JSON-LD for other sites; compares by club + date + start time, writes only new events to
`data/inbox/crawl-<stamp>/<city>/events.csv` and lists "possibly gone" events in `report.md`. ACTIVE needs a club that is already ACTIVE, a start
time and a named place. First trial run: 60 new events in 9 cities, imported as `0174` (Baltimore 17, Seattle 10, Houston 6, San Antonio 6, ...).

Crawler PRs open only when there are new events; "possibly gone" and "0 events parsed" notes go to the job summary (first scheduled-style test
run found none new and its notes-only PR #99 was noise). Known items from the notes: Kansas City Park Hill "Mahjong for Beginners" Oct 13
may be gone; Soda City Mahj lists no events on its Bam Good Time page.

Eventbrite support (2026-10-09): organizer pages (`/o/…`) and collections (`/cc/…`) are read from their embedded data (venue, start time,
price, cancelled flag); the organizer is discovered from any Eventbrite event page a club already links to. First run: 17 new events
(Cleveland 14 of which 6 ACTIVE from Southwest Cleveland Mahjong and 8 NEEDS_REVIEW from Cleveland Mahjong Collective, Columbus 2, Naples 1), `0175`.
Calendly: the public booking API (`/api/booking/event_types/lookup` and `/calendar/range`) returns the open time slots without a browser; Linktree pages are read for their Calendly links; teachers (not only clubs) are now event owners. First run: 7 new events (Fort Lauderdale 5 from Your Mahjong Mama, Boise 2), `0176`. "Possibly gone" is judged across all of an owner's complete listings (Bam Good Time, Bookwhen, Eventbrite organizer), not per page.

Meetup and WordPress "The Events Calendar" (2026-10-09): Meetup groups are read from the page's embedded data (local time, venue, ACTIVE status);
sites that expose `/wp-json/tribe/events/v1/events` (sjcc.org, hcrj.org, marjcc.org, jewishlouisville.org, bocahistory.org, mnmahjong.com, ...) are read through
that API (search "mah", American-style filter), falling back to JSON-LD. The crawler looks 60 days ahead, makes names unique per city and date
(the importer overwrites a row with the same city + name + date), and gives each page a polite 1 request/second. First run: 134 new events in 13 cities
(106 ACTIVE), `0177`. Louisville's Trager JCC and Keneseth Israel weekly games now have dated rows (NEEDS_REVIEW until their pages are confirmed as American).

Club discovery (2026-10-09): `scripts/discover-clubs.mjs` + `.github/workflows/discover-clubs.yml` read 25 city pages a day from the Bam Good Time
club directory (about 1,100 pages, a full pass in seven weeks), find club sites (`<club>.bamgoodtime.com`) not on our site, read their home page and events,
and write researcher-style clubs.csv/events.csv (all NEEDS_REVIEW) with the club's own American/NMJL wording quoted. A PR opens only for leads in cities we
already cover, or whose club says American/NMJL, or that list dated sessions; the rest is named in the job summary. Shared code lives in `scripts/lib/crawl-lib.mjs`.
Trial (40 cities): Boston City Mahj, Brenham, Bryan, Bryant (14 events) looked worth checking.
First scheduled run (#106, offset 246): Bam Good Time lists every event twice (card + title link), so events.csv had each row doubled; `bamGoodTime()` now dedupes by event URL,
drops a venue of just "Free", and skips sessions held at private homes. Imported as NEEDS_REVIEW (`0178`): Denver (Flatirons Flowers Mahjong + 3 clubs, 21 events) and Dallas (2 clubs).
Left as archived leads for the AI cities night (not on the site yet): Evenings at the Table (Cumming, GA; Atlanta metro) and Dayton Ohio Mah Jongg (Dayton, OH).
First timed runs (2026-10-10, `0179`): AI verify night promoted Naples' Paradise Coast Mahjong and Naples Mahjong to ACTIVE (their own sites say "American Mahjong"; no NMJL card named) and found one new event (Good Pour, NEEDS_REVIEW);
the AI's other four Naples events were skipped because we already had richer rows for them. Louisville and Sarasota: nothing could be confirmed as American (reports archived; Selby Library names the NMJL card but its page stops at 2024).
Crawler added 4 ACTIVE events (Cleveland, San Antonio, Tampa x1) and the crawler now ignores the same Meetup/Bam Good Time page when a club and its instructor both list it. Left out: a Columbia "Private Lesson" (not a public event, no named venue).
Discovery re-found Cumming GA and Dayton OH (plus Cross Roads TX, North Texas Mahjong) -- all three cities are still not on the site.
2026-10-10 evening runs (`0180`): 4 ACTIVE events (Birmingham O'Neal Library 10/19, Baltimore Tiles Social Club, Houston HCRJ, Phoenix Mahjong for People who Work). Not imported: Katie Moellering stays NEEDS_REVIEW
(library staff member named on the library's event page, not an independent teacher), Columbia "Private Lesson" (crawler now skips private lessons), Tampa's instructor-side copy of an event we already have (crawler now also checks event page + date + time across all owners).
New cities (`0181`, unpublished): Cumming GA (Evenings at the Table, 5 events), Dayton OH (Dayton Ohio Mah Jongg, 1 event) and Little Elm TX (North Texas Mahjong; Bam Good Time files it under Cross Roads,
but its sessions are at TinMan Social in Little Elm and Bella Mia Winery in Pilot Point). Each club says "American" on its own page; all rows are NEEDS_REVIEW until the AI verify night confirms them.
`build-nightly-prompt.mjs` now counts a group's pending dated sessions towards the five rows, so Cumming and Little Elm are queued for verification first.
Discovery speed (2026-10-10): default is now 100 city pages per run (about 5 minutes, a full pass in 12 days; the lead cap is 150 so no city in a window is skipped). `--runs-per-day=N`
(workflow input `runs_per_day`) gives each of N runs a day its own slice by UTC hour, so cron-job.org can start it more often: for a one-off fast first pass use hourly with `batch=50`, `runs_per_day=24`
(24 slices of 50 = one full pass per day), then go back to once a day (or weekly). The cron-job.org request body then needs `{"ref":"main","inputs":{"batch":"50","runs_per_day":"24"}}`.
North Easton MA published by direct check (`0183`, 2026-10-11): the club's own pages say "American Mah Jongg" and teach the National Mah Jongg League card; 32 dated Beginners Open/Guided Play sessions
(Mon/Wed 6 PM, The Loft at MIMI + Clutch, $20) are ACTIVE. First published city that came out of the discovery crawler. Also from the end of the first discovery pass (#126, #128): 18 clubs and 186 sessions imported as
NEEDS_REVIEW (Tampa, Tucson, Wichita KS plus 10 new unpublished cities: Truckee, Tyrone, Vienna VA, Washington NC, Wayzata, Whitehouse Station, Williston, Wilmette, Wyckoff, Youngsville). Discovery now makes
same-day namesake events distinct (Vienna and Wilmette had 7 collisions).
Vienna VA and Wilmette IL published by direct check (`0184`, 2026-10-11): The Bamboo Room labels its open play "NMJL American" and teaches American mahjong (44 dated sessions ACTIVE); Third Coast Mahjong teaches
American-style play and the NMJL card (61 sessions ACTIVE). Left out: two non-mahjong rows at The Bamboo Room (a fantasy-football league, an offsite lunch club). Lakeside Mahjong (Wilmette, 3 sessions) stays NEEDS_REVIEW
because its page does not say American. Event names were cleaned (ALL CAPS to title case, price removed from the name). Published cities: 56.
13 more cities published by direct check (`0185`, 2026-10-11): Opelika AL, Rye NY, New Bedford MA, Roswell GA, Panama City FL, Newburyport MA, Portsmouth NH, Youngsville LA, Whitehouse Station NJ, Salem AR,
Little Elm TX, Cumming GA, Round Rock TX. Each club's own pages name American Mahjong or sell/ask for the NMJL card. Event rows are ACTIVE only with a start time and a named venue; rows without one
(Portsmouth "or another location", Round Rock "address to follow", Salem "Free (donations welcome)", Cumming league makeup, three Whitehouse Station guided plays) stay NEEDS_REVIEW. Not published, still NEEDS_REVIEW:
Park Ridge IL (North Shore Mahjong: club is American but its sessions are in Highland Park and Glenview, so the city name needs a decision), Wayzata MN (sessions at a private residence), Queen Creek AZ and Truckee CA
(session addresses look like homes), Tyrone GA and Nashville GA (street address only), Wyckoff NJ (lessons in other towns), and Washington NC, Newnan GA, Williston SC, Navarre FL, Palmetto GA (no American wording found).
Crawler fix: Bam Good Time lists "date - time - [host club] - location - price"; the parser now takes the last line before the price as the location, so "Private Residence" is caught and "-" or the host club name is no longer used as a venue.
Published cities: 69.
North Shore IL published (`0186`, 2026-10-11): the Park Ridge city row was renamed to the wider "North Shore" because North Shore Mahjong's 17 sessions are at venues in Highland Park and Glenview (cafes, a tavern, a boutique).
American wording is on the club's own pages. Published cities: 70.
Refresh of published cities under five rows (`0187`, 2026-10-11): 9 cities were under the rule, 3 are left (New Orleans, St. Louis, Tucson at 4). Dated sessions were read from the owners' own calendars:
Chicago +16 (The Mahjong Society calendar; "Mahjong & Money" and a Dec 8 row whose text still says Nov 10 stay NEEDS_REVIEW), Omaha +10 (Club Mahj at Stories Coffee Co. and Revival House; One Bam at Vino Mas Eagle Run; its beginner class and guided play
are at private homes and were left out), Los Angeles +1 (LA LA Mahjong at The New Deal, Burbank), Charleston +6 (Holy Mahj Beginners Series at The Card Room, from the Shopify product variants; Nov 30 has no time). Promoted to ACTIVE:
317 Mahj Collective (its Linktree says "American Mahjong lessons and events"), The Traveling Mahj (NMJL gameplay rules), and three Mahjong Social Club Jax sessions (the live booking page lists them as open but prints no year).
102 past-dated ACTIVE events were set to INACTIVE. Still open: New Orleans (MahjMarine's 10 Mahjong 101 sessions at The Rink do not say American; Fleur de Mahj sells leagues without dates in its product data), St. Louis (Magpie's
Oct 28 open play has no venue; Clover Club books through a widget), Tucson (tucsonjcc.org needs a browser).
Second discovery pass + 16 more cities (`0188`, `0189`, 2026-10-11): the hourly discovery runs (#130-#142) read the next alphabetical windows; 141 clubs and ~700 sessions were imported as NEEDS_REVIEW and 53 unpublished cities
were added (those with 5+ dated sessions or an American-stated club). The crawl PR #143 added 7 sessions (Houston, Oklahoma City, San Antonio, San Diego x2, Birmingham and Louisville as NEEDS_REVIEW); its Vienna "fantasy football" and
"lunch bunch" rows and the New Bedford "gives back" fundraiser are now filtered (NOT_A_SESSION). The crawler page cap is 1500 (it ran out at 400: Eventbrite and Calendly owners could not be read) and the job timeout 50 minutes.
Published after reading each club's own pages (all name American Mahjong or the NMJL card; session rows ACTIVE only with a start time and a business venue, never a bare city, a bare street address, the club's own name,
or a "house"): Knightdale NC, Grafton MA, Elgin IL, Gilbert AZ, Jacksonville NC, Knoxville TN, Goldsboro NC (2 clubs), Mobile AL (2 clubs), Clinton MO, Franklin TN, Chelsea AL, Aurora CO, Bryant AR, Georgetown TX,
Lees Summit MO, Marble Falls TX. Checked and held: Carlisle PA, Island Park NY, Friendswood TX, Layton UT, Angleton TX, Berlin MD (venues missing or street-address only), Billings MT, Fort Myers FL, Belmont MA (events are in
Chatham), Liberty MO (Kansas City group), Lucedale MS, Johns Island SC, Columbus GA (house venue), and seven clubs with no American wording. Published cities: 86.
Washington NC published (`0190`, 2026-10-11): Mahjongg by MawJayne's pages say NMJL playing cards are provided on site; 12 dated table-time sessions at Beaufort Marketplace, 4525 Hwy 264, Washington. Published cities: 87.
Third pass over the remaining 66 unpublished cities (owner pages read directly, 17 Bam Good Time clubs with sessions): nothing else is publishable yet. COMO Mahjong (Columbia MO, 63 sessions) has no American wording
(only a "Charleston Club" membership name); Mid Mo Mahjong's sessions are in Blue Springs (Kansas City area); Bend OR, Cherry Hill NJ, Brenham TX, Havre De Grace MD and Margate FL have American wording but venues that are
street-address only, "to be announced" or "free (donations welcome)", so fewer than four sessions qualify. Louisville KY, Sarasota FL, Naples FL (4 ACTIVE) and Pittsburgh PA have owners but none states American on its own pages.
The 40-odd bambuddies.org / orderofthetile.com rows (Pittsburgh, Cincinnati, Milwaukee) have no page of their own to read. Next step for these: contact the owners, or add a browser-based reader for sites that render with JavaScript.
Street-address-only venues (accepted 2026-10-12 when the address is a business, checked by address search): Island Park NY published (`0191`): MJ Social, 203 Long Beach Road is a commercial building (LoopNet), 41 dated sessions ACTIVE.
Still held after the address check: Bend OR (698 NW York Dr is a residential lot), Layton UT (Derus Way is a residential street), Friendswood TX (Anna Lane) and Angleton TX (Oak Ridge Dr) look like homes; Merchantville NJ (22 N Centre St
is a mixed-use building) and Havre De Grace MD (120 S Union Ave) could not be confirmed and each has fewer than four qualifying sessions. Published cities: 88.
Verify-night order (2026-10-11): published cities about to drop under five rows come first (those that can reach five, then most dated sessions waiting), then unpublished cities by the same rule
(North Easton 32 sessions, Park Ridge 17, Opelika 15, ...). Three cities a night, cities done in the last days go to the back.
Hourly discovery test (2026-10-10/11, PRs #119-#124, `0182`): runs 2-6 all read the same 50 cities, because `runs_per_day` was not passed (the default is 1). The window is now chosen by the workflow's own
run number (`--step=${{ github.run_number }}`), so every start reads the next slice however often cron-job.org calls it; `runs_per_day` is kept as an ignored input so an old request body still works.
Imported from the two distinct windows (nashville..park ridge, pensacola..salem): 44 clubs and 197 dated sessions, all NEEDS_REVIEW; 16 new unpublished cities (those with 5+ dated sessions or an American-stated club:
Nashville GA, Navarre, New Bedford, Newburyport, Newnan, North Easton, Opelika, Palmetto, Panama City, Park Ridge, Portsmouth NH, Queen Creek, Roswell, Round Rock, Rye, Salem AR); the rest stay as leads in `data/inbox`.
Skipped: Oceanside BC (Canada). Saint Louis was filed under the existing St. Louis page.
Discovery fix: the daily window used `dayOfYear * 25 % (page count)`, so the growing page count shifted the windows and the same cities were read two days running; it now uses a fixed span (page count rounded up to 100),
and leads already archived under `data/inbox/discover-*` are skipped (Cumming, Dayton and Cross Roads kept coming back because those cities are not in the database). Troop Mahjong (San Antonio) and Tucson Chinese Cultural Center / Cynthia A. still unconfirmed.

AI nightly roles after the crawlers (2026-10-09): `build-nightly-prompt.mjs` plans a week as 4 nights of **verify** (the crawlers' NEEDS_REVIEW groups, in the cities
closest to publishing, unpublished first: confirm American/NMJL on the group's own pages, quote it, promote to ACTIVE, or mark INACTIVE if another style/closed/members-only),
2 nights of **cities** (new places, directory-crawler leads first, looking outside the platforms the crawlers read) and 1 night of **events** (only groups the crawlers can't read,
labelled in the list). A mode with nothing to do is skipped. `--mode=` forces one.

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
