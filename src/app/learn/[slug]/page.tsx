import { notFound } from "next/navigation";

export const TOPIC_TITLES: Record<string, string> = {
  "what-is-american-mahjong": "What Is American Mahjong?",
  "beginner-guide": "Beginner Guide",
  rules: "Rules",
  terms: "Terms",
  charleston: "The Charleston",
  scoring: "Scoring",
  jokers: "Jokers",
  etiquette: "Etiquette",
};

export function generateStaticParams() {
  return Object.keys(TOPIC_TITLES).map((slug) => ({ slug }));
}

export default async function LearnTopicPage({
  params,
}: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const title = TOPIC_TITLES[slug];

  if (!title) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        This content is being written by our Mahjong domain expert and US
        English editor. Check back soon.
      </p>
    </div>
  );
}
