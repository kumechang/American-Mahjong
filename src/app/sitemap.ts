import type { MetadataRoute } from "next";
import { eq, max } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities, clubs, instructors, events } from "@/db/schema";
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
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const publishedCities = await db
    .select({ id: cities.id, slug: cities.slug, updatedAt: cities.updatedAt })
    .from(cities)
    .where(eq(cities.published, true));

  // A city page changes when its rows change, not only when the City row does: use the newest update among its visible rows.
  const [clubStamps, instructorStamps, eventStamps] = await Promise.all(
    [clubs, instructors, events].map((t) =>
      db.select({ cityId: t.cityId, at: max(t.updatedAt) }).from(t).where(eq(t.status, "ACTIVE")).groupBy(t.cityId),
    ),
  );
  const newest = new Map<string, string>();
  for (const { cityId, at } of [...clubStamps, ...instructorStamps, ...eventStamps]) {
    if (at && at > (newest.get(cityId) ?? "")) newest.set(cityId, at);
  }

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
    lastModified: new Date(`${[city.updatedAt, newest.get(city.id) ?? ""].sort().at(-1)!.replace(" ", "T")}Z`),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticEntries, ...learnEntries, ...cityEntries];
}
