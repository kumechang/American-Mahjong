import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { eq, and, ne, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cities, clubs, instructors, events } from "@/db/schema";
import { SITE_URL } from "@/lib/site";
import { ClubFilterList } from "@/components/ClubFilterList";
import { VerifiedNote } from "@/components/VerifiedNote";

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

  // Only ACTIVE rows are shown publicly — NEEDS_REVIEW means a researcher
  // wasn't fully confident in the data (docs/DATA_COLLECTION.md), and
  // INACTIVE means it's known stale. Both stay in the database (so the
  // work isn't lost and re-verification can flip them to ACTIVE) without
  // ever reaching this page.
  const [cityClubs, cityInstructors, cityEvents] = await Promise.all([
    db
      .select()
      .from(clubs)
      .where(and(eq(clubs.cityId, city.id), eq(clubs.status, "ACTIVE")))
      .orderBy(asc(clubs.name)),
    db
      .select()
      .from(instructors)
      .where(
        and(eq(instructors.cityId, city.id), eq(instructors.status, "ACTIVE")),
      )
      .orderBy(asc(instructors.name)),
    db
      .select()
      .from(events)
      .where(and(eq(events.cityId, city.id), eq(events.status, "ACTIVE")))
      .orderBy(asc(events.eventDate))
      .limit(10),
  ]);

  return { ...city, clubs: cityClubs, instructors: cityInstructors, events: cityEvents };
}

async function getNearbyCities(city: { id: string; slug: string; state: string }) {
  const db = await getDb();
  return db
    .select({ slug: cities.slug, name: cities.name, state: cities.state })
    .from(cities)
    .where(
      and(
        eq(cities.published, true),
        eq(cities.state, city.state),
        ne(cities.id, city.id),
      ),
    )
    .orderBy(asc(cities.name))
    .limit(6);
}

// Per docs/CITY_PAGE_POLICY.md §1 — never claim a data type the city
// doesn't actually have any ACTIVE rows for.
function buildMetadataCopy(city: {
  name: string;
  state: string;
  clubs: unknown[];
  instructors: unknown[];
  events: unknown[];
}) {
  const hasClubs = city.clubs.length > 0;
  const hasInstructors = city.instructors.length > 0;
  const hasEvents = city.events.length > 0;

  const titleParts: string[] = [];
  if (hasClubs) {
    titleParts.push(`${city.clubs.length} Club${city.clubs.length === 1 ? "" : "s"}`);
  }
  if (hasEvents) {
    titleParts.push(`${city.events.length} Event${city.events.length === 1 ? "" : "s"}`);
  }
  if (!hasClubs && hasInstructors) titleParts.push("Lessons");

  const title = titleParts.length
    ? `American Mahjong in ${city.name}, ${city.state} — ${titleParts.join(" & ")}`
    : `American Mahjong in ${city.name}, ${city.state}`;

  const descParts: string[] = [];
  if (hasClubs) {
    descParts.push(
      `${city.clubs.length} beginner-friendly American Mahjong club${city.clubs.length === 1 ? "" : "s"} in ${city.name}, ${city.state}`,
    );
  } else if (hasInstructors) {
    descParts.push(`American Mahjong lessons in ${city.name}, ${city.state}`);
  } else {
    descParts.push(`American Mahjong in ${city.name}, ${city.state}`);
  }
  if (hasEvents) {
    descParts.push(
      `plus ${city.events.length} upcoming event${city.events.length === 1 ? "" : "s"}`,
    );
  }

  return { title, description: `${descParts.join(", ")}.` };
}

export async function generateMetadata({
  params,
}: PageProps<"/cities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city) {
    return {};
  }

  return buildMetadataCopy(city);
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
    const club = city.clubs.find((club) => club.id === event.clubId);
    const venueName = event.venue ?? club?.name ?? `${city.name}, ${city.state}`;

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
      ...(club
        ? {
            organizer: {
              "@type": "Organization",
              name: club.name,
              ...(club.website ? { url: club.website } : {}),
            },
          }
        : {}),
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

function buildClubJsonLd(city: City, club: City["clubs"][number]) {
  return {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    name: club.name,
    ...(club.description ? { description: club.description } : {}),
    ...(club.website ? { url: club.website } : {}),
    ...(club.phone ? { telephone: club.phone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(club.address ? { streetAddress: club.address } : {}),
      addressLocality: city.name,
      addressRegion: city.state,
    },
    ...(club.latitude != null && club.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: club.latitude,
            longitude: club.longitude,
          },
        }
      : {}),
    ...(club.free ? { isAccessibleForFree: true } : {}),
    ...(club.sourceUrl ? { sameAs: club.sourceUrl } : {}),
  };
}

function buildClubsJsonLd(city: City) {
  return city.clubs.map((club) => buildClubJsonLd(city, club));
}

// Wraps the club listing as an ItemList, per docs/CITY_PAGE_POLICY.md §8 —
// separate from the individual LocalBusiness entries above.
function buildClubsItemListJsonLd(city: City) {
  if (city.clubs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: city.clubs.map((club, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildClubJsonLd(city, club),
    })),
  };
}

export default async function CityPage({
  params,
}: PageProps<"/cities/[slug]">) {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city || !city.published) {
    notFound();
  }

  const nearbyCities = await getNearbyCities(city);

  const clubsItemList = buildClubsItemListJsonLd(city);
  const jsonLd = [
    buildBreadcrumbJsonLd(city),
    ...(clubsItemList ? [clubsItemList] : []),
    ...buildClubsJsonLd(city),
    ...buildEventsJsonLd(city),
  ];

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
        Clubs, lessons, and events near {city.name}, {city.state} — filter
        by beginner-friendly, free, lessons, open play, or social.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Mahjong Clubs</h2>
        {city.clubs.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No clubs listed yet.</p>
        ) : (
          <div className="mt-4">
            <ClubFilterList clubs={city.clubs} />
          </div>
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
                {instructor.notes && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {instructor.notes}
                  </p>
                )}
                {instructor.website && (
                  <p className="mt-2 text-sm">
                    <a
                      href={instructor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Visit {instructor.name}&apos;s website
                    </a>
                  </p>
                )}
                <VerifiedNote
                  lastVerifiedAt={instructor.lastVerifiedAt}
                  sourceUrl={instructor.sourceUrl}
                />
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

      {nearbyCities.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Nearby Cities</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {nearbyCities.map((nearby) => (
              <li key={nearby.slug}>
                <Link
                  href={`/cities/${nearby.slug}`}
                  className="inline-block rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {nearby.name}, {nearby.state}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
