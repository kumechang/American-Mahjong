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

