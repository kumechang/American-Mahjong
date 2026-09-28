# City Page Content & SEO Policy

This is the policy for city pages (`/cities/[slug]`) as the site scales
from ~9-10 cities to many more. It was written before that scale-up,
specifically so growth doesn't outrun trustworthiness. It complements
`docs/DATA_COLLECTION.md` (how data is researched and verified) and
`docs/VOICE_AND_TONE.md` (how Learn articles are written) — this doc
covers what a city page itself must contain and how it must render.

The core tension named by every reviewer below: **it will always be
faster to publish more, thinner cities than fewer, trustworthy ones.**
Every rule here exists to hold that line. When in doubt, don't publish
yet — a missing city page costs nothing; a hollow or misleading one
costs the site's credibility the first time a reader hits a closed
venue or stale listing.

## 1. Title & meta description

Stop using one fixed template for every city (`American Mahjong in
{City}` for all of them is a duplicate-title signal to Google at
scale). Build title/description from which data types the city
actually has — never claim a category with zero ACTIVE rows:

- Has clubs + events: `American Mahjong in {City}, {State} — {N} Clubs & Events`
- Has clubs only: `American Mahjong in {City}, {State} — {N} Beginner-Friendly Clubs`
- Has instructors only: `American Mahjong Lessons in {City}, {State}`

Meta description follows the same rule — describe only what's ACTIVE:
`{N} beginner-friendly American Mahjong club{s} in {City}, {State}{, plus {M} upcoming events if any}.`
Never say "clubs, lessons, and events" if one of those is empty.

## 2. Every city page needs real, unique content — not just a data list

A city page that's three data-driven lists and nothing else is a
doorway page once there are dozens of them, and it's also just not
useful to a reader. Two required blocks, sourced from the same
research already done for `docs/DATA_COLLECTION.md` (this is
editorial compression of facts already verified, not new research):

**Intro paragraph (60-100 words, required before publish).** Not
scenery or population stats. It should answer, in order: (1) is this a
real, active scene or a sparse one — set honest expectations; (2) is
there a dominant local format (e.g. "most groups here meet at
community centers, not private clubs"); (3) one concrete, specific
detail that couldn't be copy-pasted to another city. A generic "Austin
has a vibrant mahjong scene!" fails both the SEO-uniqueness bar and
the reader-trust bar for the same reason: it's not actually about
Austin.

**"What to expect your first visit" block.** The single highest-value
addition for this audience (primarily women 40+, many total
beginners, often nervous about walking into a stranger's game): do you
need to bring your own set, is it cash-only, do newcomers sit out a
round first. If the city has zero confirmed beginner-lesson listings,
say so directly ("no dedicated beginner class currently confirmed in
{City} — see our Learn section to get started before your first
game") rather than padding the page or silently omitting it.

## 3. Wording policy: informational, not reviewy

`beginner_friendly`, `social_play`, etc. are boolean flags sourced from
a club's own materials during research — not a firsthand visit, not a
review, not the site's own judgment. The copy must never read as an
endorsement the site hasn't earned:

- Filter-chip badges (Beginner Friendly, Social, Free, etc.) stay as
  short labels — that's fine, they're filters on stated facts.
- Anywhere this appears in prose, attribute it to the source: "Listed
  as beginner-friendly by the club — they say newcomers are welcome
  and no experience is required," not "great for beginners."
- Never add star ratings, "best of," "top-rated," or "most welcoming."
  The site hasn't visited these clubs and doesn't get to imply it has.

## 4. Trust and freshness signals

`lastVerifiedAt` and `sourceUrl` already exist on every Club/
Instructor/Event row but currently render nowhere on the page — that's
a rendering gap to close before scaling:

- Every card shows a small metadata line: `Verified {Mon YYYY} ·
  Source` (linking `sourceUrl`).
- At 90+ days past `lastVerifiedAt` (the existing reverification
  cadence from `docs/DATA_COLLECTION.md`), don't silently keep
  rendering it as current and don't hard-pull it either — add a
  visible qualifier: "Details last confirmed {date} — please verify
  before visiting." Reserve actual removal for confirmed `INACTIVE`,
  which the status gate already handles.
- Add a short About/methodology page (linked from every city page
  footer) stating: who runs the site, that listings come from
  primary-source research and are never scraped or fabricated, that
  inclusion means "we confirmed this exists," not "we've played there
  and vouch for it," and how to report an error.

## 5. Listing order: lead with the easiest on-ramp

Don't render clubs/events in alphabetical or database order. Lead with
a single "best next step" for a total beginner, then show everything
else below in a clearly separate "All clubs & events" section.
Priority for that top slot: (a) a beginner-friendly lesson happening
within 7 days > (b) a beginner-friendly, free/low-cost open play
within 7 days > (c) any beginner-friendly listing regardless of date.
This trades a little editorializing for solving the actual reason a
nervous first-timer closes the tab: being handed 9 undifferentiated
options with no idea how to weigh them.

## 6. Heading structure

Single `<h1>`: `American Mahjong in {City}, {State}`. Fixed `<h2>`
order, each rendered only if its data exists — never an empty section
with "no results" text: `Getting Started in {City}` → `Clubs &
Lessons in {City}` → `Upcoming Events in {City}` → `Nearby Cities`.
Individual club/instructor/event names are `<h3>`. If a card ever gets
its own sub-details, those are `<h4>`, never a second `<h3>` tier
disguised as bold text.

## 7. Internal linking

- ≥2 contextual links per city page into the Learn section (e.g. link
  "the Charleston" in the intro to `/learn/charleston`), not one
  generic footer link.
- ≥2 links to nearby published cities ("Nearby Cities" section).
- **Publish minimum:** don't publish an isolated new city with no
  nearby published cities to link to — either hold it until 2-3 cities
  in that region are ready, or launch as a batch. An isolated page
  with no internal links in or out is the clearest doorway-page
  signal there is.

## 8. JSON-LD

Current implementation (BreadcrumbList, `["SportsActivityLocation",
"LocalBusiness"]` per club, `Event` per event) is solid. Additions:

- Add `openingHoursSpecification` to LocalBusiness where known.
- Add `organizer` (the club) to Event entries, and `image` where
  available — Search Console often suppresses Event rich results for
  missing `image`.
- Add `ItemList` wrapping the club listing once there's real payoff
  (helps list-page eligibility).
- Do **not** add `FAQPage` with boilerplate 2-question FAQs purely for
  the schema — only once a page has a real FAQ (3+ genuine questions).
  Do **not** add `Review`/`AggregateRating` without real, sourced
  ratings — fabricated rating schema is a manual-action risk.

## 9. URL/slug

Current `/cities/{city-slug}` pattern is sound short-term, but
`{city}-{state-abbr}` (e.g. `/cities/austin-tx`) should be adopted
**before** two same-named cities in different states exist — retrofitting
later means redirects. This needs a deliberate decision + migration
before the next batch of cities, not a silent change to already-live
URLs (they're indexed and linked from the sitemap).

## 10. Accessibility (applies to the shared template, so a gap here multiplies across every city)

- Verify every text/background color pair used in the template against
  a contrast checker (WebAIM or browser DevTools) in both light and
  dark mode — once per pairing, not per city. `zinc-400` on
  `zinc-900`/black is the likely failure point for dark-mode secondary
  text (check `text-sm`/`text-xs` badge and filter-pill text
  specifically); `zinc-600` on white and white-on-`emerald-700` are
  lower risk but still worth a one-time check, including hover/unpressed
  button states.
- `ClubFilterList`'s filter buttons need `role="group"` with an
  accessible label (not just `aria-pressed` on each button), plus a
  visually-hidden `aria-live="polite"` region announcing the result
  count on every filter change, since filtering changes visible
  content without a page navigation.
- No link text is ever "click here," "read more," or a bare URL.
  Repeated-pattern links (club website, city cross-links) must include
  the entity/destination name in the accessible text — e.g. "Visit
  {club.name}'s website," "Clubs in {city}" — fixed once at the
  template/component level, inherited by every generated page.
- If club/instructor photos are added later, require a non-empty
  `alt_text` field in the CSV pipeline now (`docs/DATA_COLLECTION.md`)
  so it's structurally required, not retrofitted. Decorative images
  get explicit `alt=""`, never an omitted attribute.
- Run an automated scanner (e.g. axe DevTools) against one generated
  city page before the template is duplicated across all cities.

## 11. Publish checklist

Data-verification items (status, source, 90-day cadence) are already
covered in `docs/DATA_COLLECTION.md`. This is the additional bar
before a new city goes live:

- [ ] Title/description reflect only data types actually present
- [ ] Unique 60-100 word intro with a real, city-specific fact
- [ ] "What to expect your first visit" block present (or an honest
      gap disclosure if there's nothing beginner-accessible yet)
- [ ] Beginner-friendliness wording is attributed to the source, not
      phrased as the site's own endorsement
- [ ] Every card shows a "last verified" date and source link
- [ ] Listing order leads with the single best beginner on-ramp
- [ ] H1/H2/H3 structure matches policy order
- [ ] ≥2 contextual links to Learn articles
- [ ] ≥2 links to nearby published cities (or held for batch launch)
- [ ] JSON-LD validates; no fabricated ratings or boilerplate FAQ
- [ ] **≥5 ACTIVE listings, or don't publish yet** — a thin city
      (2-3 unverified-feeling listings) should wait, same as Phoenix
      was held back per the 2026-09-28 note in `DATA_COLLECTION.md`,
      rather than shipping just to grow the city count
