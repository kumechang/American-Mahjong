import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms for using American Mahjong Guide, including how listings work and our affiliate and advertising disclosure.",
};

const H2 = "text-lg font-semibold text-zinc-900 dark:text-zinc-100";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted">Last updated: September 30, 2026</p>

      <div className="mt-8 space-y-6 text-zinc-600 dark:text-zinc-400">
        <p>
          By using American Mahjong Guide you agree to these terms. If you
          don&apos;t agree, please don&apos;t use the site.
        </p>

        <section>
          <h2 className={H2}>What this site is</h2>
          <p className="mt-2">
            American Mahjong Guide is an independent, informational guide. We
            are not affiliated with the National Mah Jongg League or with any
            club, teacher or venue listed here.
          </p>
        </section>

        <section>
          <h2 className={H2}>Listings are informational</h2>
          <p className="mt-2">
            We work from the sources each listing links to, but schedules,
            prices, locations and availability change, and we can&apos;t
            guarantee any listing is current or accurate. Please confirm
            details with the organizer before you go or pay for anything. We
            are not responsible for what happens at events or lessons, or for
            anything you buy from a listed business. See{" "}
            <Link href="/about" className="underline hover:no-underline">
              how we verify listings
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className={H2}>Affiliate links and advertising</h2>
          <p className="mt-2">
            Some links on the site may be affiliate links, meaning we may earn
            a commission if you buy through them, at no extra cost to you. We
            may also show advertising in the future. Neither affects which
            clubs, teachers or events we list, and listings are not paid
            placements unless clearly marked as sponsored.
          </p>
        </section>

        <section>
          <h2 className={H2}>Content and use of the site</h2>
          <p className="mt-2">
            The text and design of this site belong to American Mahjong Guide.
            You may share links and short quotations with credit, but please
            don&apos;t copy the site or scrape its listings in bulk. Names and
            marks of listed businesses belong to their owners. Don&apos;t use
            the site in a way that harms it or other visitors.
          </p>
        </section>

        <section>
          <h2 className={H2}>Corrections and removals</h2>
          <p className="mt-2">
            If you run a listed club or teach and want a listing corrected or
            removed, contact <ContactLink /> and we will act on it promptly.
          </p>
        </section>

        <section>
          <h2 className={H2}>Disclaimer and limits</h2>
          <p className="mt-2">
            The site is provided &ldquo;as is,&rdquo; without warranties of
            any kind. To the fullest extent permitted by law, American Mahjong
            Guide is not liable for any loss arising from your use of the site
            or reliance on a listing. We may change these terms; the date above
            shows the latest version.
          </p>
        </section>
      </div>
    </div>
  );
}
