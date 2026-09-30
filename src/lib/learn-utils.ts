import type { LearnSection, LearnTopic } from "@/content/learn";

export function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sectionText(section: LearnSection): string {
  if (section.type === "paragraphs") return section.paragraphs.join(" ");
  if (section.type === "list") return section.items.join(" ");
  return section.terms.map((t) => `${t.term} ${t.definition}`).join(" ");
}

// ~200 words per minute, never less than one minute.
export function readingMinutes(topic: LearnTopic): number {
  const words = [topic.intro, ...topic.sections.map(sectionText)]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
