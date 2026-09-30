// Single source of truth for the site's canonical origin, used by
// metadataBase, sitemap.xml, and robots.txt. Set NEXT_PUBLIC_SITE_URL to
// the real production domain once one exists (e.g. as a Cloudflare Workers
// environment variable) — until then, sitemap/canonical URLs point at this
// placeholder, which is harmless for local dev but must be set before the
// site is actually deployed for SEO to work correctly.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"
).replace(/\/$/, "");

// Where privacy requests, listing corrections and removal requests go.
// Set NEXT_PUBLIC_CONTACT_EMAIL (a *build* variable in Cloudflare, like the
// other NEXT_PUBLIC_* values). Until it is set, pages say so plainly rather
// than showing a made-up address.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
