# Bing Webmaster Tools: SEO Recommendations and IndexNow

Handled on 2026-10-27, after the same checks were done for another site. No Bing export was available for this site, so the
checks were run against production (`sitemap.xml`, 91 URLs) instead.

## What was checked and what was done

| Check | Result | Action |
|---|---|---|
| IndexNow not adopted | Not set up | **Added**: key file, submit script, workflow (below) |
| Meta descriptions too short | 8 pages were 47–61 characters: all learn guides, plus city pages such as Denver, Memphis, Atlanta (57–58) | **Fixed**: guides use their fuller topic description (113–141 characters); city pages end with "See venues, times and how to join." (92–97) |
| Missing meta description | None | – |
| Long titles | City titles run 65–75 characters (Google truncates near 60) | Not changed: titles follow `docs/CITY_PAGE_POLICY.md` §1, and changing many titles at once makes the effect hard to measure |
| Inbound links from quality domains | Cannot be fixed in code | See below |

## IndexNow

- Key file: `public/59d42f4bd90bc2d0734077307777ba67.txt` (live at `https://mahjong-map.com/59d42f4bd90bc2d0734077307777ba67.txt`; its content is the key itself, which is public by design).
- `scripts/indexnow.mjs`: `--dry-run`, default = sitemap URLs whose `lastmod` is within 2 days, `--since=N`, `--all`, `--url=<URL>` (repeatable), `--wait=<minutes>` (waits for the key file to be live). It sends nothing until the key file is reachable.
- `.github/workflows/indexnow.yml` (manual run, inputs `all` and `since`). `auto-import.yml` starts it after every automatic import: city data changes when the migration is applied, and the sitemap `lastmod` (newest update among a city's ACTIVE rows) changes with it, so changed city pages are announced without waiting for the deploy.
- First run after the key file is deployed: run the `indexnow` workflow once with `all=true`.
- IndexNow reaches Bing, Yandex, Naver, Seznam and others. **Google does not take part**; Google still learns about pages from the sitemap and Search Console. A submission is a notice, not a promise to index.
- Alternative or addition: Cloudflare "Crawler Hints" (Caching > Configuration) sends IndexNow notices from Cloudflare's side.

## Inbound links (owner's work)

Links from other sites can't be added in code. Natural ways to earn them: ask clubs and teachers listed here to link to their city page; ask local community pages, libraries and JCCs that run mahjong programs; share the learn guides (Charleston, scoring, jokers) where beginners ask questions. Avoid bought links, mass link swaps and automated posting.

## After the next deploy

1. Check `https://mahjong-map.com/59d42f4bd90bc2d0734077307777ba67.txt`.
2. Run the `indexnow` workflow with `all=true`.
3. In Bing Webmaster Tools, check the IndexNow page for received submissions, and look at SEO Recommendations again after 1–2 weeks.

## Site scan: "title too long" (2026-10-27)

`PagesByIssueCategory` listed 66 city pages with titles that were too long (all `/cities/<slug>`). Cause: the page title plus the
site-wide suffix " | American Mahjong Guide" (25 characters) came to 65–75. Fix: city titles are now absolute (no suffix) and at most
60 characters, with shorter fallbacks for long city names (checked on all 74 local city pages: longest 60, no duplicates).
The `/about` title no longer repeats the site name, and inline SVGs no longer contain `<title>` elements (they use `aria-label`
and `<desc>`), so scanners can't count them as extra page titles. Re-scan in Bing after the next deploy and run the `indexnow`
workflow with `all=true`: the sitemap `lastmod` does not change for a title-only edit.
