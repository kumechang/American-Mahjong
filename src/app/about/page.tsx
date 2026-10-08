import type { Metadata } from "next";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = {
  title: "About American Mahjong Guide",
  description:
    "How American Mahjong Guide researches and verifies the clubs, lessons, and events it lists.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">
        About American Mahjong Guide
      </h1>

      <div className="mt-8 space-y-6 text-zinc-600 dark:text-zinc-400">
        <p>
          American Mahjong Guide helps people who are new to American
          Mahjong — or coming back to it after years away — learn the game
          and find real, local places to play.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            How we research listings
          </h2>
          <p className="mt-2">
            Every club, instructor, and event listed here is researched from
            primary sources — a club&apos;s own website, its official
            Eventbrite or Meetup page, and similar. We never scrape listings
            wholesale or invent details. If something can&apos;t be verified
            from a real source, it stays out of the public listing until it
            can be.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            What a listing means — and doesn&apos;t mean
          </h2>
          <p className="mt-2">
            Including a club or instructor means we confirmed it exists and
            found details like whether it welcomes beginners, from the
            club&apos;s own materials. It isn&apos;t a review — we
            haven&apos;t visited in person or played there ourselves.
            Anything you see described as &ldquo;beginner-friendly&rdquo; or
            &ldquo;social&rdquo; is based on what the club itself says, not
            our own judgment. Always feel free to reach out to a club
            directly if you&apos;re unsure whether it&apos;s a fit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Keeping listings current
          </h2>
          <p className="mt-2">
            We re-check listings on a regular cycle. Each club, instructor,
            and event card shows when it was last verified and links to its
            source, so you can always confirm details yourself before
            visiting — especially for anything shown as not recently
            confirmed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Something wrong?
          </h2>
          <p className="mt-2">
            If a listing is out of date or inaccurate, the source link on
            its card is the fastest way to check the original information
            yourself. To report a correction, or to ask for a listing to be
            changed or removed, contact <ContactLink />.
          </p>
        </section>
      </div>
    </div>
  );
}
