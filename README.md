# American Mahjong Guide

An English-language web platform for American Mahjong: learn the rules, find
beginner-friendly clubs, lessons, and events by city, and start playing.

Concept: **Learn → Find → Play**.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript) via
  [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) (serverless SQLite)
  via [Drizzle ORM](https://orm.drizzle.team/)
- Deploys to Cloudflare Workers (chosen over Prisma + Postgres/Hyperdrive to
  stay on Cloudflare's free tier — see `src/db/schema.ts` for why)

## Data model

`src/db/schema.ts` defines the core entities behind the site's programmatic
SEO / city-page strategy:

- `City` — a published city landing page (e.g. "American Mahjong in Dallas")
- `Club`, `Instructor`, `Event` — scraped/curated local listings, each with
  `sourceUrl`, `lastVerifiedAt`, and `status` for data-freshness tracking
- `Product` — curated affiliate product recommendations for the Shop section

## Getting started

```bash
npm install
npm run db:generate                # generate SQL from src/db/schema.ts
npm run db:migrate:local --file=drizzle/0000_vengeful_rage.sql
npm run db:seed:local              # loads sample data for the Dallas city page
npm run dev
```

`next dev` works for day-to-day development (OpenNext proxies the D1 binding
locally). To test the actual Cloudflare Workers runtime:

```bash
npm run cf:build
npx wrangler dev
```

## Deploying

1. `wrangler login` and `wrangler d1 create american-mahjong-db`, then put
   the real `database_id` it prints into `wrangler.jsonc`.
2. Apply migrations and seed data with `--remote` instead of `--local`
   (`npm run db:migrate:remote -- --file=...`, `npm run db:seed:remote`).
3. Set `NEXT_PUBLIC_SITE_URL` to the real production domain (as a Workers
   environment variable in `wrangler.jsonc`, or on the dashboard) — it
   drives `metadataBase`, `sitemap.xml`, and `robots.txt`. It defaults to
   `https://example.com`, which is fine for local dev only.
4. `npm run cf:deploy`

## SEO

- `/sitemap.xml` — static routes plus every published city, generated from
  D1 at request time (can't be prerendered — see the `force-dynamic` note
  in `src/app/sitemap.ts`)
- `/robots.txt` — points crawlers at the sitemap
- City pages emit `BreadcrumbList`, `LocalBusiness`/`SportsActivityLocation`
  (one per club), and `Event` JSON-LD (schema.org) for each upcoming event

## Site structure

- `/learn` — beginner guides (rules, terms, Charleston, scoring, etiquette)
- `/find` — categories for finding clubs, lessons, instructors, and events
- `/cities` and `/cities/[slug]` — city pages, the core SEO/DB unit
- `/shop` — curated Mahjong sets, tiles, and accessories
- `/community` — beginner and social groups
