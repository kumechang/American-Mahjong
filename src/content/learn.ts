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
      "A beginner-friendly introduction to American Mahjong: how it's played, what makes it different from other mahjong variants, and why it has become so popular in the US.",
    intro:
      "American Mahjong is a tile-based game for four players, built around collecting a hand of tiles that matches one of the hands on an official card. If you've never played, don't worry — by the end of this page, you'll know what's going on the first time you sit down at a table.",
    sections: [
      {
        type: "paragraphs",
        heading: "The basics",
        paragraphs: [
          "Four players sit around a table, each with a rack to hold their tiles. Instead of cards, you play with 152 tiles. There are three suits — Bams, Dots and Craks — numbered 1 through 9. You'll also find Winds, Dragons, Flowers and Jokers.",
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
          "If you've heard of mahjong before, it may have been the Chinese game, or Japanese Riichi. American Mahjong is its own game: it uses jokers, which most other styles don't. And instead of building any hand you like, you're working from that annual NMJL card. Even the scoring and the way people talk at the table feel different. If you've played one of those other versions, expect a genuinely different game, not a slight variation on the one you know.",
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
      "A plain-English glossary of American Mahjong terms — Charleston, jokers, exposures, the card and more — for players just getting started.",
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
              "A wild tile that can stand in for other tiles in a group of three or more — but never for a single tile or a pair. There are 8 jokers in a standard set.",
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
              "A set of four matching tiles (jokers can fill in), such as four Red Dragons.",
          },
          {
            term: "Quint",
            definition:
              "A set of five matching tiles. Most tiles come in fours, so a quint usually needs jokers. Flowers are the exception: a standard set has eight of them.",
          },
          {
            term: "Sextet",
            definition:
              "A set of six matching tiles, made with jokers (or with Flowers, of which a standard set has eight).",
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
              "Claiming another player's discarded tile to complete a pung, kong or quint — or to win with Mahjong — instead of waiting to draw it yourself. A discarded joker can't be called.",
          },
          {
            term: "Mahjong",
            definition:
              "What you call out when you complete a winning hand that matches the card — the word that ends the game.",
          },
          {
            term: "Round",
            definition:
              "One deal of the tiles, from the Charleston to the moment someone wins or the wall runs out. On this site, \"round\" means one deal, and \"hand\" means the tiles you hold or a combination listed on the card.",
          },
          {
            term: "Open Play",
            definition:
              "Casual games that anyone who knows the rules can join, usually without a teacher.",
          },
          {
            term: "Guided Play",
            definition:
              "Games with a teacher at or near the table who helps as you go.",
          },
          {
            term: "Wall Game",
            definition:
              "A round that ends with the wall of tiles used up and no one completing a hand — no one wins, and the deal passes to the next player.",
          },
        ],
      },
    ],
  },
  "beginner-guide": {
    slug: "beginner-guide",
    title: "Beginner Guide",
    description:
      "A step-by-step walkthrough of your first game of American Mahjong — what to bring, how a round starts, and what actually happens at the table.",
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
        heading: "How a round gets started",
        ordered: true,
        items: [
          "All four players build the wall together, stacking tiles into a square in the middle of the table.",
          "You deal out 13 tiles to each player, and 14 to the dealer (the dealer always goes first).",
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
          "You can also call a tile another player discards if it completes a pung, kong or quint you're building — or completes your whole hand — without waiting for your own turn. When you call a tile, you expose that group face-up in front of your rack so everyone can see it. The exception is a hand marked C on the card (see Scoring): for those hands, you can only claim a discard if it is the very last tile that completes Mahjong.",
          "When your 14 tiles fully match a hand on the card, you call \"Mahjong\" and lay your hand down. Everyone checks it against the card before the win counts.",
        ],
      },
      {
        type: "paragraphs",
        heading: "If nobody wins",
        paragraphs: [
          "Sometimes the wall runs out before anyone completes a hand. That's called a wall game — no one wins, and you reset for the next round.",
        ],
      },
      {
        type: "paragraphs",
        heading: "A few tips for your first few games",
        paragraphs: [
          "It's normal to feel slow at first — everyone does. Ask questions during the Charleston and the first few turns, while the pace is slower.",
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
      "The full rules of American Mahjong, step by step: setup, dealing, the Charleston, gameplay, and how a round ends.",
    intro:
      "This page covers the full rules of American Mahjong, from setting up the table to how a round ends. If you just want the short version, start with the Beginner Guide instead.",
    sections: [
      {
        type: "paragraphs",
        heading: "Setup",
        paragraphs: [
          "You need four players, a set of 152 tiles, four racks, and the current year's card from the National Mah Jongg League (NMJL), which lists the hands you're allowed to build and their point values.",
          "All four players build the wall together: everyone stacks their tiles into a double row in front of them, and together you push the four rows into a square in the middle of the table.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Dealing",
        paragraphs: [
          "One player becomes the dealer — often by rolling dice, or however your group prefers. Tiles are dealt from the wall until each player has 13 tiles, and the dealer has 14 — the dealer always starts with one extra tile, since they discard first.",
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
          "Going around the table (counterclockwise), each player takes a turn: you either draw a tile from the wall or, when it's allowed, claim the tile that was just discarded. Then you discard one tile.",
          "If a discarded tile completes a pung, kong or quint you're building, you can call it out of turn instead of waiting to draw it. Calling exposes that group face-up in front of your rack. You can also call a discard to complete your whole hand. Discarded jokers can't be called. Call promptly, before the next player draws. For hands marked C on the card, you can only call the last discard that completes Mahjong.",
          "Play continues, tile by tile, with everyone working toward one of the hands listed on the card.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Winning",
        paragraphs: [
          "When your 14 tiles fully match a hand on the card — using any exposed groups plus what's left in your hand — you call \"Mahjong.\" The other players check your hand against the card before the win counts. See the Scoring guide for how points are worked out from there.",
          "If two players want the same discard, Mahjong beats a pung, kong or quint call. Otherwise the player who would play next gets it.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Dead hands",
        paragraphs: [
          "A hand can go dead — for example, if you call Mahjong on a hand that doesn't match the card, or your tile count is wrong. A player with a dead hand stays at the table but can no longer call tiles, declare Mahjong, or take turns drawing and discarding for that round. The other players carry on without them. Your group can explain how it handles these cases.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Wall games",
        paragraphs: [
          "If the wall runs out of tiles before anyone completes a hand, the round ends with no winner — this is called a wall game. The last tile is played like any other: if the final discard completes someone's hand, that player can still call Mahjong. If nobody can, it's a wall game. After a wall game, the deal passes to the next player, just as it does after a win. Some groups have house rules, so check with yours.",
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
      "The Charleston is a set of tile swaps at the very start of every round, before anyone draws or discards. It's your chance to trade away tiles you don't want for ones that might actually help you.",
    sections: [
      {
        type: "paragraphs",
        heading: "Why it exists",
        paragraphs: [
          "You're dealt 13 tiles at random, so most starting hands aren't close to any hand on the card (the yearly list of winning hands from the National Mah Jongg League). The Charleston lets everyone improve their hand a little before the game really begins, so play doesn't start with four players stuck holding tiles that don't fit together.",
        ],
      },
      {
        type: "paragraphs",
        heading: "How it works",
        paragraphs: [
          "The first round is required. You pass three tiles at a time: first to your right, then across the table, then to your left. Each time you pass, another player passes three tiles to you. On the last pass of the round (to your left), you can pass \"blind,\" which means handing along one, two or all three of the tiles you just received without looking at them. You fill in the rest from your own rack.",
          "The second round is optional, and all four players have to agree to it before it starts. If anyone says no, you skip the second round. It runs in the opposite order: left, across, then right, and the last pass (to your right) can be blind too.",
          "After that, you and the player across from you can agree to a courtesy pass, one last swap of up to three tiles.",
          "The idea is to let go of tiles you don't need and hope for something more useful in return. You won't always love what you receive, and that's normal.",
        ],
      },
      {
        type: "paragraphs",
        heading: "What to pass",
        paragraphs: [
          "As a beginner, a simple approach works fine: look at the card, pick a hand or two that seem realistic based on what you already have, and pass tiles that don't fit those hands. Jokers can never be passed, so they stay with you. Hang on to pairs (two matching tiles) and any tile that shows up in several hands on the card, at least until you're sure you won't need them.",
        ],
      },
      {
        type: "paragraphs",
        heading: "After the Charleston",
        paragraphs: [
          "Once passing is done, regular play begins. The dealer discards first, and turns move to the right (counterclockwise) from there. See the Rules guide for what happens next.",
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
      "Once someone calls \"Mahjong,\" the round isn't quite over — you still need to work out the score. Here's how it works.",
    sections: [
      {
        type: "paragraphs",
        heading: "Where points come from",
        paragraphs: [
          "Every hand on the National Mah Jongg League (NMJL) card has a point value printed next to it. Harder or rarer hands are generally worth more. Check your current card for the exact numbers, since they can change from year to year.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Concealed vs. exposed hands",
        paragraphs: [
          "Some hands on the card must be completed concealed. That means you keep all your tiles on your rack and don't set any groups face-up on the table while you build the hand. The card marks these hands with a C. The one exception: you may claim a discard if it is the very last tile that completes Mahjong. Hands marked X can include exposed groups. Concealed hands are often worth more, but they're harder to complete, since you can't call discards to build them.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Who pays whom",
        paragraphs: [
          "When someone wins, the other three players pay the winner directly. There's no shared pot. Under the standard rules, here's how much each person pays:",
        ],
      },
      {
        type: "list",
        items: [
          "If you threw the tile that completed the winning hand, you pay double. The other two players pay the regular amount.",
          "If the winner drew the winning tile from the wall, all three players pay double.",
          "Some hands also pay double when the winner used no jokers. This doesn't apply to every hand (for example, not to Singles and Pairs), so check your current card.",
          "There's no bonus for being the dealer.",
        ],
      },
      {
        type: "paragraphs",
        paragraphs: [
          "Some groups add their own house rules, so it's worth asking before you start.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Getting comfortable with it",
        paragraphs: [
          "Scoring can seem complicated at first, but most tables are happy to walk you through it the first few times you win or lose a hand. After you've seen it a couple of times, it starts to feel natural.",
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
          "A joker is a wild tile — it can stand in for any other tile in a group of three or more matching tiles: a pung, kong, quint or sextet (three, four, five or six tiles). If a hand on the card calls for three 5 Dots, for example, you could use two real 5 Dots and a joker instead.",
        ],
      },
      {
        type: "paragraphs",
        heading: "What a joker can't do",
        paragraphs: [
          "Jokers can never be used for a single tile or as part of a pair — that's true on every hand on the card. Some hands go further and don't allow jokers anywhere at all; the card marks which ones, so it's worth checking before you build around one.",
        ],
      },
      {
        type: "paragraphs",
        heading: "Trading for a joker",
        paragraphs: [
          "If an exposed group on the table includes a joker, and you're holding the real tile that joker stands for, you can swap on your turn, after you've drawn or claimed a tile and before you discard: put your tile into the group and take the joker for your own hand. It's a one-for-one swap, and you can use the joker right away. This works with other players' exposures and your own, and it's a normal part of play — don't be shy about it if it helps your hand. Remember that jokers can't be passed in the Charleston, and a discarded joker can't be called.",
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
          "In most groups, you say the name of a tile out loud when you discard it, so everyone can hear it. Keep the game moving at a reasonable pace once you're comfortable with the basics — long pauses on every turn can slow the whole table down. It's completely fine to take your time while you're still learning — most groups expect that.",
          "Try to hold your tiles and rack so others can't see them. It's part of the game, not a trust issue. In most groups it's also polite not to comment on anyone's hand while a game is in progress, and to make your calls clearly.",
        ],
      },
      {
        type: "paragraphs",
        heading: "If you're new",
        paragraphs: [
          "Say so at the start. Most players are glad to slow down, explain a call or double-check your hand before you go out. Nobody expects a first-timer to know all of this by heart.",
          "Bring your own card if you have one, but it's fine to share with your neighbor if you don't yet.",
        ],
      },
      {
        type: "paragraphs",
        heading: "General courtesy",
        paragraphs: [
          "Show up on time — a missing fourth player holds up the whole table. If you have to cancel, give as much notice as you can.",
          "Keep side conversations light during play so everyone can hear calls and discards. Keeping your phone on silent is standard at most tables.",
          "If you're playing at someone's home or a club, it's common to bring a small snack or contribute to the table in some way — ask your host or fellow players what's typical for that group.",
        ],
      },
    ],
  },
};
