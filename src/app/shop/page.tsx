import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { products } from "@/db/schema";

export const metadata: Metadata = {
  title: "American Mahjong Sets & Supplies",
  description:
    "Curated American Mahjong sets, tiles, cards, and accessories for beginners.",
};

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so this route can't be statically
// prerendered or revalidated on a timer — it's rendered per request.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const db = await getDb();
  const productRows = await db
    .select()
    .from(products)
    .orderBy(asc(products.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        American Mahjong sets &amp; supplies
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Not sure what to buy? These are the sets, tiles, and accessories we
        recommend for beginners. This page may contain affiliate links.
      </p>

      {productRows.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-black/20 p-6 text-sm text-muted dark:border-white/20">
          No products yet. Run the database seed script to add sample
          products.
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {productRows.map((product) => (
            <li
              key={product.id}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <h2 className="font-semibold">{product.name}</h2>
              {product.beginnerPick && (
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  Beginner Pick
                </span>
              )}
              {product.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {product.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
