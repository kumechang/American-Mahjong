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
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="-ml-1 inline-flex min-h-11 items-center self-start px-1 text-lg font-semibold tracking-tight">
          American Mahjong Guide
        </Link>
        <nav className="-mx-2 flex flex-wrap text-sm font-medium sm:mx-0">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center px-2.5 text-zinc-600 transition-colors hover:text-black sm:px-3 dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
