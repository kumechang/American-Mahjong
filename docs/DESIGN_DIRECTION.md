# Design Direction

Written from a role-played review by a **Brand / Visual Designer (art
director)** working with the **UX/UI Designer** from the business plan
(ch. 32). Based on screenshots of the home page, `/cities`, a city page and
mobile widths taken 2026-09-30. Not implemented unless noted — these are
proposals to prioritize.

## Which expert
- **Brand / Visual Designer (art director)** owns how the site *looks and
  feels*: identity, color, type, imagery, first impression.
- **UX/UI Designer** owns how it *works*: findability, layout, flows.
  They should work as a pair; visual polish on a confusing layout won't
  convert.

## What the review found
Strengths: clean, fast, readable, good hierarchy, calm green accent, honest
"Verified" notes, dark mode. Weaknesses:

1. **Generic.** Nothing says "Mahjong" — no tiles, no imagery, one accent
   color. It reads as a template, so it doesn't earn a second look.
2. **No first-screen hook.** The home page has a headline and three cards
   but no proof (how many cities, real listings) and the main action —
   *find a place near me* — is a small button lower down.
3. **`/cities` is a flat wall of ~50 cards** with no search or grouping by
   state. It won't scale and is the page most visitors need.
4. **City pages are text-first.** Good SEO, but the visitor's question
   ("where do I start?") isn't answered above the fold; a recommended
   first step and a summary strip would help.
5. **Mobile header** clipped the nav (fixed 2026-09-30).
6. **Type** was falling back to Arial instead of Geist (fixed 2026-09-30).
7. **Count labels** read "1 clubs" / "1 events" (fixed 2026-09-30).

## Recommendations, in order
1. **Identity kit (small, high impact).** Tile-inspired visual language:
   rounded "tile" cards with a thin inner border, a warm ivory background
   (not stark white), jade green as primary, tile-red as a rare accent for
   calls to action. Draw a simple SVG tile set (dots, bams, cracks,
   dragons, flowers) — original artwork only; avoid copying the NMJL card
   or any club's imagery.
2. **Home hero with a city search.** One input ("Enter your city") with
   type-ahead over published cities, plus a line of proof ("Clubs, lessons
   and events in N cities"). Keep Learn → Find → Play below it.
3. **Cities index:** search box, group by state (or "Popular" first),
   show a small badge for what the city has (clubs / lessons / events).
4. **City page summary strip:** three chips at the top ("N clubs · N
   teachers · next event Oct 5") and a "Best place to start" card that
   picks the most beginner-friendly listing. Matches the Beginner First
   principle in the business plan.
5. **Consistent components:** one card, one badge and one button style;
   define color/spacing tokens in `globals.css` so the palette change in
   step 1 is a single edit.
6. **Imagery:** a few illustrated hero/section images and tile icons; if
   photos are used, only ones with clear licenses or that we take
   ourselves. Never use listed clubs' photos without permission.
7. **Accessibility guardrails while restyling:** keep text contrast at
   WCAG AA (ivory + zinc-600 is fine; green-on-ivory needs checking),
   visible focus rings, tap targets ≥44px on mobile.

## What not to do yet
- No heavy animation or large image assets — page speed is an SEO factor.
- Don't redesign every page before the home page, `/cities` and the city
  template are settled; those three carry almost all the traffic.

## Status (2026-09-30)
Implemented: design tokens in `globals.css` (ivory/jade/tile-red, `.tile-card`,
focus rings), SVG tile art (`TileRow`), home hero with city search
(`CitySearch`, ARIA combobox), `/cities` search + state grouping
(`CityDirectory`), city-page summary chips and "Good place to start" card
(`CityHighlights`). Learn index and article pages restyled (numbered guides, reading time, on-page contents, larger body text, previous/next, play CTA). Find is now a category hub (top cities per lessons / open play / clubs / teachers / events / tournaments) and Community shows the top 12 cities per group. Not yet done: Shop page polish, per-page
OG images, illustration beyond the tile set, contrast audit with a tool.

## Accessibility audit (2026-09-30)
Ran axe-core (WCAG 2 A/AA + best practices, including color contrast) on the
home page, `/cities`, two city pages, `/find`, `/community`, Learn pages,
`/about`, `/privacy`, `/terms` and `/shop`, in light and dark mode.
First run found secondary text (`text-zinc-500`, about 3.7:1 in dark mode and
4.47:1 in light mode) below the 4.5:1 minimum. Fixed by adding a `--muted`
token (`text-muted`, also used for input placeholders); rerun shows no
violations. Re-run with `node scripts/a11y-audit.mjs` (setup steps are at the
top of the script) after any color or layout change.
