import type { Metadata } from "next";
import { Geist, Geist_Mono, Literata } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Headings: a sturdy, book-like serif made for reading on screen. Body stays Geist.
const literata = Literata({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Every page names itself as the canonical URL ("./" resolves against the page's own path with metadataBase), so the
  // http:// and other variants Google finds are folded into the https page. Pages that set their own `alternates` override this.
  alternates: { canonical: "./" },
  // Site ownership for Yandex Webmaster (rendered as <meta name="yandex-verification" content="...">)
  verification: { yandex: "3117921245ee13f8" },
  title: {
    default: "American Mahjong Guide — Learn, Find, Play",
    template: "%s | American Mahjong Guide",
  },
  description:
    "Learn American Mahjong, find beginner-friendly clubs, lessons, and events near you, and start playing.",
  // Share image: see docs/OG_IMAGE_PROMPTS.md. Pages that define their own
  // openGraph replace this object, so keep images in sync if that happens.
  openGraph: {
    type: "website",
    siteName: "American Mahjong Guide",
    images: [
      {
        url: "/og/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "American Mahjong Guide — Learn, Find, Play",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/og-default.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas">
        <GoogleAnalytics />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
