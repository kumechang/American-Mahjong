# Share Image (OG Image) — Brief & Prompts

Instructions for making the images shown when a page is shared on social
media, chat apps and search. Use **Canva** (recommended for exact layout and
readable text) and optionally **Gemini** (for a background or extra
illustration). Everything below is copy-paste ready.

## 1. What to deliver

| File | Used for | Size |
|---|---|---|
| `og-default.png` | Home, city pages, everything without its own image | 1200 × 630 px |
| `og-learn.png` | `/learn` and Learn articles | 1200 × 630 px |
| `og-find.png` | `/find`, `/cities`, `/community` | 1200 × 630 px |

- Format PNG (or JPG), **under 300 KB each** if possible (Canva → Download →
  PNG, then run through squoosh.app or tinypng.com if larger).
- Save into the repo at `public/og/` with exactly those names and tell Claude;
  Claude will wire them into the page metadata.
- Do **one image first** (`og-default.png`). Do the variants only if you like it.

## 2. Brand facts to keep consistent

- Site name: **American Mahjong Guide** (mahjong-map.com)
- Idea: *Learn → Find → Play* — a friendly guide for beginners
- Feeling: warm, welcoming, calm, trustworthy; a friend showing you the ropes.
  Not flashy, not gambling/casino, not "oriental" clichés.
- Colors (exact hex):
  - Paper / background: `#FAF6EC`
  - Tile ivory (cards, tile faces): `#FFFDF8`
  - Ink (text): `#1C1917`
  - Jade green (brand, main accent): `#0F6B52`
  - Deep jade (dark accent): `#0A5340`
  - Tile red (small accent only): `#B3261E`
  - Line / edge: `#D9D2C0`
- Type: a clean, friendly sans-serif with a bold weight for the headline
  (the site uses Geist; in Canva use **Inter**, **Manrope** or **DM Sans**).
  Headline Bold/ExtraBold, tagline Regular/Medium. Use one font family only.

## 3. Recommended method (Canva, ~10 minutes)

This keeps text sharp (AI image tools garble text and mahjong tiles) and
reuses our own tile artwork.

1. Canva → Custom size **1200 × 630 px**.
2. Background: solid `#FAF6EC`. Optional: add a very subtle warm texture or a
   soft large circle of `#0F6B52` at 6–8% opacity in one corner. No gradients
   that look techy.
3. Upload **`docs/og/tile-row.png`** from this repo (transparent PNG of the four
   site tiles: one dot, three bams, five dots, white dragon). Place it
   **centered horizontally**, width about **560 px**, top edge at **y ≈ 60**.
   Do not recolor or redraw the tiles.
4. Headline (centered): **Start playing American Mahjong** — Bold, about
   **72 px**, color `#1C1917`, two lines if needed, top at **y ≈ 260**.
5. Tagline (centered): **Learn the rules. Find a club near you. Play.** —
   Medium, about **34 px**, color `#0A5340`, at **y ≈ 420**.
6. Small line (centered): **Beginner-friendly clubs, lessons & events in cities across the U.S.**
   — Regular, about **26 px**, color `#1C1917` at 75% opacity, at **y ≈ 480**.
7. Bottom: **American Mahjong Guide** (Bold, 28 px, `#0F6B52`) with
   **mahjong-map.com** (Regular, 24 px, `#1C1917` at 70%), centered at **y ≈ 560**,
   separated by a thin `#D9D2C0` line above.
8. **Safe area:** keep every important element inside x 80–1120 and y 40–590.
   Some apps crop the top/bottom or round the corners.
9. Check at small size: zoom out to ~300 px wide; the headline must still be
   readable.
10. Download PNG → `og-default.png`.

## 4. Optional Gemini prompts

Use Gemini (Imagen / "Nano Banana") only for a **background or accent
illustration with NO text and NO real mahjong tiles**, then place it behind the
Canva layout. Ask for 16:9 (or 1200×630), then crop.

### 4a. Soft background (no tiles, no text)

```
A calm, minimal flat-vector background illustration for a website share
image, landscape 1200x630. Warm ivory paper color (#FAF6EC) with a very
subtle paper grain. In the corners, large soft rounded organic shapes in
jade green (#0F6B52) at low opacity, and a few tiny accents in muted red
(#B3261E). Plenty of empty space in the center for text. Friendly, cozy,
modern, trustworthy. Flat colors, soft edges, no gradients that look
futuristic, no shadows, no glow, no 3D.
Do NOT include: any text, letters, numbers, logos, watermarks, people,
faces, hands, casino or gambling imagery, dice, playing cards, dragons,
Chinese or Japanese lettering, mahjong tiles, or busy patterns.
```

### 4b. Warm "table" scene (only if you want more personality)

```
Flat vector illustration, top-down view of a friendly game table, soft
ivory tabletop (#FAF6EC), a few simple rounded rectangles suggesting tiles
with only abstract circles and bars in jade green (#0F6B52) and tile red
(#B3261E), a small teacup in jade, a pair of reading glasses, and a folded
napkin. Cozy, welcoming, uncluttered, lots of empty space on the left half
for text. Flat colors, soft edges, subtle paper texture. Landscape 1200x630.
Do NOT include: text or letters, real mahjong tile symbols or characters,
people or hands or faces, logos, brand names, gambling or casino elements,
neon, glossy 3D, realistic photo style.
```

If tiles come out garbled (common), delete them in Canva and use
`docs/og/tile-row.png` instead. Never publish AI-drawn tile faces or any
characters/symbols you can't verify.

## 5. Variants (same layout, different text)

Duplicate the default design and change only the text and, if wanted, a small
label above the headline (uppercase, 24 px, letter-spacing +8%, `#0F6B52`).

| File | Label | Headline | Tagline |
|---|---|---|---|
| `og-learn.png` | LEARN | Learn American Mahjong | Rules, the Charleston, scoring and more — explained for beginners. |
| `og-find.png` | FIND | Find a place to play | Clubs, lessons, open play and events near you. |

Keep the tile row, colors and footer identical so the set looks consistent.

## 6. Do / Don't checklist

- **Do** keep it uncluttered: one headline, one tagline, one small line.
- **Do** use our tile artwork (`docs/og/tile-row.png`) for tiles.
- **Do** check contrast: dark ink or deep jade on the ivory paper only.
- **Don't** copy the National Mah Jongg League card, its logo, or any club's
  photos or logos. Don't imply endorsement by the NMJL.
- **Don't** use stock photos of people unless the license clearly allows
  commercial use, and never real people's faces from listings.
- **Don't** put small text (under ~24 px) or a city/number that will go out of
  date ("49 cities") on the image.
- **Don't** use casino imagery (chips, cards, dice, neon).
- **Don't** put important content in the outer 40 px.

## 7. Files in this repo
- `docs/og/tile-row.svg` — editable vector of the tile row
- `docs/og/tile-row.png` — 2136 × 672 transparent PNG for Canva
