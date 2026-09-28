import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Renders nothing if NEXT_PUBLIC_GA_MEASUREMENT_ID isn't set, so local dev
 * and preview builds don't send events under the production GA property.
 * Requires NEXT_PUBLIC_GA_MEASUREMENT_ID to be set as a *build* variable
 * (not just a runtime one) in Cloudflare, since Next.js inlines
 * NEXT_PUBLIC_* values into the bundle at build time, not at request time.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
