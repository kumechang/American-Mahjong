import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Next.js fetches a "?_rsc=" copy of a page when a link is prefetched; Googlebot's renderer triggers these too and they were
      // a large share of the crawl budget (Search Console crawl stats, 2026-10). They carry no content of their own.
      disallow: ["/*?_rsc="],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
