# Voice & Tone — Learn Section

This is the writing brief for American Mahjong Guide's Learn articles
(`src/content/learn.ts`). Follow it whenever you draft or edit a Learn
topic, so new content sounds like it came from the same person.

## Who we're writing for

Primarily American women 40+ who are discovering or returning to
American Mahjong (a well-documented recent resurgence in the US, often
through social/community play, private lesson businesses, and NMJL —
National Mah Jongg League — card-based play). Many are complete
beginners; some are lapsed players returning after decades. Assume
zero prior knowledge unless a topic explicitly builds on an earlier
one.

## 1. Overall tone: warm, encouraging mentor

Position: **"the friend who already knows how to play and is teaching
you at her kitchen table."** Confident and clear — this is a rules
reference people need to trust — but never textbook-cold or
condescending.

Avoid heavy playfulness or gimmicks (no puns, no "let's mahj!"). Save
that register for club/event marketing copy, not instructional
content. The Learn section's job is to make someone feel capable, not
entertained.

## 2. Reading level: 7th–8th grade

- Short sentences. One idea per sentence.
- Break process steps into numbered lists or short paragraphs
  (3–4 sentences max) rather than dense blocks.
- No em-dash-stacked academic sentences.
- Never assume the reader has seen a mahjong tile before.

## 3. Second person, consistently

Write "you'll draw a tile," not "the player draws a tile" or "one
draws a tile." Second person keeps it instructional and personal,
matches how in-person lesson businesses talk, and reads naturally for
SEO featured-snippet targeting (how-to queries favor "you" phrasing).

## 4. Jargon: define on first use, every article

Each article should stand alone for someone who landed on it from
Google — don't assume they read another Learn page first.

Pattern: **term** (bold) + plain-English definition in the same
sentence + one concrete example where possible. Link out to the Terms
glossary (`/learn/terms`) for anyone who wants more, rather than
over-explaining inline every time.

> Example: "The **Charleston** is a set of passes at the start of the
> game, where you trade tiles with other players to improve your hand
> — think of it like a structured swap meet before play begins."

## 5. Do this / Not this

✅ **Do this:**
"American Mahjong is a tile-based game for four players, built around
collecting a specific hand using tiles instead of cards. If you've
heard of Chinese Mahjong, this is a distinct American variant. Don't
worry if that sounds like a lot right now; by the end of this guide
you'll know exactly how a hand comes together."

❌ **Not this:**
"American Mahjong is a tile-based variant of the classic Chinese game,
distinguished primarily by its incorporation of jokers and reliance
upon an annually-published scoring card issued by the National Mah
Jongg League, which governs standard hand configurations and
associated point values."

## 6. Words to favor / avoid

**Favor:** "you'll," "let's," "don't worry," "here's how," "once
you've got this," "just like [everyday comparison]." Favor concrete
analogies over abstract ones — card games like gin rummy or bridge
work well, since the target audience is likely familiar with them.

**Avoid:** "the player," "one must," "utilize," "shall," "in order
to," "leverage," "simply" (dismissive to true beginners), and
gaming-industry jargon (e.g. "reskin") the target reader won't know.
Avoid Chinese Mahjong comparisons unless clearly flagged as optional
context — the audience mostly cares about NMJL/American play.

## Review process for new content

Every Learn article should go through two independent passes before
merging, in addition to your own draft:

1. **Fact-check** — verify every rule/terminology claim against a real
   source (NMJL's own materials, or established American Mahjong
   instruction sites), not memory alone. Flag anything that's a
   defensible beginner-level simplification versus anything that's
   flatly wrong or actively misleading.
2. **Voice/phrasing edit** — review purely for natural US English and
   adherence to this brief, independent of the fact-check pass.

Apply both sets of feedback, then re-verify the page renders correctly
(`npm run lint`, `npx tsc --noEmit`, and a local visual check) before
opening a PR.
