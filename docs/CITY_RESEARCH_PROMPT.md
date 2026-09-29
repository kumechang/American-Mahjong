# City Research Prompt

Copy the block below to have another AI session (or yourself) research
and prepare data for a new city on American Mahjong Guide. It captures
the exact method used for Seattle, Denver, Philadelphia, and Atlanta.

---

## Prompt

You are researching real American Mahjong (NMJL-rules) clubs,
instructors, and events in **{CITY}, {STATE}** for
"American Mahjong Guide" (mahjong-map.com), a directory site. Follow
this process exactly.

### Scope — read this first

- This site is **American Mahjong only** (National Mah Jongg League /
  NMJL rules — the US variant played with a yearly card and jokers).
  It is **not** Chinese/Hong Kong Mahjong, Riichi/Japanese Mahjong,
  Zung Jung, MCR, Taiwanese, or Filipino Mahjong.
- Many real venues/clubs teach or host *other* variants under a
  generic "Mahjong" name. Before including anything, confirm from its
  own website/listing that it is specifically American/NMJL. If a
  venue explicitly states it teaches Hong Kong/Riichi/other styles and
  only offers "table reservations" or incidental access for American
  play, **exclude it** — don't include a source just because it has
  "Mahjong" in the name.
- If you cannot confirm the variant, **leave it out** rather than
  guessing. Omission is always safer than a wrong inclusion.

### Research steps

1. Web search for: `American Mahjong club {CITY} {STATE} lessons open play beginner NMJL` and `American Mahjong instructor {CITY} {STATE} lessons NMJL`.
2. For every promising result (clubs, instructors, JCCs/synagogues,
   community/senior centers, dedicated mahjong studios, Eventbrite/
   Meetup groups), fetch the actual page and extract:
   - Name, address (if any fixed venue), website, phone, email
   - Schedule (days/times), whether it's drop-in or registration-required
   - Price (be specific — note if it's a flat fee, per-person, or a
     range; don't average or guess a number that isn't stated)
   - Whether it's explicitly beginner-friendly (quote the site's own
     wording where possible — don't infer this from vibe alone)
   - Confirmation it's American/NMJL specifically
3. Search for one or two real **upcoming events** (dated after today)
   if any exist — a tournament, a specific open-play date, a beginner
   workshop series. Skip this if nothing verifiable turns up; don't
   invent one.
4. Cross-check addresses/organizer names — some event aggregators
   mis-tag events under the wrong city (e.g. a "Philadelphia" events
   page that actually lists New Jersey suburbs). Verify the address is
   genuinely in or near the target city before including it.
5. Classify each entity:
   - **Club**: has a fixed or recurring venue/schedule where people
     show up (open play, a recurring class series, a dedicated studio)
   - **Instructor**: a person/business offering lessons "at your
     location" or by appointment, without a fixed public venue
   - Some entities are ambiguous — use judgment, but lean toward
     "instructor" if there's no address and "club" if there is one.

### Minimum bar before publishing

Per `docs/CITY_PAGE_POLICY.md` §11: a city needs **≥5 ACTIVE rows**
total (clubs + instructors + events combined) to publish.

**If the initial two searches (step 1) come up short of 5, don't stop
— dig further before concluding the city doesn't have enough.** In
practice, a first pass of general "club"/"instructor" searches often
lands at 3-4 real, confirmed entries; a second round almost always
finds the rest. This happened with both Philadelphia and San Diego —
neither had enough after the first round, and both crossed the bar
with one more search pass. Try these, roughly in order of how often
they pay off:

1. **JCCs and synagogues** — search `"{CITY} JCC" mahjong` and
   `{CITY} synagogue mahjong beginner class`. Jewish community centers
   and synagogues run seasonal American Mahjong beginner classes
   almost everywhere in the US; they're reliably real, reliably
   American-style, and often missed by a generic first search because
   they don't brand themselves as "mahjong clubs."
2. **Senior centers / community/rec centers** — search
   `{CITY} senior center mahjong` and `{CITY} community center mahjong
   lessons`. Same logic: extremely common, always genuinely American
   in the US, easy to verify (city/county parks & rec sites are
   authoritative).
3. **Search by neighboring/synonymous instructor names already
   found** — if one instructor mentions a colleague, or a directory
   page lists several names at once (e.g. "Where the Winds Blow" or
   the American Mahjong Association's state directory), search each
   name individually — `"{Name}" mahjong {CITY}` — to confirm and get
   more detail than the directory snippet alone.
4. **A second, differently-worded search** — the exact query wording
   matters more than it seems. If `American Mahjong club {CITY}
   lessons open play beginner NMJL` didn't surface enough, try
   `mahjong {CITY} {STATE} NMJL instructor` or `American Mahjong {CITY}
   JCC OR synagogue open play beginner class {YEAR}` — different
   phrasing surfaces different sites.
5. **Local press / lifestyle magazine event calendars** — search
   `{CITY} magazine mahjong` or `{CITY} events mahjong beginner` — city
   magazines and community event calendars (e.g. a "San Diego
   Magazine" community events page) often list real classes that
   don't otherwise show up in club-focused searches.

If, after genuinely working through the above, the city still has
fewer than 5 confirmed ACTIVE entries, **leave it unpublished** rather
than padding it with unconfirmed or wrong-variant entries — say so
explicitly in the handoff (which sources were checked, what came up
short) so whoever picks it up next doesn't repeat the same searches
from zero.

### Output format

Produce three CSVs (skip `events.csv` entirely if no real event was
found — don't leave it with zero data rows):

`clubs.csv` header:
```
name,city,state,description,address,website,phone,email,latitude,longitude,beginner_friendly,lessons_available,open_play,social_play,women_only,free,price,schedule,source_url,last_verified_at,status
```

`instructors.csv` header:
```
name,city,state,website,contact,private_lesson,group_lesson,online_lesson,beginner_lesson,price,notes,source_url,last_verified_at,status
```

`events.csv` header:
```
name,city,state,event_date,start_time,end_time,venue,club_name,instructor_name,event_type,beginner_friendly,price,registration_url,source_url,last_verified_at,status
```

Rules for filling these in:
- `status` is `ACTIVE` for anything confirmed from a real source today.
  Use `NEEDS_REVIEW` only if you found it but couldn't fully verify —
  don't force everything to ACTIVE.
- `source_url` is the actual page you fetched the details from, not a
  generic homepage if a more specific page exists.
- `last_verified_at` is today's date.
- Boolean fields (`beginner_friendly`, `free`, etc.): `TRUE`/`FALSE`
  based on what the source actually says. Leave blank only if truly
  unknown (blank is treated as FALSE on import, with a warning — that's
  fine for genuinely unconfirmed fields, but don't use it to dodge a
  judgment call you can make from the source).
- `price`: put a single representative number if there's a simple one
  (e.g. drop-in fee), otherwise leave blank and put the detail in
  `schedule` (clubs) or `notes` (instructors) as free text.
- In `events.csv`, `club_name` must exactly match a `name` in
  `clubs.csv` (same city) for the two to link — check it matches
  character-for-character.

### Before handing off: data-quality checklist

Real issues have turned up in past handoffs (Nashville, Minneapolis)
— check for all of these before sending CSVs back:

- **`event_type` must be one of the five valid values** — `OPEN_PLAY`,
  `TOURNAMENT`, `SOCIAL`, `LESSON`, or `OTHER` — not free text. Map
  whatever you found to the closest of these five. Values seen in the
  wild that need mapping: "beginner workshop," "beginner lesson,"
  "class" → `LESSON`; "guided open play," "beginner/open play,"
  "supervised play" → `OPEN_PLAY`; "social tournament," "league,"
  "competitive league" → `TOURNAMENT`; anything that's a mixer/social
  event without structured play → `SOCIAL`; anything else → `OTHER`.
- **`city`/`state` must be the metro area this site pages by — not
  the literal suburb a venue sits in.** This is the single most
  important check. If you're researching "Minneapolis" and find a
  great club in Edina, or an event in Fridley, or an instructor based
  in Minnetonka, those still go in with `city=Minneapolis,
  state=MN` — the real suburb/address goes in the `address` field (for
  clubs) or in `description`/`notes`/`venue` text, never in the `city`
  column. The database looks up cities by exact name match; a row with
  `city=Edina` when only a `Minneapolis` City record exists will fail
  to import (or worse, silently fail to link to other entries in the
  same metro that reference it by name). This happened across an
  entire Minneapolis handoff — every club, instructor, and event
  needed its `city` column corrected from a real suburb name to
  `Minneapolis` before import. Always use the exact city name given in
  the assignment (e.g. "Minneapolis, MN"), never a suburb, even when
  the actual venue/business is technically located elsewhere.
- **The `city` column holds the bare city name only — no state, no
  comma.** Write `Washington`, not `"Washington, DC"`; the `state`
  column carries `DC` separately. The site displays `{city}, {state}`,
  so a `city` of "Washington, DC" renders as "Washington, DC, DC". Same
  for any city (`Portland`, not `Portland, OR`).
- **URL columns hold web URLs only.** `registration_url` and
  `source_url` must be `http(s)://` links — not `mailto:` addresses or
  phone numbers. If an event is registered for by email, leave
  `registration_url` blank and put the contact in a description or
  notes field instead.
- **Don't leave a truncated or partial phone number.** If a source page
  cuts off (e.g. "615-" with nothing after it), copy-paste errors
  happen — either go back and get the complete number, or leave the
  field blank. A broken-looking phone number is worse than no phone
  number.
- **Don't paste literal `[email protected]`-style text as an email.**
  This is a Cloudflare email-obfuscation placeholder that shows up
  broken when scraped/copied from a page instead of rendering the real
  address — it's not a real email. If a page shows this, either find
  the real address elsewhere on the site or leave the `email` field
  blank.

- **Don't mark a listing `ACTIVE` if you can't show a concrete session
  or venue.** A row with no address, no schedule, and no confirmed
  upcoming session — e.g. a city parks page that only says "check
  availability" (Portland Parks & Recreation) — must be `NEEDS_REVIEW`,
  not `ACTIVE`. It stays in the database but hidden from the public
  page until someone confirms a real session. `ACTIVE` means "a reader
  could show up and find this," not just "a source mentions it exists."
  Such rows also don't count toward the ≥5 ACTIVE minimum.

  **This rule is for clubs, venues, and events — not for
  instructors.** An instructor or lesson business that teaches by
  appointment (private/group lessons booked through a website or
  contact) is `ACTIVE` as long as you confirmed it teaches American/
  NMJL and it has a working website or contact — a reader can simply
  get in touch. Do *not* downgrade an instructor just because no dated
  public class is posted. Also, `NEEDS_REVIEW` should reflect real
  uncertainty (unclear variant, closed, can't be reached), not just a
  missing calendar entry.
- **Members-only groups aren't `ACTIVE` public listings.** If a club
  can only be joined by becoming a paying member of a private
  organization (e.g. a women's club or country club), mark it
  `NEEDS_REVIEW` and say why in the handoff, so a reader isn't sent to
  a door they can't walk through. (Groups that just take a guest fee or
  invite the community are fine.)
- **Address columns hold an address, not prose.** If the exact venue
  isn't public (e.g. "shared with registered players"), put the general
  area ("Spring Branch, Houston, TX") in `address` and the explanation
  in `description`.
- **Fill in every true/false field explicitly.** Blank `free`,
  `open_play`, `private_lesson`, etc. are silently treated as FALSE on
  import (with a warning), which can misstate a listing — e.g. a JCC
  drop-in that is actually free, or an instructor who does offer
  private lessons. If the source doesn't say, FALSE is acceptable, but
  write it explicitly rather than leaving it blank, and only leave a
  field blank when you genuinely couldn't determine it.
- **Check for column shifts.** If a row has extra/missing commas, a phone,
  email or latitude can land in the wrong column. Confirm `phone` looks
  like a phone number, `email` like an email, and `latitude`/`longitude`
  are numbers or blank.
- **`instructors` only lists people who teach.** An organizer or contact
  person for a group who has no evidence of teaching belongs in the club's
  description, not as an instructor row.
- **Link an event to a club only if that club actually runs it.** If a
  venue or teacher hosts the event, leave `club_name` blank and fill
  `instructor_name` instead.

More generally: skim every field you're about to write one more time
for anything that reads as cut off, mismatched, or copy-pasted
incorrectly — these are the ones caught so far, not an exhaustive
list.

### After research: deliverable

Write the three CSVs into `data/collected/{city-slug}/`. That's the
deliverable — importing them into the database (validation, migration
files, publishing) is a separate step done in the main site session,
not part of this research task, unless asked to also do that.

---

## Notes for whoever runs the import step later

Once CSVs exist at `data/collected/{city-slug}/`:

```bash
node scripts/import-csv.mjs \
  --clubs=data/collected/{city-slug}/clubs.csv \
  --instructors=data/collected/{city-slug}/instructors.csv \
  --events=data/collected/{city-slug}/events.csv \
  --dry-run
```

If it validates and totals ≥5 rows, generate migrations following the
existing numbered sequence in `migrations/` (check the latest number
first):

1. `{next}_{city}_city.sql` — `INSERT OR IGNORE` the City row with
   `published = 0`
2. `{next+1}_{city}.sql` — the real `--out=` from `import-csv.mjs`
3. `{next+2}_publish_{city}.sql` — `UPDATE "City" SET "published" = 1
   WHERE "slug" = '{city-slug}'` (only once the ≥5 bar is met)
4. `{next+3}_{city}_intro.sql` — `UPDATE "City" SET "intro" = '...'
   WHERE "slug" = '{city-slug}'`. The intro is **written at the import
   step, not by the researcher**: 60–100 words, drawn only from that
   city's verified listings (club names, formats, venues, who it's for
   — e.g. "a JCC program, a library group, a dedicated space"), with no
   counts or dates that will go stale, no superlatives, and a
   beginner-oriented last sentence. Escape apostrophes as `''`. See
   `migrations/0053_city_intros.sql` for examples. (Cities published
   before this rule got their intros in that migration.)

Apply locally (`wrangler d1 migrations apply DB --local`), verify
`/cities/{city-slug}` renders correctly, then `npx tsc --noEmit` and
`npm run lint` before committing, opening a PR, and merging.
