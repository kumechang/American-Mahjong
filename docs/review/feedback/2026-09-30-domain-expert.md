# Domain expert feedback — 2026-09-30

Received from the site owner as the domain expert's answer. It cites the
American Mah Jongg Association (AMJA) guide and the Sloperama Q&A board — both
secondary sources: the AMJA is independent of the National Mah Jongg League,
which sets the rules (its book is "Mah Jongg Made Easy"), so it is
worth a second look if a claim is disputed. (The pasted text carried
`utm_source=chatgpt.com` links, which suggests it was produced with an AI
assistant; if a human player has not yet confirmed these points, treat them as
"reviewed, not yet human-verified".) Confidence labels are the reviewer's.

## Must fix (all applied in `src/content/learn.ts`)
1. **C hands and discards.** A hand marked C can only claim a discard for the
   very last tile that completes Mahjong; X lines allow exposures. Applied in
   Beginner Guide, Rules and Scoring. (High)
2. **Turn wording.** Claiming a discard is not "drawing"; now "you either draw a
   tile from the wall or, when it's allowed, claim the tile that was just
   discarded." (High)
3. **Wall game and the deal.** The deal passes to the next player after a wall
   game, as after a win. Applied in Rules and Terms; also states that the last
   discard can still be called for Mahjong. (High)
4. **C / X explanation.** Rewritten around "must be completed concealed" with
   the last-discard exception. (High)
5. **Jokerless bonus.** Not every hand; e.g. not Singles and Pairs; no separate
   marking on the card. Applied; also says there is no dealer bonus. (High)
6. **Quint.** Not always joker-dependent because a set has eight Flowers.
   Applied. (High)
7. **Sextet.** Added to Terms; Jokers page now says groups of three or more
   (pung, kong, quint, sextet). (High)
8. **Blind pass.** First Charleston: last pass (first left); second Charleston:
   last pass (right); 1–3 of the received tiles may be passed unseen. Applied
   in Charleston. (High)
9. **Joker exchange timing.** On your turn after drawing or claiming a tile and
   before discarding. Applied. (reviewer: basically correct, add the condition)

## Answers to the 8 questions
| # | Answer | Confidence |
|---|---|---|
| 1 | The deal passes after a wall game | High |
| 2 | A concealed hand can claim the discard that completes Mahjong | High |
| 3 | Wall game = last tile used and no Mahjong; the final discard can still be claimed for Mahjong | High |
| 4 | C/X description mostly right, needed the fixes above | High |
| 5 | Jokerless is not marked on the card; judged by the finished hand | High |
| 6 | No standard dealer/East bonus | High |
| 7 | Etiquette: call discards, don't touch racks, hide tiles, don't discuss hands, don't take discards back, make calls clearly — very common but not universal | Medium-High |
| 8 | Blind pass: first left and last right; 1–3 received tiles | High |

## Etiquette note
Separate rules from manners. "Claim a tile promptly" is really a rule about the
call window (now stated in Rules); snacks and similar are group-dependent.

## City introductions
No rule problems found. The Phoenix caution ("games are not always American
Mahjong") was called a good warning.

## Not applied / open
- "Don't take back a discard" is not stated on the site yet (reviewer:
  very common, not universal); waiting for a second opinion.
- A human American Mahjong player should still confirm items 1, 3 and 5
  before the site is promoted.

## Verify against the primary source
Before promoting the site, check the three disputed rules (deal after a wall
game, C-hand last discard, jokerless bonus) in the NMJL's "Mah Jongg Made Easy"
and current rulings, not only the AMJA guide. See `docs/NOTEBOOKLM_WORKFLOWS.md`.

## Cross-check with NotebookLM (2026-10-01)
C-hand last discard and the jokerless bonus (not Singles & Pairs) were supported by AMJA and Sloperama quotes; the wall-game deal was only indirectly supported (a general "the dice move to the right" quote). Details: `docs/review/notebooklm/2026-10-01-notebook-a-open-questions.md`.
