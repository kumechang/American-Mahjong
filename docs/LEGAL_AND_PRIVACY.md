# Legal & Privacy Notes

Written from a role-played Legal / Privacy review (business plan ch. 33). It
is a working policy for the team, **not legal advice** — have a licensed US
attorney review `/privacy` and `/terms` before advertising or affiliate
links go live.

## What the site collects today
- Google Analytics 4 (cookies, page views, approximate location, device).
- Cloudflare processes IP addresses to serve and protect the site.
- No accounts, forms, comments or email capture.

## Rules for listing data
1. **Individuals' contact details are stored but never rendered.** The
   `Instructor.contact` column (private emails and phones) is used only for
   internal verification. Do not add it to any page, JSON-LD or export.
   Instructor cards show a name, lesson types, notes and their own website.
2. Club `phone` appears only in `LocalBusiness` JSON-LD. Keep it to
   business numbers; if a club's listed phone is clearly a person's mobile,
   leave it blank.
3. Do not put emails or phone numbers in `notes`, `description` or
   `schedule` (checked 2026-09-30: none present).
4. Never list a private home address (town only).
5. Honor correction and removal requests promptly: set the row to
   `INACTIVE` (or `NEEDS_REVIEW`) with a migration.
6. Keep `beginner_friendly` and similar flags as "the group says" facts;
   don't add reviews, ratings or claims about safety or quality.

## Disclosures
- `/privacy` and `/terms` are linked from the footer and in the sitemap.
- Affiliate/advertising disclosure lives in `/terms` and the footer line.
  When Shop or affiliate links go live, add a plain-language disclosure
  next to the links themselves (FTC endorsement guidance).

## Open items (need a decision or an owner)
- **Contact address**: set `NEXT_PUBLIC_CONTACT_EMAIL` as a Cloudflare
  *build* variable. Until it is set the pages say the address is "being set
  up". Privacy requests, corrections and removals all rely on it.
- **Advertising**: before ads start, add a consent/opt-out mechanism
  ("Do Not Sell or Share My Personal Information" / a CMP) and update
  `/privacy`. Analytics-only use does not need a banner in most US states.
- **Google Analytics settings**: consider turning off Google signals and
  ad personalization in GA4 and setting the shortest data-retention period.
- **Trademark**: "American Mahjong" and NMJL card references are used
  descriptively; do not imply endorsement by the National Mah Jongg League.
