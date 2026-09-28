# American Mahjong Guide

An English-language web platform for American Mahjong: learn the rules, find
beginner-friendly clubs, lessons, and events by city, and start playing.

Concept: **Learn → Find → Play**.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) + PostgreSQL

## Data model

`prisma/schema.prisma` defines the core entities behind the site's
programmatic SEO / city-page strategy:

- `City` — a published city landing page (e.g. "American Mahjong in Dallas")
- `Club`, `Instructor`, `Event` — scraped/curated local listings, each with
  `sourceUrl`, `lastVerifiedAt`, and `status` for data-freshness tracking
- `Product` — curated affiliate product recommendations for the Shop section

## Getting started

```bash
cp .env.example .env   # then set DATABASE_URL to a local Postgres instance
npm install
npx prisma migrate dev
npx prisma db seed     # loads sample data for the Dallas city page
npm run dev
```

## Site structure

- `/learn` — beginner guides (rules, terms, Charleston, scoring, etiquette)
- `/find` — categories for finding clubs, lessons, instructors, and events
- `/cities` and `/cities/[slug]` — city pages, the core SEO/DB unit
- `/shop` — curated Mahjong sets, tiles, and accessories
- `/community` — beginner and social groups
