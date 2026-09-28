// Single source of truth for the site's canonical origin, used by
// metadataBase, sitemap.xml, and robots.txt. Set NEXT_PUBLIC_SITE_URL to
// the real production domain once one exists (e.g. as a Cloudflare Workers
// environment variable) — until then, sitemap/canonical URLs point at this
// placeholder, which is harmless for local dev but must be set before the
// site is actually deployed for SEO to work correctly.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"
).replace(/\/$/, "");
