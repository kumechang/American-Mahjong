import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_TOPIC_META, LEARN_TOPICS, type LearnSection } from "@/content/learn";
import { headingId, readingMinutes } from "@/lib/learn-utils";

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
      <section className="mt-10">
        {section.heading && (
          <h2 id={headingId(section.heading)} className="scroll-mt-6 text-2xl font-semibold tracking-tight">
            {section.heading}
          </h2>
        )}
        {section.paragraphs.map((paragraph, i) => (
          <p key={i} className="mt-4 text-lg leading-8 text-zinc-800 dark:text-zinc-200">
            {paragraph}
          </p>
        ))}
      </section>
    );
  }

  if (section.type === "list") {
    const ListTag = section.ordered ? "ol" : "ul";
    return (
      <section className="mt-10">
        {section.heading && (
          <h2 id={headingId(section.heading)} className="scroll-mt-6 text-2xl font-semibold tracking-tight">
            {section.heading}
          </h2>
        )}
        <ListTag
          className={`mt-4 space-y-2 text-lg leading-8 text-zinc-800 marker:text-jade dark:text-zinc-200 ${
            section.ordered ? "list-decimal" : "list-disc"
          } pl-6`}
        >
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      </section>
    );
  }

  return (
    <section className="mt-10">
      {section.heading && (
        <h2 id={headingId(section.heading)} className="scroll-mt-6 text-2xl font-semibold tracking-tight">
          {section.heading}
        </h2>
      )}
      <dl className="mt-4 space-y-3">
        {section.terms.map(({ term, definition }) => (
          <div key={term} className="tile-card p-4">
            <dt className="font-semibold text-jade-strong">{term}</dt>
            <dd className="mt-1 leading-7 text-zinc-800 dark:text-zinc-200">
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
      <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          This content is being written by our Mahjong domain expert and US
          English editor. Check back soon.
        </p>
      </div>
    );
  }

  const index = LEARN_TOPIC_META.findIndex((t) => t.slug === slug);
  const prev = index > 0 ? LEARN_TOPIC_META[index - 1] : null;
  const next =
    index < LEARN_TOPIC_META.length - 1 ? LEARN_TOPIC_META[index + 1] : null;
  const headings = topic.sections
    .map((section) => section.heading)
    .filter((h): h is string => Boolean(h));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 *:max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-jade">
        <Link href="/learn" className="hover:underline">
          Learn
        </Link>{" "}
        &middot; Guide {index + 1} of {LEARN_TOPIC_META.length}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {topic.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {readingMinutes(topic)} min read
      </p>
      <p className="mt-5 text-xl leading-8 text-zinc-800 dark:text-zinc-200">
        {topic.intro}
      </p>

      {headings.length >= 3 && (
        <nav
          aria-label="On this page"
          className="tile-card mt-8 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-jade">
            On this page
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {headings.map((heading) => (
              <li key={heading}>
                <a
                  href={`#${headingId(heading)}`}
                  className="underline hover:no-underline"
                >
                  {heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {topic.sections.map((section, i) => (
        <LearnSectionBlock key={i} section={section} />
      ))}

      <section className="tile-card mt-14 p-6">
        <h2 className="text-xl font-semibold">Ready to play?</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Find a beginner-friendly club, lesson or open play near you.
        </p>
        <Link
          href="/cities"
          className="mt-4 inline-flex items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Find a place to play
        </Link>
      </section>

      <nav
        aria-label="More guides"
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between"
      >
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            className="tile-card block p-4 text-sm sm:max-w-[48%]"
          >
            <span className="block text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              &larr; Previous
            </span>
            <span className="font-semibold">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/learn/${next.slug}`}
            className="tile-card block p-4 text-sm sm:max-w-[48%] sm:text-right"
          >
            <span className="block text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Next &rarr;
            </span>
            <span className="font-semibold">{next.title}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
