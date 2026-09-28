import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEARN_TOPIC_META, LEARN_TOPICS, type LearnSection } from "@/content/learn";

export function generateStaticParams() {
  return LEARN_TOPIC_META.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const meta = LEARN_TOPIC_META.find((topic) => topic.slug === slug);

  if (!meta) {
    return {};
  }

  return {
    title: meta.title,
    description: meta.description,
  };
}

function LearnSectionBlock({ section }: { section: LearnSection }) {
  if (section.type === "paragraphs") {
    return (
      <section className="mt-8">
        {section.heading && (
          <h2 className="text-xl font-semibold">{section.heading}</h2>
        )}
        {section.paragraphs.map((paragraph, i) => (
          <p key={i} className="mt-3 text-zinc-600 dark:text-zinc-400">
            {paragraph}
          </p>
        ))}
      </section>
    );
  }

  if (section.type === "list") {
    const ListTag = section.ordered ? "ol" : "ul";
    return (
      <section className="mt-8">
        {section.heading && (
          <h2 className="text-xl font-semibold">{section.heading}</h2>
        )}
        <ListTag
          className={`mt-3 space-y-2 text-zinc-600 dark:text-zinc-400 ${
            section.ordered ? "list-decimal" : "list-disc"
          } pl-5`}
        >
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      </section>
    );
  }

  return (
    <section className="mt-8">
      {section.heading && (
        <h2 className="text-xl font-semibold">{section.heading}</h2>
      )}
      <dl className="mt-3 space-y-4">
        {section.terms.map(({ term, definition }) => (
          <div key={term}>
            <dt className="font-semibold">{term}</dt>
            <dd className="mt-1 text-zinc-600 dark:text-zinc-400">
              {definition}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function LearnTopicPage({
  params,
}: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const meta = LEARN_TOPIC_META.find((t) => t.slug === slug);

  if (!meta) {
    notFound();
  }

  const topic = LEARN_TOPICS[slug];

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          This content is being written by our Mahjong domain expert and US
          English editor. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{topic.intro}</p>

      {topic.sections.map((section, i) => (
        <LearnSectionBlock key={i} section={section} />
      ))}
    </div>
  );
}
