import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/db/schema";

/**
 * The D1 binding is only available per-request via the Cloudflare context
 * (there's no long-lived connection to hold in a module-level singleton).
 */
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}
