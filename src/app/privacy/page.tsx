import type { Metadata } from "next";
import { ContactLink } from "@/components/ContactLink";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What American Mahjong Guide collects when you visit, how it is used, and how to reach us about your information.",
};

const H2 = "text-lg font-semibold text-zinc-900 dark:text-zinc-100";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: September 30, 2026</p>

      <div className="mt-8 space-y-6 text-zinc-600 dark:text-zinc-400">
        <p>
          American Mahjong Guide is a free guide to learning American Mahjong
          and finding clubs, lessons and events. You don&apos;t need an account
          to use it, and we don&apos;t ask you to fill in forms. This page
          explains the small amount of information the site does collect.
        </p>

        <section>
          <h2 className={H2}>Information we collect</h2>
          <p className="mt-2">
            When you visit, we use Google Analytics to measure how the site is
            used. Google Analytics uses cookies and similar technology to
            collect information such as the pages you view, the time you spend
            on them, your approximate location (city or region), your device
            and browser type, and how you arrived at the site. Our hosting
            provider, Cloudflare, also processes standard technical data such
            as your IP address in order to deliver the site and protect it from
            abuse.
          </p>
          <p className="mt-2">
            We do not collect your name, email address or other contact details
            through the site, and we do not knowingly collect information from
            children under 13.
          </p>
        </section>

        <section>
          <h2 className={H2}>How we use it</h2>
          <p className="mt-2">
            We use this information to understand which pages help people,
            find broken pages, and decide which cities and topics to add next.
            We do not use it to identify individual visitors.
          </p>
        </section>

        <section>
          <h2 className={H2}>We do not sell your information</h2>
          <p className="mt-2">
            We do not sell your personal information. Analytics data is
            processed for us by Google under its own terms. If we add
            advertising in the future, we will update this page first and
            explain what changes and how to opt out.
          </p>
        </section>

        <section>
          <h2 className={H2}>Cookies and your choices</h2>
          <p className="mt-2">
            You can block or delete cookies in your browser settings, and use
            Google&apos;s{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              className="underline hover:no-underline"
              rel="noopener noreferrer"
            >
              Analytics opt-out browser add-on
            </a>
            . Browser privacy signals such as Global Privacy Control are
            respected by Google Analytics where supported. The site works
            normally without cookies.
          </p>
        </section>

        <section>
          <h2 className={H2}>Listings of clubs, teachers and events</h2>
          <p className="mt-2">
            The clubs, instructors and events on this site are compiled from
            information those groups and people have published themselves,
            such as their own websites and event pages. We list business
            details (names, websites, venues and schedules). We do not publish
            private email addresses or phone numbers of individual teachers on
            the site. If you are listed and want a listing corrected or
            removed, contact us at <ContactLink /> and we will act on it
            promptly.
          </p>
        </section>

        <section>
          <h2 className={H2}>Your rights</h2>
          <p className="mt-2">
            Depending on where you live (for example, California and several
            other states), you may have the right to know what personal
            information is held about you, ask for it to be deleted or
            corrected, and opt out of its sale or sharing. Since we hold very
            little about individual visitors, most requests will be answered
            quickly. To make one, contact <ContactLink />.
          </p>
        </section>

        <section>
          <h2 className={H2}>Links to other sites</h2>
          <p className="mt-2">
            Listings link to clubs&apos; own pages, ticketing sites and
            retailers. Those sites have their own privacy practices, which we
            don&apos;t control.
          </p>
        </section>

        <section>
          <h2 className={H2}>Changes</h2>
          <p className="mt-2">
            If this policy changes, we will update the date at the top of the
            page.
          </p>
        </section>
      </div>
    </div>
  );
}
