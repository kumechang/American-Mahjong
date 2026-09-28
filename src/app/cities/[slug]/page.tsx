import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities, clubs, instructors, events } from "@/db/schema";
import { SITE_URL } from "@/lib/site";

// The D1 binding is only available at request time (in the Workers
// runtime), not during `next build`, so this route can't be statically
// prerendered or revalidated on a timer — it's rendered per request.
export const dynamic = "force-dynamic";

async function getCity(slug: string) {
  const db = await getDb();
  const [city] = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, slug))
    .limit(1);

  if (!city) {
    return null;
  }

  const [cityClubs, cityInstructors, cityEvents] = await Promise.all([
    db
      .select()
      .from(clubs)
      .where(eq(clubs.cityId, city.id))
      .orderBy(asc(clubs.name)),
    db
      .select()
      .from(instructors)
      .where(eq(instructors.cityId, city.id))
      .orderBy(asc(instructors.name)),
    db
      .select()
      .from(events)
      .where(eq(events.cityId, city.id))
      .orderBy(asc(events.eventDate))
      .limit(10),
  ]);

  return { ...city, clubs: cityClubs, instructors: cityInstructors, events: cityEvents };
}

export async function generateMetadata({
  params,
}: PageProps<"/cities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city) {
    return {};
  }

  return {
    title: `American Mahjong in ${city.name}`,
    description: `Find beginner-friendly American Mahjong clubs, lessons, instructors, and events in ${city.name}, ${city.state}.`,
  };
}

function formatEventDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

type City = NonNullable<Awaited<ReturnType<typeof getCity>>>;

function buildBreadcrumbJsonLd(city: City) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cities",
        item: `${SITE_URL}/cities`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: city.name,
        item: `${SITE_URL}/cities/${city.slug}`,
      },
    ],
  };
}

function buildEventsJsonLd(city: City) {
  return city.events.map((event) => {
    const venueName =
      event.venue ??
      city.clubs.find((club) => club.id === event.clubId)?.name ??
      `${city.name}, ${city.state}`;

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.name,
      // eventDate is stored as a naive "YYYY-MM-DD HH:MM:SS" string (no
      // timezone), so normalize it to ISO 8601 for schema.org/Google.
      startDate: new Date(`${event.eventDate.replace(" ", "T")}Z`).toISOString(),
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: venueName,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.state,
        },
      },
      ...(event.registrationUrl
        ? {
            offers: {
              "@type": "Offer",
              url: event.registrationUrl,
              price: event.price ?? 0,
              priceCurrency: "USD",
            },
          }
        : {}),
    };
  });
}

export default async function CityPage({
  params,
}: PageProps<"/cities/[slug]">) {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city || !city.published) {
    notFound();
  }

  const beginnerClubs = city.clubs.filter((club) => club.beginnerFriendly);
  const jsonLd = [buildBreadcrumbJsonLd(city), ...buildEventsJsonLd(city)];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {jsonLd.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}

      <h1 className="text-3xl font-bold tracking-tight">
        American Mahjong in {city.name}
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Beginner-friendly clubs, lessons, and events near {city.name},{" "}
        {city.state}.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Beginner-Friendly Mahjong</h2>
        {beginnerClubs.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No beginner-friendly clubs listed yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {beginnerClubs.map((club) => (
              <li
                key={club.id}
                className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"
              >
                <h3 className="font-semibold">{club.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {club.beginnerFriendly && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      Beginner Friendly
                    </span>
                  )}
                  {club.lessonsAvailable && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Lessons Available
                    </span>
                  )}
                  {club.free && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Free
                    </span>
                  )}
                </div>
                {club.schedule && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {club.schedule}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">American Mahjong Lessons</h2>
        {city.instructors.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No instructors listed yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {city.instructors.map((instructor) => (
              <li
                key={instructor.id}
                className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"
              >
                <h3 className="font-semibold">{instructor.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {instructor.privateLesson && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Private Lessons
                    </span>
                  )}
                  {instructor.groupLesson && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Group Lessons
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        {city.events.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No upcoming events listed yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/10 rounded-xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900">
            {city.events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <span className="font-medium">{event.name}</span>
                <span className="text-sm text-zinc-500">
                  {formatEventDate(event.eventDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
