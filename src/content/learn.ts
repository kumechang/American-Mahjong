export type LearnSection =
  | { type: "paragraphs"; heading?: string; paragraphs: string[] }
  | { type: "list"; heading?: string; items: string[]; ordered?: boolean }
  | { type: "glossary"; heading?: string; terms: { term: string; definition: string }[] };

export type LearnTopic = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: LearnSection[];
};

export type LearnTopicMeta = {
  slug: string;
  title: string;
  description: string;
};

// Every Learn topic that should appear in the index page, sitemap, and
// generateStaticParams — whether or not its full content has been
// written yet. Topics without a matching entry in LEARN_TOPICS below
// render a "still being written" placeholder instead of 404ing.
export const LEARN_TOPIC_META: LearnTopicMeta[] = [
  {
    slug: "what-is-american-mahjong",
    title: "What Is American Mahjong?",
    description:
      "How American Mahjong differs from Chinese and Japanese Riichi Mahjong, and why it's played with a card.",
  },
  {
    slug: "beginner-guide",
    title: "Beginner Guide",
    description: "Everything a first-time player needs before their first game.",
  },
  {
    slug: "rules",
    title: "Rules",
    description: "The full rules of American Mahjong, step by step.",
  },
  {
    slug: "terms",
    title: "Terms",
    description: "A glossary of American Mahjong terms and slang.",
  },
  {
    slug: "charleston",
    title: "The Charleston",
    description: "How the tile-passing phase works and basic strategy.",
  },
  {
    slug: "scoring",
    title: "Scoring",
    description: "How hands are scored using the National Mah Jongg League card.",
  },
  {
    slug: "jokers",
    title: "Jokers",
    description: "How jokers work and when they can and can't be used.",
  },
  {
    slug: "etiquette",
    title: "Etiquette",
    description: "Unwritten rules and etiquette for playing with a new group.",
  },
];

export const LEARN_TOPICS: Record<string, LearnTopic> = {
  "what-is-american-mahjong": {
    slug: "what-is-american-mahjong",
    title: "What Is American Mahjong?",
    description:
      "A beginner-friendly introduction to American Mahjong: how it's played, what makes it different from other mahjong variants, and why it's having a moment in the US.",
    intro:
      "American Mahjong is a tile-based game for four players, built around collecting a hand of 14 tiles that matches one of the hands on an official card. If you've never played, don't worry — by the end of this page, you'll know what's going on the first time you sit down at a table.",
    sections: [
      {
        type: "paragraphs",
        heading: "The basics",
        paragraphs: [
          "Four players sit around a table, each with a rack to hold their tiles. Instead of cards, you play with 152 tiles. There are three suits — Bams, Dots, and Craks — numbered 1 through 9. You'll also find Winds, Dragons, Flowers, and Jokers.",
          "You'll start with 13 tiles on your rack (the dealer starts with 14). As the game goes on, you draw and discard tiles until your hand matches one of the official hands for the year. (At the very start, you'll also trade some tiles in a phase called the Charleston.) Match one, and you call \"Mahjong\" to win.",
        ],
      },
      {
        type: "paragraphs",
        heading: "The card",
        paragraphs: [
          "Here's the biggest difference from other tile games: you're not free to build any hand you like. Every year, the National Mah Jongg League (NMJL) — the group that sets the rules most American players use — publishes a card listing the exact hands you're allowed to make and how many points each one is worth. Most players keep a copy at the table and check it constantly, especially when they're starting out. That's completely normal.",
          "Because the card changes every year, the game stays fresh even for people who've been playing for decades — there's always a new set of hands to learn.",
        ],
      },
      {
        type: "paragraphs",
        heading: "How it's different from other mahjong games",
        paragraphs: [
          "If you've heard of mahjong before, it may have been the Chinese game, or Japanese Riichi. American Mahjong is its own game: it uses jokers freely — Chinese and Riichi mahjong don't. And instead of building any hand you like, you're working from that annual NMJL card. Even the scoring and the way people talk at the table feel different. If you've played one of those other versions, expect a genuinely different game, not just a new coat of paint on the one you know.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Where to go from here",
        paragraphs: [
          "Once the basics above make sense, the Beginner Guide walks through your first game step by step, and the Terms glossary is worth bookmarking — you'll hear a lot of new vocabulary at your first table.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms",
    description:
      "A plain-English glossary of American Mahjong terms — Charleston, jokers, exposures, the card, and more — for players just getting started.",
    intro:
      "You'll hear a lot of new vocabulary at your first American Mahjong table. Here's what the most common terms actually mean — bookmark this page and check back whenever something in another guide isn't clear.",
    sections: [
      {
        type: "glossary",
        terms: [
          {
            term: "The Card",
            definition:
              "Short for the NMJL (National Mah Jongg League) card — the official list of valid hands and their point values, published every year. Most players keep a copy at the table.",
          },
          {
            term: "Charleston",
            definition:
              "A set of passes at the start of the game, where you trade tiles with other players before anyone starts drawing and discarding. It's how you improve a weak starting hand.",
          },
          {
            term: "Joker",
            definition:
              "A wild tile that can stand in for other tiles — though not on every hand on the card. There are 8 jokers in a standard set.",
          },
          {
            term: "Wall",
            definition:
              "The stack of face-down tiles built at the start of the game. You and the other players draw from it, turn by turn.",
          },
          {
            term: "Rack",
            definition:
              "The small tray each player uses to hold and hide their tiles during the game.",
          },
          {
            term: "Pung",
            definition: "A set of three matching tiles, such as three 5 Dots.",
          },
          {
            term: "Kong",
            definition:
              "A set of four matching tiles (jokers can often fill in), such as four Red Dragons.",
          },
          {
            term: "Pair",
            definition: "Two matching tiles.",
          },
          {
            term: "Exposure",
            definition:
              "A group of tiles (like a pung or kong) that you've placed face-up in front of your rack, usually after calling a discard, so the other players can see it.",
          },
          {
            term: "Call",
            definition:
              "Claiming another player's discarded tile to complete a pung, kong, or quint in your hand, instead of waiting to draw it yourself.",
          },
          {
            term: "Mahjong",
            definition:
              "What you call out when you complete a winning hand that matches the card — the word that ends the game.",
          },
          {
            term: "Wall Game",
            definition:
              "A round that ends with the wall of tiles used up and no one completing a hand — no one wins, and the deal usually moves to the next player.",
          },
        ],
      },
    ],
  },
  "beginner-guide": {
    slug: "beginner-guide",
    title: "Beginner Guide",
    description:
      "A step-by-step walkthrough of your first game of American Mahjong — what to bring, how a hand starts, and what actually happens at the table.",
    intro:
      "Your first game of American Mahjong can feel like a lot at once. This guide walks through what happens, in order, so you know what to expect before you sit down.",
    sections: [
      {
        type: "paragraphs",
        heading: "Before you sit down",
        paragraphs: [
          "Bring a copy of the current year's card if you have one — most tables have a few to share, but it's nice to have your own to mark up. You don't need to memorize anything. Even experienced players check the card constantly.",
          "If this is your first time, just say so. Most tables are happy to slow down and explain things as you go.",
        ],
      },
      {
        type: "list",
        heading: "How a hand gets started",
        ordered: true,
        items: [
          "All four players build the wall together, stacking tiles into a square in front of the group.",
          "Tiles are dealt out: 13 tiles to each player, and 14 to the dealer (the dealer always goes first).",
          "Everyone arranges their tiles on their rack, usually sorting by suit, so they're easier to read.",
          "The Charleston happens next — a few rounds of passing tiles with other players to improve your hand before anyone draws or discards. See the Charleston guide for how this works.",
          "Once the Charleston is done, play begins: the dealer discards first, then players take turns drawing a tile and discarding one, working toward a hand on the card.",
        ],
      },
      {
        type: "paragraphs",
        heading: "During play",
        paragraphs: [
          "On your turn, you'll draw a tile and decide whether to keep it or discard it. You're always working toward a specific hand from the card — pick one or two you think you can build early on, and adjust as your tiles change.",
          "You can also call a tile another player discards, if it completes a pung, kong, or quint you're building — you don't have to wait for your own turn. When you call a tile, you expose that group face-up in front of your rack so everyone can see it.",
          "When your 14 tiles fully match a hand on the card, you call \"Mahjong\" and lay your hand down. Everyone checks it against the card before the win counts.",
        ],
      },
      {
        type: "paragraphs",
        heading: "If nobody wins",
        paragraphs: [
          "Sometimes the wall runs out before anyone completes a hand. That's called a wall game — no one wins, and you reset for the next hand.",
        ],
      },
      {
        type: "paragraphs",
        heading: "A few tips for your first few games",
        paragraphs: [
          "It's normal to feel slow at first — everyone does. Ask questions during the Charleston and early turns; that's when there's the most room to talk.",
          "Keep an eye on what other players are exposing (their face-up groups). It's a hint about which hands they might be building, and over time you'll start reading the table.",
          "Once the basics here feel familiar, the Rules guide covers the full game in more detail, and Scoring explains how points work once someone wins.",
        ],
      },
    ],
  },
  rules: {
    slug: "rules",
    title: "Rules",
    description:
      "The full rules of American Mahjong, step by step: setup, dealing, the Charleston, gameplay, and how a hand ends.",
    intro:
      "This page covers the full rules of American Mahjong, from setting up the table to how a hand ends. If you just want the short version, start with the Beginner Guide instead.",
    sections: [
      {
        type: "paragraphs",
        heading: "Setup",
        paragraphs: [
          "You need four players, a set of 152 tiles, four racks, and the current year's card from the National Mah Jongg League (NMJL), which lists the hands you're allowed to build and their point values.",
          "All four players build the wall together: everyone stacks their tiles into a double row in front of them, and the four rows are pushed together into a square in the middle of the table.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Dealing",
        paragraphs: [
          "One player is chosen as the dealer (often by rolling dice or another agreed method). Tiles are dealt from the wall until each player has 13 tiles, and the dealer has 14 — the dealer always starts with one extra tile, since they discard first.",
        ],
      },
      {
        type: "paragraphs",
        heading: "The Charleston",
        paragraphs: [
          "Before anyone draws or discards, players pass tiles to each other in a set pattern to improve their hands. See the Charleston guide for the full walkthrough — it's involved enough to deserve its own page.",
        ],
      },
      {
        type: "list",
        heading: "Gameplay",
        ordered: true,
        items: [
          "The dealer discards a tile to start play.",
          "Going around the table, each player draws a tile (from the wall, or by calling another player's discard) and then discards one.",
          "If a discarded tile completes a pung, kong, or quint you're building, you can call it out of turn instead of waiting to draw it. Calling exposes that group face-up in front of your rack.",
          "Play continues, tile by tile, with everyone working toward one of the hands listed on the card.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Winning",
        paragraphs: [
          "When your 14 tiles fully match a hand on the card — using any exposed groups plus what's left in your hand — you call \"Mahjong.\" The other players check your hand against the card before the win is confirmed. See the Scoring guide for how points are worked out from there.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Wall games",
        paragraphs: [
          "If the wall runs out of tiles before anyone completes a hand, the round ends with no winner — this is called a wall game. Play resets for the next hand, and the deal typically moves to the next player.",
        ],
      },
    ],
  },
  charleston: {
    slug: "charleston",
    title: "The Charleston",
    description:
      "How the Charleston tile-passing phase works in American Mahjong, and basic strategy for what to pass and what to keep.",
    intro:
      "The Charleston happens at the very start of every hand, before anyone draws or discards. It's your chance to trade away tiles you don't want for ones that might actually help you.",
    sections: [
      {
        type: "paragraphs",
        heading: "Why it exists",
        paragraphs: [
          "You're dealt 13 tiles at random, so most starting hands aren't close to any hand on the card. The Charleston lets everyone improve their hand a little before the game really begins, so play doesn't start with four players stuck on unworkable tiles.",
        ],
      },
      {
        type: "paragraphs",
        heading: "How it works",
        paragraphs: [
          "You pass three tiles at a time to another player, and receive three tiles back from someone else, in a set order — first to the player on one side, then across the table, then to the player on your other side. This happens over a few rounds.",
          "You don't have to pass your best tiles — the whole point is to pass tiles you don't need and hope you get something more useful back. You won't always love what you receive, and that's normal.",
          "After the required passes, there's often an optional round where players can agree to pass again, or stop early if everyone's happy with their hand.",
        ],
      },
      {
        type: "paragraphs",
        heading: "What to pass",
        paragraphs: [
          "As a beginner, a simple approach works fine: look at the card, pick a hand or two that seem realistic based on what you already have, and pass tiles that don't fit those hands. Hang on to jokers, pairs, and anything that shows up in several hands on the card — those are worth keeping until you're sure you won't need them.",
        ],
      },
      {
        type: "paragraphs",
        heading: "After the Charleston",
        paragraphs: [
          "Once passing is done, regular play begins: the dealer discards first, and turns move around the table from there. See the Rules guide for what happens next.",
        ],
      },
    ],
  },
  scoring: {
    slug: "scoring",
    title: "Scoring",
    description:
      "How scoring works in American Mahjong: where point values come from, what it takes to go out, and how points are settled between players.",
    intro:
      "Once someone calls \"Mahjong,\" the hand isn't quite over — you still need to work out the score. Here's how it works.",
    sections: [
      {
        type: "paragraphs",
        heading: "Where points come from",
        paragraphs: [
          "Every hand listed on the NMJL card has a point value printed right next to it — that's what you're playing for. Harder or rarer hands are generally worth more. There's also typically a minimum point value a hand needs to be worth for you to go out (call Mahjong) with it — check your current card for the exact number, since it can change year to year.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Concealed vs. exposed hands",
        paragraphs: [
          "A concealed hand — one where you haven't called any tiles or exposed any groups the whole game — is usually worth more than the same hand played with exposures, and the card will often show a separate, higher value for playing it concealed. It's a nice bonus if you can pull it off, but it's harder, since you can't call tiles to speed things along.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Who pays whom",
        paragraphs: [
          "When a hand ends, the losing players pay the winner directly — there's no shared pot. If you're the one who discarded the tile that completed the winning hand, you typically pay more than the other losing players, since your discard is what let the winner go out.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Getting comfortable with it",
        paragraphs: [
          "Scoring feels like a lot at first, but most tables are happy to walk you through it the first few times you win or lose a hand. It gets natural fast once you've seen it happen a few times.",
        ],
      },
    ],
  },
  jokers: {
    slug: "jokers",
    title: "Jokers",
    description:
      "How jokers work in American Mahjong — when they can substitute for other tiles, when they can't, and how to trade for one mid-game.",
    intro:
      "Jokers are one of the most useful tiles in your hand, but they come with rules of their own. Here's what you need to know.",
    sections: [
      {
        type: "paragraphs",
        heading: "What a joker can do",
        paragraphs: [
          "A joker is a wild tile — it can stand in for almost any other tile in a pung, kong, or quint (a group of three, four, or five matching tiles). If a hand on the card calls for three 5 Dots, for example, you could use two real 5 Dots and a joker instead.",
        ],
      },
      {
        type: "paragraphs",
        heading: "What a joker can't do",
        paragraphs: [
          "Jokers can't be used in every hand. Some hands on the card — usually ones built around single tiles and pairs — don't allow jokers at all. The card marks which hands are joker-free, so it's worth checking before you build your hand around one.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Trading for a joker",
        paragraphs: [
          "If another player has an exposed group that includes a joker, you can trade for it: offer the matching real tile plus one extra tile from your hand, and you take the joker for your own hand while they take your two tiles. This is a normal part of play — don't be shy about it if it helps your hand.",
        ],
      },
    ],
  },
  etiquette: {
    slug: "etiquette",
    title: "Etiquette",
    description:
      "Unwritten rules and etiquette for playing American Mahjong with a new group, from table manners to how to handle your first few games.",
    intro:
      "American Mahjong has its own set of table manners, mostly unwritten. Here's what to know before you join a group for the first time.",
    sections: [
      {
        type: "paragraphs",
        heading: "At the table",
        paragraphs: [
          "Don't touch another player's tiles or rack, even to help. If you're not sure whether a hand is complete or a call is valid, ask instead of reaching in.",
          "Keep the game moving at a reasonable pace once you're comfortable with the basics — long pauses on every turn can slow the whole table down. It's completely fine to take your time while you're still learning, though; most groups expect that.",
          "Try to hold your tiles and rack so others can't see them. It's part of the game, not a trust issue.",
        ],
      },
      {
        type: "paragraphs",
        heading: "If you're new",
        paragraphs: [
          "Say so at the start. Most players are glad to slow down, explain a call, or double-check your hand before you go out. Nobody expects a first-timer to know the etiquette below by heart.",
          "Bring your own card if you have one, but it's fine to share with your neighbor if you don't yet.",
        ],
      },
      {
        type: "paragraphs",
        heading: "General courtesy",
        paragraphs: [
          "Show up on time — a missing fourth player holds up the whole table. If you have to cancel, give as much notice as you can.",
          "Keep side conversations light during play so everyone can hear calls and discards. Phones on silent is standard at most tables.",
          "If you're playing at someone's home or a club, it's common to bring a small snack or contribute to the table in some way — ask your host or fellow players what's typical for that group.",
        ],
      },
    ],
  },
};
