# Crawler know-how

What we learned building and running the collection pipeline (October 2026). Read this before changing a
crawler, adding a source, or debugging a bad import. `docs/PROJECT_STATUS.md` has the current state; this file
has the reasons behind it.

## 1. The pipeline in one picture

```
cron-job.org ──workflow_dispatch──▶ crawl-events.yml      ─▶ inbox/crawl-…     (events.csv, gone.json, report.md per city)
             ──workflow_dispatch──▶ discover-clubs.yml    ─▶ inbox/discover-…   (clubs.csv / instructors.csv / events.csv)
             ──workflow_dispatch──▶ nightly-research.yml  ─▶ AI server pushes inbox/2026-…  (a person reviews these)
                                         │
crawl / discover finish ──────────────▶ auto-import.yml ─▶ migrations/NNNN_auto_<stamp>.sql ─▶ PR ─▶ squash-merge ─▶ deploy
```

- Nothing the crawlers do touches the database directly. They write CSV, a script turns CSV into a numbered
  migration, and the migration is applied at deploy (`cf:deploy` runs `wrangler d1 migrations apply DB --remote`).
- GitHub's own `schedule` is unreliable (late, doubled), so cron-job.org triggers `workflow_dispatch`. It needs a
  `User-Agent` header, or GitHub answers 403.
- `scripts/lib/crawl-lib.mjs` holds every reader; `scripts/crawl-events.mjs`, `discover-clubs.mjs`,
  `discover-bambuddies.mjs`, `discover-eventbrite.mjs` are thin drivers; `scripts/auto-import.mjs` is the importer;
  `scripts/build-nightly-prompt.mjs` plans the AI's night.

## 2. Politeness and identity (non-negotiable)

- Honest User-Agent: `MahjongMapBot/1.0 (+https://mahjong-map.com/about)`. The headless browser uses the same string
  without the `Mozilla/5.0 (compatible; …)` prefix, because some firewalls (tucsonjcc.org returned 403) block that prefix
  outright while accepting the plain bot string.
- One request per second per host (all `*.bamgoodtime.com` share one queue). A page cap per run (`MAX_PAGES = 1500`).
- `get()` retries 429/5xx/timeouts twice (2 s, 5 s); 403/404/405 are final.
- Never disable TLS verification. If a sandbox re-signs TLS, trust that one CA by its key hash (section 9).
- Teachers' own sites are read only through structured data (JSON-LD, calendar feeds), never scraped as free text.

## 3. Readers (what each source type gives and where it breaks)

| Kind | Source | Notes |
|---|---|---|
| `bgt` | Bam Good Time club sites (`<club>.bamgoodtime.com/events`) | Most common. Each event is linked twice on the page: dedupe by event URL. The location is the **last line before the price**; filter bullets, "spots left", "Register Externally". Skip events whose lines say home/residence/private house. Skip cancelled/postponed. A club with no listings is normal ("0 events parsed" in the notes is not a failure). |
| `bookwhen` | bookwhen.com account pages | Complete listing. |
| `ebrite` | Eventbrite organiser/collection pages (`__NEXT_DATA__`) | Found via an organiser link in an event page's JSON-LD. |
| `calendly`, `linktree`, `meetup` | Link-in-bio and group pages | Best effort. |
| `jsonld` | Any own site, JSON-LD `Event` | Follows up to 3 "events/calendar/schedule/class" sub-pages and a linked `.ics`. Skips UTC (`…Z`) timestamps (local time cannot be recovered). |
| `browser` | Sites that render their schedule with JavaScript | Headless Chromium via `playwright-core`; reads JSON-LD first, then dated text blocks (`datedTextEvents`: title / date or range / time / weekdays, ranges expanded by weekday). Configured in `data/browser-sources.json`. |
| `calendar` | Squarespace-style calendar widget | `widgetEvents`: "Oct" "13" title "Tuesday, October 13, 2026" "6:00 PM" venue … "View Event →". `all: true` when the organiser only does mahjong; `include: "^OKC:"` when one organiser covers several cities. |
| `ics` | iCalendar feeds | TZID / `X-WR-TIMEZONE` become local times; all-day and cancelled entries skipped; weekly RRULE expanded inside the crawl window; any other recurrence is skipped (and the feed is then **not** treated as complete). |

Also: BamBuddies directory pages (`bambuddies.org/mahjong-near-me/<metro>-<st>`) are the only American-only directory
we found. They give names, area, a schedule sentence and often a street address, but **no website**, so every row is a
lead (NEEDS_REVIEW, no URL). `orderofthetile.com`, `mahjong4friends.com` and `bambuddies.org`'s home page are games/apps,
not directories.

### What did not work
- Reading dated text from the plain HTML of ordinary own sites: almost all junk ("Taco Tuesday", "$40.00 pp/per session"
  read as a title). Dated-text reading is only safe on pages a person has listed in `browser-sources.json`.
- Eventbrite search pages with plain HTTP: AWS WAF answers **405** (curl with the same headers passes, Node `fetch` does not;
  it is a TLS-fingerprint check). A real browser passes. `discover-eventbrite.mjs` falls back to Chromium (see §12).
- Instagram-only owners (about a hundred) are not machine-readable. They need outreach or a person.

## 4. Quality rules (why rows are ACTIVE or NEEDS_REVIEW)

A row becomes ACTIVE only with all of:
1. an owner that is already ACTIVE on the site;
2. a start time and a named business venue (street-address-only venues were accepted by decision, once an address search showed a business);
3. American/NMJL wording on the owner's page, or an ACTIVE owner whose page already confirmed it;
4. a price that is numeric and between $1 and $600 (a JSON-LD price of 3690 was cents). Multi-session series carry the price on the first session only;
5. no private-home signals: "Private Residence", "…'s Home", `home|residence` in the location lines, or an address on `data/venue-denylist.txt`;
6. no state mismatch between the venue text and the row, and no clash between a title saying "Evening"/"Night" and a start before noon (or "Morning" at 5 pm or later). Real example: Mahj Atelier "Evening Mahj 101" is listed at 6:30 **AM** on its own page.

Other rules learned the hard way:
- Canada is out of scope (Oceanside BC, Toronto, Summerside PE leads).
- A city is published only with at least 5 ACTIVE rows (clubs + instructors + upcoming events). Events show only if `eventDate >= today`.
- The importer's event key is city name + event name + date (slug `city-name-date`). Two sessions with the same name on the same day need distinct names (append the time, then the club, then a number).
- A club slug includes the city name; renaming a city means deleting the old club/event rows first.
- `ON CONFLICT(slug) DO UPDATE` in `import-csv.mjs` **overwrites**. Anything automatic must skip rows that already exist (the auto-import does).
- "Possibly gone" is only meaningful against a **complete** listing, and only for sessions that came from the same host (a manually added Meetup row must not be retired because the club's BGT page does not list it).
- City names repeat across states (Portsmouth NH/VA): city slugs and ids need the state suffix on collision. "Saint Louis" = "St. Louis".
- A club filed under a different city name (Cross Roads → Little Elm) is invisible to a name check: compare website hosts as well.
- Look at the club's own page before trusting a directory: venues such as a "Painted Pagoda" with no search footprint stay NEEDS_REVIEW.

## 5. Discovery

- `discover-clubs.mjs` reads a rotating slice of Bam Good Time's city pages. Lessons: pass `--step=${{ github.run_number }}` (without it every hourly run read the same window); keep the span fixed (`ceil(n/100)*100`) because the directory grows and would shift every slice; skip leads archived by earlier runs; make same-day event names unique.
- A lead is worth a PR when it is in a city we already cover, or says American/NMJL itself, or has dated sessions. The rest is only named in the summary.
- `discover-bambuddies.mjs` picks the town from the street address tail, then the area, then the metro, and prefers a town already on the site; "Metro …", "Intown", compass words are not towns. Capped at 80 new leads per run; later runs continue because earlier ones are archived under `data/inbox`.
- The nightly prompt builder skips leads whose website host is already in the database, and anything outside the 50 states + DC.

## 6. Auto-import (the morning check, automated)

Details in the header of `scripts/auto-import.mjs` and in `docs/PROJECT_STATUS.md`. Design points worth remembering:
- Eligible inputs are branches `inbox/crawl-*` and `inbox/discover-*` that have an **open** PR and are not yet in `data/inbox/` on main. (Closed PRs are deliberate rejections; the first run picked them up and failed.)
- Safe failure: the importer validates, the migration is applied to the local DB, then **all** migrations are replayed on an empty DB; any failure leaves the inbox PRs open and exits non-zero.
- `GITHUB_TOKEN` pushes do not start other workflows (except `workflow_dispatch`): the workflow dispatches `close-imported-inbox.yml` itself after merging.
- Stage whole directories (`git add -A data migrations`). A pathspec naming a file that does not exist makes the entire `git add` fail, and `|| true` hides it.
- 5-row rule: a city is watched (`data/auto-below.txt`), unpublished after 3 days in a row, republished at 5 only if the script unpublished it (`data/auto-unpublished.txt`). First-time publishing is always a person.
- Not automated: AI research PRs, promoting NEEDS_REVIEW → ACTIVE, publishing new cities, outreach.

## 7. Operating it

- Review every few days: merged "Auto-import" PRs (body = digest), then the NEEDS_REVIEW rows and leads they list.
- Nightly AI plan (`build-nightly-prompt.mjs`): four verify nights, two city nights, one event night per week. The verify queue puts at-risk published cities first, then cities that can reach five, then by dated pending sessions.
- Repeats are prevented in three ways (`build-nightly-prompt.mjs`): (1) cities in `data/inbox/<date-time>/` of the last 3 days go to the back of the line, and the nightly workflow also loads the folders of AI PRs that are still open (before this, nothing counted until the PR was merged, so the same cities came back every night); (2) a city whose run left only a report and no CSV rests for 14 days (`cooldown`), and a later CSV ends the rest; (3) a NEEDS_REVIEW owner whose only page is a Bam Good Time site with no dated sessions and no American wording is not sent to the AI at all: it is printed as an "outreach candidate" in the run summary.
- The AI server is for judgment (is it American, is the venue a business, is the date real). Everything deterministic belongs in a crawler.
- Frequencies: events and discovery are cheap, run them often; the AI costs tokens, keep it to once a night.
- Open items: `NEXT_PUBLIC_CONTACT_EMAIL` unset; New Orleans and St. Louis sit at four rows (inquiry drafts in `docs/outreach/`); about 66 unpublished cities wait for American wording or a business venue.

## 8. Adding a source

1. Check the page with `curl -A 'MahjongMapBot/1.0 (+https://mahjong-map.com/about)'`. If the schedule is in the HTML, use `jsonld` or a platform reader; if it needs JavaScript, use `browser`; if it is a calendar widget, `calendar`; if there is an `.ics`, `ics`.
2. For `browser`/`calendar`/`ics`, add an entry to `data/browser-sources.json` (`owner` = exact club or instructor name in the DB, `urls`, optional `all`, `include`).
3. Test: `node scripts/crawl-events.mjs --only=calendar --out-dir=<scratch>` (needs the local DB: `npx wrangler d1 migrations apply DB --local`).
4. Look at the venue, time and price of every row before trusting a new reader. Check that a second run finds nothing new, and that renaming one DB event name produces a "Possibly gone" note.

## 9. Local testing in the sandbox

- Rebuild the local DB after editing any applied migration: `rm -rf .wrangler/state && npx wrangler d1 migrations apply DB --local`.
- The sandbox's egress proxy re-signs TLS and Chromium does not trust its CA. For local runs only:
  `CA_SPKI=$(openssl x509 -in /root/.ccr/agent-proxy-ca.crt -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64)`,
  `PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, `PW_PROXY=$HTTPS_PROXY`. Never disable verification in code.
- Chromium in GitHub Actions: `npx playwright-core install --with-deps chromium` (a workflow step).
- Query the local DB directly with Python's `sqlite3` on `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite` (the other file there, `metadata.sqlite`, has no tables).
- Test the auto-import on a copy: move the migration you are reproducing out of `migrations/`, rebuild the DB, run `node scripts/auto-import.mjs --dirs=<ids>`, compare with the hand-made migration, then delete the generated `migrations/*_auto_*.sql`, `data/auto-below.txt`, `data/auto-unpublished.txt`.
- `pkill` can exit 144 in this shell: run it as its own command.

## 10. Mistakes worth not repeating

| What happened | Fix |
|---|---|
| Hourly discovery PRs all read the same window | pass `--step=run_number`; closed the duplicate PRs |
| Venue "•", the club name, or "Private Residence" as the location | take the last candidate line before the price; home filter |
| Home addresses published in a listing (Bend, Layton, Friendswood, Angleton, Queen Creek, Truckee) | denylist + name/location filters; leave NEEDS_REVIEW |
| Country/city mismatches (Oceanside BC, Belmont events filed in Chatham, Mid-Missouri in Blue Springs, Liberty = Kansas City duplicate) | check the owner's own page before importing |
| Old NEEDS_REVIEW rows blocked renamed events | delete them in the migration before the new import |
| Editing an applied migration | rebuild the local DB |
| Auto-import run 1 imported branches whose PRs were closed on purpose | only branches with an open PR |
| Auto-import run 1 failed: new city slug collided with another state's city | state suffix on collision |
| Auto-import run 2 failed: `git add` of a missing file | stage directories |

## 11. Covering more cities (2026-10-27)

Goal: every place that has American mahjong. The levers, in order of cost:
1. **Leads from directories** (no AI, daily): `discover-clubs.yml` also runs `discover-bambuddies.mjs` (BamBuddies, 81 metros) and `discover-mahjong4friends.mjs` (teachers by state: name, business, town, website, a self-written note; phone, email and Instagram are never read). Rows are NEEDS_REVIEW leads. `auto-import.mjs` attaches leads only to cities already on the site (`bb-` and `m4f-` folders); leads for other towns stay in `data/inbox` and feed the nightly "new places" queue (a Mahjong 4 Friends note that says NMJL/American, or a BamBuddies listing, counts as a hint).
2. **Promotion from the owner's own page** (no AI, twice a day): `verify-owners.mjs` reads a rotating slice of NEEDS_REVIEW clubs and teachers that have a readable own site (home page plus up to three about/class/lesson/play/event pages) and proposes ACTIVE when a line in their own words says American mahjong / NMJL. It skips Bam Good Time boilerplate, "Black American" communities, pages mostly about another style, and anything in `data/promote-skip.txt` (private homes, wrong metro, residents-only groups: **add held-back owners there**). `auto-import.mjs` turns proposals into `UPDATE … ACTIVE` (max 40 owners per run) and also activates that owner's upcoming sessions that have a start time and a place a visitor can go to (`venueOk`: not a town, not "Free (donations welcome)", not a house, not a cruise ship).
3. **Ready-to-publish list**: the Auto-import digest names unpublished cities with five or more active rows. A person writes the intro (60–100 words, no counts or dates, beginner-friendly last sentence) and publishes; the script never publishes a city for the first time.
4. **AI nights**: 3 verify, 3 "new places" (3 places each), 1 events per week. This is the token cost lever.
First run (verify-owners over all 267 readable owners): 50 proposals, 49 kept (Belmont's club was dropped: its sessions are held in Chatham), eight cities became publishable.
`venueOk` also protects the event crawler: an ACTIVE owner's session only goes ACTIVE with a venue that passes it.

## 12. Eventbrite discovery (checked 2026-10-27)

`discover-eventbrite.mjs` is the fourth step of `discover-clubs.yml` (Chromium is installed there; `--batch=20 --max=50`, a failure there is only a warning).
- **Nationwide search (added 2026-10-27, the part that finds new towns)**: `eventbrite.com/d/united-states/<keyword>/?page=N` returns 20 events per page and stops around page 30 for "mahjong" (≈600 events, ≈280 towns, ≈225 of them not on the site, ≈60 with American/NMJL in the event text). One keyword per run, rotating (mahjong, mah-jongg, mahjong, nmjl). `american-mahjong` overlaps `mahjong` almost entirely (5 extra towns), `mah-jongg` adds ~8, `nmjl` ~2. **A state search (`/d/tx--texas/mahjong/`) is shallow** (≈50 events; Florida returned nothing) and mostly a subset of the nationwide list: do not build on it. In a town not on the site an event is kept only when its own text says American / NMJL. A test run (31 national pages + 3 city searches + 30 event pages) gave 30 events in 28 new towns, e.g. Champaign IL ("American Mahjong 101"), Naperville, Green Bay, Winter Park.
- Per-city flow: Chromium opens the Eventbrite search page for a city → JSON-LD `ItemList` gives event URLs → each event page's JSON-LD gives start time, price, venue and organiser (name + organiser URL). Events without a start time are dropped; times were checked by hand against the pages.
- The city is the **event's own town** (an Oakland event is not filed under the searched suburb). Output: `eb-<city>-<st>/events.csv` (NEEDS_REVIEW, `club_name` = organiser) and `clubs.csv` (the organiser as a NEEDS_REVIEW lead, website = its Eventbrite page, description says whether the event text mentions American / NMJL).
- `auto-import.mjs`: `eb-` leads attach to cities on the site; for a town not on the site they create a (unpublished) city only when the event text mentions American / NMJL. Events never go ACTIVE by themselves (the organiser is NEEDS_REVIEW).
- Eventbrite hosts are in `verify-owners.mjs`'s DIRECTORY list, so organisers are not promoted from their Eventbrite page. They need their own site (nightly research / outreach).
- Per-city yield is small (first check: 8 events in 3 Bay Area towns from 6 searches); most hits are social nights that are not clearly American. Each nationwide run can create ~25 unpublished cities (one NEEDS_REVIEW lead each); watch the city list growth, since per-city Eventbrite searches and the nightly queue cover every city on the site.
- Shops with "Home" in the name ("Wild Iris Home", "Blush Home Decor") are dropped by the private-home filter: a known false positive, deliberately conservative.

## 13. Hand verification notes (2026-10-27)
- A "verify" night can be done by hand: `build-nightly-prompt.mjs --mode=verify` lists the cities; read each owner's own site (JS sites need `render()`; a Wix/Squarespace home page often hides the real pages behind links such as /learn, /play, /events).
- `verify-owners.mjs` false positive: a shop selling "American Mahjong Tile Sets" (314mahjong.com) matches the American regex. Check that the owner teaches or hosts play before promoting.
- A BGT page that says nothing about the style can still have an own site (COMO Mahjong: comomahjong.com says "Columbia's home for American Mahjong"). `promote-skip` entries from a first pass should be re-checked when a city is stuck.
- Duplicate listings of one business (instructor + club, e.g. Crystal Clear Mahj / The Social Parlor in Bryant, 2 Bam Loaves = Mid MO Mahjong in Columbia MO) stay as one ACTIVE row.
- Directory-only leads (BamBuddies, no own site) remain NEEDS_REVIEW: the directory is a lead, not a source.
- **Eventbrite blocks GitHub runners (checked 2026-10-27).** From a runner the nationwide page comes back as a ~10 KB challenge page with no listing, both over plain HTTP and in Chromium, so the Actions step finds nothing (it now says so in the summary and stops early). The same script works from other networks (it found 30 events in 28 new towns from the dev sandbox). To use it: run it from a network Eventbrite accepts (a self-hosted runner, the research server, or by hand), then push the result as an `inbox/discover-eb-<stamp>` branch with a PR; `auto-import.yml` picks it up like any discover folder. Do not spoof a browser User-Agent to get around the block.

## 14. Verifying Eventbrite organisers by hand (2026-10-27)
- 123 organisers came out of the nationwide search. Reading each one's first event page (JSON-LD description + visible text) showed 95 whose own words say American mahjong / NMJL / "National Mah Jongg League"; 28 never say it (a bookshop open play, "Mahjong on the Mezzanine", a hospital, a church ...): those stay NEEDS_REVIEW. Watch for false hits: "American Main Dishes" on a cafe page matches a loose `american` regex; use `american[\s-]*(style )?mah|nmjl|national mah`.
- Left NEEDS_REVIEW on purpose: members-only clubs (country clubs, timeshare resorts), survivor-only groups, one-off student fundraisers, a page whose FAQ talks about Taiwanese / Hong Kong play.
- Promoted organisers become ACTIVE "clubs" together with their dated sessions at public venues (`venueOk`); an organiser with no attendable session is not promoted. The description quotes the organiser's own sentence and says its own website has not been checked. 57 organisers, 78 sessions on the first pass.
- `venueOk` no longer treats "Coffee House", "Tea House", "Opera House" ... as someone's house.
- Result: five towns reached five active rows with this pass and were published with intros (Haymarket VA, New York, Orlando, Albany, Johns Creek); Champaign IL (two venue-hosted series) was held back as thin.

## 15. Neighbouring-town searches (2026-10-27)
- `node scripts/discover-eventbrite.mjs --neighbors=40 --step=N [--radius=25] [--min-rows=6]` searches Eventbrite for towns around the cities that already have the most mahjong (`scripts/lib/neighbors.mjs`: Census place gazetteer for coordinates + Census population estimates, towns of 8,000+ people within 25 miles of a city with 6+ active rows, nearest and biggest first; 1,092 candidates at the time). Like the nationwide pass it needs a network Eventbrite accepts (not GitHub runners); not wired into a workflow.
- **What it gives: depth in big metros, not new towns.** An Eventbrite search for a suburb returns the whole metro's events, so 40 neighbour searches (about 12 minutes) gave 38 new sessions from 32 new organisers, all in cities already on the site (New York, Los Angeles, Miami, Washington, Houston, Gainesville VA ...) and no new city. 12 of the 36 organisers had American/NMJL in their own listing and were promoted (0242). New towns come from the nationwide pass (§12).
- Bam Good Time needs no neighbour step: `discover-clubs.mjs` already walks the whole `bamgoodtime.com/mahjong-clubs` index (every city page, a few dozen per run).
- Running the importer twice: `auto-import.mjs` also applies what it generates to the local DB, so a second dry run of the same folder says "already on the site: N". Rebuild the local DB (`rm -rf .wrangler/state && npx wrangler d1 migrations apply DB --local`) and delete the stray `migrations/NNNN_auto_*.sql` first.

## 16. First Chrome-assisted pass (2026-10-28)
- Prompt `docs/browser-prompts/01-directory-leads.md` (batch 1: Milwaukee, Jacksonville, Birmingham, 32 leads) was run in a chat that drives a real Chrome. Of 32 leads it confirmed 7 ACTIVE with own-page quotes (3 clubs with dated sessions, 1 city rec-class listing, 2 instructors with American wording on their own site or Facebook page, and a venue-hosted series), left 21 UNCONFIRMED (Instagram/Facebook pages without the word, JS-only pages it could not read, individuals' pages it rightly skipped) and found 2 NEW rows.
- Lesson: the window did not see our database, so 2 of its ACTIVE answers and both NEW rows were **duplicates of rows already ACTIVE under another name** (O'Neal Library meetup, Mahjong Social Club Jax / Grazing Parlor, MKE Mahjong / Julie Littman, Whole Foods, Levite JCC). Before importing a CSV, match each `name_exact` against existing ACTIVE rows in the same city (same venue / same website) and retire the lead as INACTIVE instead of promoting it (0245 does this).
- A restaurant that hosts a travelling club's series (Grazing Parlor / Mahjong Social Club Jax) is a venue, not a club: file the sessions under the club.
- Result: Birmingham (16 active rows), Jacksonville (6) and Milwaukee (5) published.

## 17. AI inbox review notes (2026-10-29)
- Held back on purpose, although the AI sent them as ACTIVE: **Mahjong for a Cause (Friendswood TX)**. Its booking page says "Complete all 72 hands on the 2026 NMJL Card", but the venue was a private-looking address (504 Lakeside Ln) until a recent move to "Hall's Hall", 906 Anna Lane; a person must confirm Hall's Hall is a commercial or community space before it is published. **The Mahjmont Society (Belmont MA)**: only "American Mahjong" in the site tagline, sessions at Oakley Country Club (Watertown, a private club) or on Cape Cod, so the city assignment and public access are doubtful.
- Reports only (nothing imported): Billings MT (Montana Mahj: the article says American, the club's own pages do not; part of the house is members-only), Louisville (Keneseth Israel weekly Thursday game is public but never says American), Mountain Home AR, Downers Grove, Lincolnton GA, Jacksonville (Del Webb: residents only), Sarasota, Johns Creek / Johns Island / Orlando / Portsmouth.
- Leads worth a Chrome-assisted look: Johns Creek city "Mahjong Mondays" (Northeast Spruill Oaks Library, Mondays 1-3 pm, American), Holland Center "Beginner Guided Open Play - American Mah Jongg", Ellora Mahjong (Orlando), Diversions Puzzles & Games (Portsmouth NH, American-style 3-week course).

## 18. ingest-inbox failures (2026-10-30)
- A red `ingest-inbox` run is normally the validator doing its job: the last step fails when `scripts/validate-csv.mjs` finds an ERROR in a CSV the research server pushed. Read the PR comment the run posted. Example: `inbox/2026-10-29-2103` had `clubs.csv` rows with 20 fields instead of 21 (one of `free` / `price` missing), so every later field was shifted. Fix the row when importing (the importer would have rejected it), do not edit the server's branch.
- The server pushes its files one at a time, so one branch used to trigger five runs, the first ones on a half-finished branch ("No CSV folders found", a `clubs.csv` without its `events.csv`), each with its own PR comment. The workflow now has a `concurrency` group per branch with `cancel-in-progress`, so only the newest push is validated.
- When a lead already exists as a NEEDS_REVIEW row (here `sotrudles mahjong`, found earlier by the Eventbrite neighbour search), promote that row with the new evidence instead of inserting a second club.

## 19. AI inbox review 2026-10-30 (#301, #302, #303, #306, #308)
- All five were reports only (Angleton, Carlsbad, Queen Creek, Cherokee Village, Cherry Hill, Newnan, Myrtle Beach, Simpsonville, Wilmington MA, Daphne, Moreland, Truckee, Fort Worth, Mont Belvieu, New Orleans). Almost every "not confirmed" is a Bam Good Time page that never states the rules: these owners need a contact or an own site, which the Chrome-assisted prompt (docs/browser-prompts) is for.
- One was worth finishing by hand: **Coastal Carolina Mahjong (Myrtle Beach)**. The AI could not see the club's own site said "American Mahjong"; a browser read of coastalcarolinamahjong.com did, and the booking page names Myrtle Beach and Monday 6:00-8:30 PM nights at Factory by Beer Tree. The crawler had stored those sessions without a start time (the title carried it nowhere); 0252 sets 18:00-20:30 and publishes Myrtle Beach (club + 5 sessions).
- Held for the Chrome pass: Mahj Marine (New Orleans, The Rink, Prytania St), The Mahjong Exchange (Angleton), Peachtree Mahjong Club / Open Hand Mahjong (Newnan), Mahjong at Deena's (Solana Beach / Carlsbad). The Angleton and Queen Creek venues look like private homes and stay in `data/promote-skip.txt`.

## 20. Chrome-assisted pass, batch 3 (2026-10-30)
- 39 rows (35 Bam Good Time owners + 4 new leads): the window answered ACTIVE for 26. After checking each quote against the rule, 15 were promoted (Montana Mahj, Spring River, The Hearth, Bams and Bubbles 251, Mahj-On Society (Mont Belvieu), Jaded Dragon, Southern Specialty, Palmetto Mahj, Two Bamboo, Moon River, Tiles With Trish, Mid-Atlantic Mahjong, Two Dot Mahjongg, plus new Johns Creek Mahjong Mondays and Diversions Puzzles & Games). Held back although answered ACTIVE: MahjMarine and Mahj Mahal ("the card" only), Bird Bam Cheers (matched to Cherry Hill by name only), Ellora Mahjong (tile-set shop, no wording on the event pages), Delmarva (no venue), Holland Center (Arizona, not Johns Creek GA). Vickie Charm's is a private members' club: INACTIVE. Crak Bam Co Winter Garden duplicated the ACTIVE Windermere row: INACTIVE.
- Facebook / Instagram quotes were accepted when they are the organisation's own page text, but the window could not always open the full post: those clubs (Jaded Dragon, Spring River) carry the quote as stated and should be re-read when a person next looks.
- Promoting a club also activates its existing dated sessions that have a start time and a `venueOk` venue (Billings: 6 of 14, the rest lack a time or a place). Billings reached 7 active rows and was published.

## 21. Facebook / Instagram pass 1 (2026-10-31)
- Prompt `docs/browser-prompts/06-facebook-instagram.md` was run in a Chrome window logged into the owner's Facebook and Instagram (read only). Of 19 rows it confirmed 7 and **retracted one earlier promotion**: the Jaded Dragon quote had come from a search snippet and was not on the page, so the club went back to NEEDS_REVIEW. Lesson: quotes taken from a search-engine snippet of a social page are not evidence until a window has read the post itself.
- Accepted: The Mahjmont Society ("We are an American Mahjong collective ...", Thursday 7-9 PM at Oakley Country Club, public QR reservation, $25), Mahjong at Deena's ("Learn to do the Joker swap in American Mahjong!"), Bird Bam Cheers (own site NMJL; South Jersey, Merchantville venue), Delmarva Mahjong Club (club only, no venue), Tiles With Trish (6464 Hampton Blvd is Water's Edge Winery and Bistro), Spring River (current About wording), plus a new row found on the way: Jewish Federation of Sarasota-Manatee Mah Jongg 101 ("introduction to American Mah Jongg", NMJL cards required).
- Not accepted: hashtag-only evidence (KS Tile Society, MahjMarine), tile-set shop pages (Ellora), pages without wording (Open Hand, Oak Mtn Mahj, Bird Bam Besties, Mahj Mahal), a private Instagram (Sarasota Mahjong Club). Mahjong for a Cause (Friendswood) states "Complete all 72 hands on the 2026 NMJL Card" but nobody has settled whether Hall's Hall (906 Anna Lane) is a public venue, so it stays held.
- Published: Carlsbad (club + 13 sessions) and Sarasota. Belmont (8 active rows, all one club at a country club on the Watertown line) and Cherry Hill (sessions are in Merchantville) have enough rows but were left unpublished until a person decides the city assignment.
- Owner decision 2026-10-31: Belmont and Cherry Hill are published even though their sessions are at a country club on the Watertown line and in Merchantville (migration `*_publish_belmont_cherry_hill`). Friendswood stays held until Hall's Hall is confirmed as a public venue.

## 22. Production incident: /cities returned 500 at 101 published cities (2026-10-31)
- Cause: `getCityCounts` filtered its three grouped queries with `IN (<every published city id>)`. D1 allows at most 100 bound variables per statement, so the day the 101st city was published (Belmont and Cherry Hill, migration `*_publish_belmont_cherry_hill`) `/cities` failed with `D1_ERROR: too many SQL variables`. The home page and city pages were unaffected.
- Fix: no `IN` list; the queries group every city and the code keeps the ones asked for. **Rule: never bind a list of ids that grows with the data into one D1 statement** (100 variables); check any new `inArray(...)` against the number of published cities, events and clubs.

## 23. Facebook / Instagram pass 2 (2026-11-01)
- 18 rows read in the logged-in window: 1 new ACTIVE instructor (904 Mahj, quote from its open-play announcement), 1 new club found while checking (Mah Jong Social Club, Mountain Home AR: "Official Standard Hands and Rules of the National Mah Jongg League, Inc."), 2 duplicates retired (MKE Mahjong Social Group = MKE Mahjong, whose Nov 10 American Mahj 101 at The Ruby Tap was added; Mahjong IRL instructor = the Cleveland club), 1 session added, 14 UNCONFIRMED.
- Most Instagram profiles of instructors carry only "Mahjong lessons. Parties." or a hashtag (#AmericanMahjong); the window rightly kept those UNCONFIRMED. Hashtag-only and tile-shop wording are not accepted.
- Held with an NMJL mention but no tie to our row: Nicolet Recreation Department Mah Jongg 101 (Glendale WI; dates in the past, instructor link is third-party), Birdie Blue Mahj (Marietta area; class on 11-04, location unconfirmed), Palmetto Mahjong Social ("American Mahjong Enthusiast & Host" bio, Simpsonville; not shown to host the Grand Holland beginners night).

## 24. Towns that are not on the site yet (2026-11-01)
- `docs/CITY_COVERAGE.md` lists 346 US towns that have crawler leads but no row in the database (the discover runs archive leads for towns we do not have; `auto-import` only creates a city from a lead when the folder is not a directory lead). Florida east coast was taken first: seven new unpublished cities (Boca Raton, Delray Beach, Boynton Beach, Palm Beach Gardens, Jupiter, Lake Worth, The Villages) with 31 NEEDS_REVIEW leads, created by running `auto-import.mjs` on a curated folder (`data/inbox/curated-fl-east-20261101`, copied from the archived discover folders and de-duplicated against names already on the site). To add more towns the same way: copy their `clubs.csv` / `instructors.csv` rows into a `data/inbox/curated-<name>/<town>-<st>/` folder and run `node scripts/auto-import.mjs --dirs=curated-<name>`.
- The private-home filter reads "Home Collection" in a shop name as a home (a known false positive); such leads have to be added by hand.
- The Villages is a large age-restricted community: its recreation classes may be residents-only, so check before publishing (prompt `docs/browser-prompts/08-florida-east-coast.md`).
- Watch list printed by the importer: Wyckoff NJ, Newburyport MA, Bryant AR, Centennial CO, Knoxville TN are published cities now under five active rows (dated sessions have passed); they will be unpublished by the importer after three days unless new sessions are added.


## 25. Florida east coast pass (2026-11-01)
- Prompt `docs/browser-prompts/08-florida-east-coast.md` covered the 31 leads in the seven new towns. Promoted: Levis JCC Mah Jongg lessons (Boca Raton; "students are required to bring a 2026 National Mah Jongg card"; 5 lesson sessions), Mahj on the Beach (instructor; museum sessions already sit under West Palm Beach), The Villages Mah Jongg 101 ("Learn to play American Mah Jongg"; non-residents allowed but every section is full, so no sessions), and a new club found on the way, Palm Beach Mahjong (Palm Beach Gardens, 5 sessions). Temple Beth El Mah Jongg Day circle was retired (INACTIVE).
- Held: School of American Mah Jongg (online only), Robin Tartarkin, Four Sparrows; the rest stayed UNCONFIRMED.
- Published: Boca Raton and Palm Beach Gardens. The Villages stays unpublished (one active row and nothing bookable).
