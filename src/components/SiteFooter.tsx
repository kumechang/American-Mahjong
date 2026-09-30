import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface py-10 text-sm text-muted">
      <div className="mx-auto max-w-6xl px-6">
        <p>
          American Mahjong Guide helps beginners learn the rules, find
          beginner-friendly clubs and lessons near them, and start playing.
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} American Mahjong Guide. This site
          may contain affiliate links. Read about{" "}
          <Link href="/about" className="underline hover:no-underline">
            how we verify listings
          </Link>
          .
        </p>
        <p className="mt-2">
          <Link href="/privacy" className="underline hover:no-underline">
            Privacy Policy
          </Link>
          {" \u00b7 "}
          <Link href="/terms" className="underline hover:no-underline">
            Terms of Use
          </Link>
        </p>
      </div>
    </footer>
  );
}
