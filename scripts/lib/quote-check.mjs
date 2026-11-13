// Checks that a sentence an AI report quotes really stands on the page it cites.
//   const t = await pageText(url);            // plain fetch; headless Chromium when the site answers 403 / 429 / empty
//   quoteFound(t.text, "We play American mahjong using the NMJL card.")  // true / false
// Text is compared as lower-case words only (curly quotes, dashes, entities, spacing and punctuation do not matter).

import { get, render, lines } from "./crawl-lib.mjs";

export const words = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const cache = new Map();
// -> { text, how: "plain" | "browser" | "none" }
// forceBrowser: the plain page was readable but lacked the quote (Meetup and many calendars fill the page with JavaScript) -> render it.
export async function pageText(url, forceBrowser = false) {
  const key = forceBrowser ? `b|${url}` : url;
  if (cache.has(key)) return cache.get(key);
  let out = { text: "", how: "none" };
  if (!forceBrowser) try {
    const html = await get(url);
    const t = words(lines(html).join(" "));
    if (t.length > 200) out = { text: t, how: "plain" };
  } catch { /* fall through to the browser */ }
  if (out.how === "none" || forceBrowser) {
    try {
      const r = await render(url);
      const t = words(r.lines.join(" "));
      if (t.length > 200) out = { text: t, how: "browser" };
    } catch { /* unreadable */ }
  }
  cache.set(key, out);
  return out;
}

export function quoteFound(text, quote) {
  const w = words(quote);
  return w.length >= 15 && text.includes(w);
}

// Quoted strings of 20+ characters in a CSV cell ("..." or curly quotes).
export function quotesIn(s) {
  return [...String(s ?? "").matchAll(/["“]([^"”]{20,}?)["”]/g)].map((m) => m[1]);
}

export const AMERICAN_WORDING = /\bamerican\b|\bnmj?l\b|national mah[\s-]?jong+g? league/i;
