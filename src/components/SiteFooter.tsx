import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white py-10 text-sm text-zinc-500 dark:border-white/10 dark:bg-black dark:text-zinc-400">
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
      </div>
    </footer>
  );
}
