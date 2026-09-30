#!/usr/bin/env node
// Exports the reader-facing text that human reviewers should read — the
// Learn guides and the city introductions — as plain Markdown files in
// docs/review/, so a domain expert or editor doesn't need the codebase.
//
//   node --experimental-strip-types scripts/export-review-packet.mjs
//
// (Node 22+. Re-run after content changes and commit the result.)

import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
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

// Read the intros from the local D1 (so later REPLACE-style migrations are
// reflected). Run `npx wrangler d1 migrations apply DB --local` first.
const raw = execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command",
   "SELECT slug, intro FROM City WHERE published = 1 AND intro IS NOT NULL ORDER BY slug"],
  { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
);
const intros = new Map(JSON.parse(raw)[0].results.map((r) => [r.slug, r.intro]));
const introMd = [...intros.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, text]) => `### ${key}\n\n${text}`).join("\n\n");
await writeFile(
  "docs/review/city-intros.md",
  `# City introductions — text for editor review\n\nOne short paragraph per city page (${intros.size} so far), generated from the local database (published cities only). Please look for unnatural phrasing, repetition across cities, and claims that sound like guarantees.\n\n${introMd}\n`,
);
console.log(`wrote docs/review/learn-guides.md and docs/review/city-intros.md (${intros.size} intros)`);
