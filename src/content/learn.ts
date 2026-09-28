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
};
