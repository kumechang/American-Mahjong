# NotebookLM check A — contradictions in the Learn guides (2026-10-01)

**Notebook sources (as labeled by the owner):** P: NMJL official site; S: AMJA,
S: Sloperama, S: Mahj Life, S: Wikipedia. *No copy of the NMJL book "Mah Jongg
Made Easy" was confirmed in the notebook, so this is a check against the NMJL
website plus secondary sources.*

**Prompt:** Question A (find sentences in "Learn guides" that conflict with the
sources; quotes in English with Japanese translation).

## Result
One clear conflict.

- Learn guide (Rules > Dead hands), then: "A player with a dead hand keeps
  drawing and discarding, but can no longer win or call tiles for that round."
- S: AMJA: "A player who is called dead remains at the table, but the player:
  May not call tiles; May not declare Mah Jongg; Does not continue discarding
  tiles."
- S: Sloperama: "Player with erring hand is dead and stops picking and
  discarding."

NotebookLM reported that the other checked statements (152-tile set, 8 jokers
and Flowers, Charleston steps and blind pass, payments) match the sources or
differ only in wording.

## What we changed
`src/content/learn.ts`, Rules > Dead hands: a dead-hand player now "stays at
the table but can no longer call tiles, declare Mahjong, or take turns drawing
and discarding for that round. The other players carry on without them."

## Still open
- Run Question B (wall-game deal, C-hand discard, jokerless bonus).
- Confirm the dead-hand wording in the NMJL book when a copy is in the notebook.
- "No conflict found" is not proof of correctness: quotes must still be opened
  and checked.
