import Link from "next/link";

const NAV_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/find", label: "Find" },
  { href: "/cities", label: "Cities" },
  { href: "/shop", label: "Shop" },
  { href: "/community", label: "Community" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          American Mahjong Guide
        </Link>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
