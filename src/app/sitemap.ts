import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities } from "@/db/schema";
import { SITE_URL } from "@/lib/site";
import { LEARN_TOPIC_META } from "@/content/learn";

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so the city list below can't be
// baked in at build time — this route is rendered per request instead.
export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "",
  "/learn",
  "/find",
  "/cities",
  "/shop",
  "/community",
  "/about",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const publishedCities = await db
    .select({ slug: cities.slug, updatedAt: cities.updatedAt })
    .from(cities)
    .where(eq(cities.published, true));

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const learnEntries: MetadataRoute.Sitemap = LEARN_TOPIC_META.map(
    ({ slug }) => ({
      url: `${SITE_URL}/learn/${slug}`,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  const cityEntries: MetadataRoute.Sitemap = publishedCities.map((city) => ({
    url: `${SITE_URL}/cities/${city.slug}`,
    lastModified: new Date(city.updatedAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticEntries, ...learnEntries, ...cityEntries];
}
