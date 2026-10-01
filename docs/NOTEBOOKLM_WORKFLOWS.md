# NotebookLM Workflows

How to use Google's NotebookLM as an **evidence checker** for this site. It
answers only from the sources you add and shows where each answer came from,
which suits our two hardest jobs: confirming rules and confirming that a
listing is really American Mahjong. It does not find new listings and does not
replace a human expert. Features and limits change; check the app for current
source counts and file types.

## Ground rules
1. **Sources only.** If a source doesn't say it, the answer is "not stated".
   Tell the tool this in every prompt (the prompts below do).
2. **Check the quote.** Open the citation and confirm the quoted words appear in
   the source before you rely on the answer.
3. **Evidence, not copy.** Never paste NotebookLM wording into the site. Use it
   to check or justify our own text.
4. **Rights.** Add only material you may use: official web pages, public Q&A
   pages, your own copy of the current NMJL card for personal reference. Do not
   upload or republish the card or rulebooks wholesale into the repo.
5. **No private data.** Don't add researchers' emails or instructors' personal
   contacts as sources.
6. **Snapshots go stale.** A saved page is a copy from the day you added it.
   Re-add the page for anything date-sensitive (events, prices).
7. **Record the result** (see the end) so the check can be repeated.

## Notebook A — Rules fact-check (Learn guides)
**Sources to add (in order of authority)**
1. **NMJL "Mah Jongg Made Easy"** — the National Mah Jongg League's official
   instruction (rule) book, last updated in 2024; the league also issues
   rulings between editions. Buy your own copy (print or ebook) from the NMJL
   or an authorized seller and keep the notebook private. This is the primary
   source for every rule claim.
2. **Your current-year NMJL card** (personal reference, private notebook).
3. **NMJL public pages** (nmjl.org FAQ and rulings pages), added as URLs.
4. *Secondary — useful, not authoritative:* the American Mah Jongg Association's
   online rulebook and glossary (an independent group that does not set the
   rules and is not affiliated with the NMJL), the Sloperama Mah-Jongg Q&A
   pages, and the Mahj Life wiki article "Rules not found in Mah Jongg Made
   Easy". Where a secondary source disagrees with the NMJL book, the book wins;
   note the disagreement.
5. `docs/review/learn-guides.md` (the text under test; regenerate with
   `node --experimental-strip-types scripts/export-review-packet.mjs`).

Label each source in the notebook ("PRIMARY: Mah Jongg Made Easy 2024",
"SECONDARY: AMJA guide") so answers show which kind of source supports them.

**Prompts**
1. *Contradictions:*
   > Using only the sources labeled PRIMARY first, then SECONDARY (not the document "Learn guides"), list every
   > sentence in "Learn guides" that conflicts with the sources. For each: quote the
   > sentence, quote the source passage, name the source, and say whether it is a
   > clear conflict or just different wording. If nothing conflicts, say so.
2. *Support table:*
   > Make a table of the factual claims in the "Charleston" guide (directions, number
   > of tiles, blind pass, courtesy pass, jokers). For each claim, say Supported,
   > Contradicted or Not stated in the sources, with a quote and source name.
3. *Omissions:*
   > What rules do the sources say a first-time player must know about
   > [Charleston / jokers / calling a discard / Mahjong / wall games] that the
   > matching guide does not mention? Quote the source for each.
4. *Question checks* (our open items):
   > According to the sources only: after a wall game, who deals next? Can a
   > concealed (C) hand claim a discard? Which Charleston passes may be blind and
   > how many tiles? Is there a dealer bonus? If the sources don't say, answer
   > "not stated".

**Use the result:** a clear conflict with a quoted source goes to the
domain expert for confirmation, then we edit `src/content/learn.ts`. "Not
stated" is not an error.

## Notebook B — "Is it American Mahjong?" (one notebook per city or batch)
This addresses the most common research dispute. Put one group's official
pages in a notebook (URL or saved PDF of the event page, About page and
calendar), then ask:

> Using only these sources: does the organizer say it teaches or hosts American
> Mahjong, uses the NMJL card, or the National Mah Jongg League? Quote each
> relevant sentence with its page. If the sources only say "mahjong" or "a national
> card" without naming American or the NMJL, say "not confirmed". Also report any
> mention of other styles (Chinese, Hong Kong, Riichi, Taiwanese).

Ask the follow-ups that the validator also warns about:

> Is attendance limited to members, residents or invited guests? Quote it.
> List the dated sessions with date, time, venue, price and the page they come from.
> Is there a venue street address? Quote it.

**Mapping to the CSV**
| NotebookLM answer | CSV action |
|---|---|
| Names American Mahjong or NMJL, quoted | `ACTIVE` OK; put the page in `source_url` and, if short, the words in `description` |
| "National card" / "Mahjong card" only | `NEEDS_REVIEW` (cf. Studio One, Louisville) |
| Not stated | `NEEDS_REVIEW` |
| Another style named | exclude |
| Members only / residents only | `NEEDS_REVIEW` |
| No dated session or no venue | `NEEDS_REVIEW` for events |

Then run `npm run validate:csv` on the CSV as usual.

## Notebook C — Reviewer feedback synthesis
Sources: the reviewers' comments (`docs/review/feedback/*`), `docs/VOICE_AND_TONE.md`,
the Learn guides, the city intros.
> Group the editor's comments by theme and rank by how many times each theme
> appears. Which comments conflict with each other or with the voice guide?
> Quote each comment. Do not rewrite anything.

An "audio overview" is handy for briefing a new reviewer, but check anything
it says against the written sources.

## Notebook D — Voice consistency (before publishing new Learn text)
Sources: `docs/VOICE_AND_TONE.md` and the new draft.
> List every place the draft departs from the voice guide (tone, second person,
> sentence length, banned phrases). Quote the guide line and the draft sentence.

## Record results
Save a short file per check in `docs/review/notebooklm/`:
`YYYY-MM-DD-<topic>.md` containing: the notebook's sources (names and dates
saved), the prompt, the answer (verbatim), and what we changed. For city
variant checks, put the quote and URL in the CSV `source_url`/`description`
instead and note "variant confirmed via NotebookLM quote" in the batch notes.

## Quick start (15 minutes)
1. Create Notebook A. Add the five rulebook/Q&A pages and the exported
   `learn-guides.md`.
2. Run prompts 1 and 4. Open each citation.
3. Copy conflicts into `docs/review/notebooklm/` and show them to the domain
   expert as the agenda for their call.

## Limits to remember
- It cannot discover new clubs, check today's calendar, or crawl a site.
- JavaScript-rendered pages (some ticketing and calendar pages) may import as
  empty; use a PDF print of the page.
- It can still paraphrase wrongly: the quote check in rule 2 is not optional.
- It is a manual tool. Bulk or scheduled checks should be scripted instead
  (see the freshness job in `docs/PROJECT_STATUS.md`).
