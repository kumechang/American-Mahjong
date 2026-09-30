# Expert Review Packet

For finding and briefing **real people** to review the site's text. AI
"expert" reviews (see the other docs) catch a lot, but rules, wording and
legal text that beginners rely on should be checked by a person before we
promote the site. Two reviewers are needed now; a third (attorney) before
ads or affiliate links.

## What to send them
- `docs/review/learn-guides.md` — the 8 beginner guides (about 2,600 words)
- `docs/review/city-intros.md` — one short intro per city (about 4,200 words)
- This page's "Instructions" section

Regenerate the two files after content changes:
`node --experimental-strip-types scripts/export-review-packet.mjs`.

## 1. Domain expert (American Mahjong player)
**Who:** plays American Mahjong regularly (3+ years), owns the current NMJL
card, ideally teaches or has run a group. Not tied to a business we list
(or disclose it).
**Reads:** `learn-guides.md` (about 90 minutes) and skims `city-intros.md`
for rules-related claims (15 minutes).
**Checks:** rules, terms and etiquette are correct and safe for a beginner;
nothing important is missing; nothing from other Mahjong styles slipped in.
**Where to find one:** teachers already listed on the site (the MahJongg
Maven and NMJL-card teacher directories, local JCC and library instructors),
American Mahjong Facebook groups, r/mahjong, local club organizers. Offer a
credit and a modest fee or gift card; ask for a yes/no in one message.

## 2. US English editor
**Who:** native US English editor or copywriter with consumer-web
experience. Comfortable writing for adults 40–80.
**Reads:** both files (about 3 hours) and `docs/VOICE_AND_TONE.md`.
**Checks:** natural phrasing, consistency (Mahjong vs Mah Jongg, NMJL),
tone matches the voice guide, repetition across the city intros, claims
that read like guarantees.
**Where to find one:** freelance marketplaces (Upwork, Reedsy, ProZ),
a local writers' group, a journalism or English department contact.
Ask for a fixed price for the two files.

## 3. Attorney (before ads/affiliate links)
**Who:** US attorney with website privacy/terms and advertising-disclosure
experience. **Reads:** `/privacy`, `/terms`, `docs/LEGAL_AND_PRIVACY.md`.
Ask for a fixed-fee review.

## Instructions for reviewers (paste into the email)
> Thanks for helping. The site (mahjong-map.com) is a free guide for people
> who are new to American Mahjong (NMJL card rules). Please read the
> attached file(s) as a first-time player would.
>
> For every problem, add one row to a table (or a comment) with:
> 1. **Where** — the guide/section or the city name
> 2. **Quote** — the exact sentence
> 3. **Issue** — what is wrong or unclear
> 4. **Suggested fix** — your wording
> 5. **Certainty** — Sure / Fairly sure / Please double-check
>
> You don't need to rewrite anything that is fine. If you aren't sure about
> a rule, say so rather than guessing. Please do not change anything that is
> in another Mahjong style (Chinese, Riichi) — the site covers American
> Mahjong only. About how long do you think it will take, and what would you
> like as credit or payment?

## Outreach message (short)
> Hi [Name] — I'm building a free beginner's guide to American Mahjong
> (mahjong-map.com) and would love an experienced player's eyes on the
> rules pages before we promote it. It's about 90 minutes of reading; I can
> offer [fee/gift card] and a "Reviewed by [Name]" credit on the About page
> if you'd like one. Would you be open to it?

## After they respond
1. Save their comments in `docs/review/feedback/` (one file per reviewer,
   with date and name or initials).
2. Apply changes in `src/content/learn.ts` or new intro migrations;
   anything marked "Please double-check" gets a second opinion.
3. If they agree, add a credit line to `/about` (e.g. "Rules reviewed by
   …, [date]") and record the review date in `docs/`.
4. Re-run the exporter and keep the new files in git.
