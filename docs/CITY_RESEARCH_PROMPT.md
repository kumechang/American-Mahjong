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
total (clubs + instructors + events combined) to publish. If research
comes up short, either keep digging (try senior centers, JCCs,
synagogues, community rec centers — these are reliably real and
American-style) or leave the city unpublished rather than shipping a
thin page.

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

Apply locally (`wrangler d1 migrations apply DB --local`), verify
`/cities/{city-slug}` renders correctly, then `npx tsc --noEmit` and
`npm run lint` before committing, opening a PR, and merging.
