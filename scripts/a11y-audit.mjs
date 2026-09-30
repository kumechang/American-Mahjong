#!/usr/bin/env node
// Runs axe-core (WCAG 2 A/AA + best practices, including color contrast)
// against key pages in light and dark mode and prints the unique violations.
//
// Setup (not project dependencies, so nothing is added to package.json):
//   npm i --no-save axe-core playwright
// Then start the site (`npm run dev`) and run:
//   node scripts/a11y-audit.mjs [baseUrl]
// If Chromium isn't found automatically, set CHROME=/path/to/chrome.

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const PAGES = [
  "/",
  "/cities",
  "/cities/tucson",
  "/find",
  "/community",
  "/learn",
  "/learn/rules",
  "/learn/terms",
  "/about",
  "/privacy",
  "/terms",
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
});
const issues = new Map();

for (const scheme of ["light", "dark"]) {
  for (const path of PAGES) {
    const context = await browser.newContext({
      colorScheme: scheme,
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "best-practice"] },
      });
      return result.violations.flatMap((v) =>
        v.nodes.map((n) => ({
          rule: v.id,
          message: n.any[0]?.message ?? v.help,
          html: n.html.slice(0, 120),
        })),
      );
    });
    for (const v of violations) {
      const key = `${scheme} | ${v.rule} | ${v.message}`;
      const entry = issues.get(key) ?? { html: v.html, pages: new Set() };
      entry.pages.add(path);
      issues.set(key, entry);
    }
    console.log(`${scheme.padEnd(5)} ${path} — ${violations.length} issue(s)`);
    await context.close();
  }
}
await browser.close();

if (issues.size === 0) {
  console.log("\nNo violations found.");
} else {
  console.log("\nUnique violations:");
  for (const [key, entry] of issues) {
    console.log(`- ${key}\n    e.g. ${entry.html}\n    pages: ${[...entry.pages].join(" ")}`);
  }
  process.exitCode = 1;
}
