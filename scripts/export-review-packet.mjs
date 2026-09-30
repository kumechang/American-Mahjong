#!/usr/bin/env node
// Exports the reader-facing text that human reviewers should read — the
// Learn guides and the city introductions — as plain Markdown files in
// docs/review/, so a domain expert or editor doesn't need the codebase.
//
//   node --experimental-strip-types scripts/export-review-packet.mjs
//
// (Node 22+. Re-run after content changes and commit the result.)

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { LEARN_TOPIC_META, LEARN_TOPICS } from "../src/content/learn.ts";

function sectionMarkdown(section) {
  const heading = section.heading ? `### ${section.heading}\n\n` : "";
  if (section.type === "paragraphs") return heading + section.paragraphs.join("\n\n");
  if (section.type === "list") {
    return heading + section.items.map((item, i) => (section.ordered ? `${i + 1}. ${item}` : `- ${item}`)).join("\n");
  }
  return heading + section.terms.map((t) => `**${t.term}** — ${t.definition}`).join("\n\n");
}

const learn = LEARN_TOPIC_META.map((meta, i) => {
  const topic = LEARN_TOPICS[meta.slug];
  if (!topic) return `## ${i + 1}. ${meta.title}\n\n_Not written yet._`;
  return `## ${i + 1}. ${topic.title}\n\n_Page: /learn/${meta.slug}_\n\n${topic.intro}\n\n${topic.sections.map(sectionMarkdown).join("\n\n")}`;
}).join("\n\n---\n\n");

await writeFile(
  "docs/review/learn-guides.md",
  `# Learn guides — text for expert review\n\nGenerated from \`src/content/learn.ts\`. Please check rules and terms (domain expert) or wording (editor). Comments format: see docs/EXPERT_REVIEW_PACKET.md.\n\n---\n\n${learn}\n`,
);

const intros = new Map();
for (const file of (await readdir("migrations")).sort()) {
  if (!file.endsWith(".sql")) continue;
  const sql = await readFile(join("migrations", file), "utf8");
  for (const m of sql.matchAll(/UPDATE "City" SET "intro" = '((?:[^']|'')*)' WHERE "(?:slug|name)" = '([^']*)'/g)) {
    // Early migrations key by slug, later ones by city name; normalize so the
    // newest text replaces the older one instead of appearing twice.
    const key = m[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    intros.set(key, m[1].replaceAll("''", "'"));
  }
}
const introMd = [...intros.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, text]) => `### ${key}\n\n${text}`).join("\n\n");
await writeFile(
  "docs/review/city-intros.md",
  `# City introductions — text for editor review\n\nOne short paragraph per city page (${intros.size} so far), generated from the migrations. Please look for unnatural phrasing, repetition across cities, and claims that sound like guarantees.\n\n${introMd}\n`,
);
console.log(`wrote docs/review/learn-guides.md and docs/review/city-intros.md (${intros.size} intros)`);
