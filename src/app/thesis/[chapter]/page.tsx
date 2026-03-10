"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getChapter, getAdjacentChapters } from "@/lib/chapters";
import { ReferenceList } from "@/components/thesis/ReferenceList";

export default function ChapterPage() {
  const params = useParams();
  const slug = params.chapter as string;
  const chapter = getChapter(slug);
  const { prev, next } = getAdjacentChapters(slug);

  if (!chapter) {
    return (
      <div className="py-20 text-center">
        <h1 className="mb-4 text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-primary">
          Chapter Not Found
        </h1>
        <Link href="/thesis" className="text-accent hover:text-accent-soft">
          Back to overview
        </Link>
      </div>
    );
  }

  return (
    <article>
      {/* Chapter header — centered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Chapter {chapter.number}
        </p>
        <h1 className="mb-6 text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.15] tracking-tight text-primary">
          {chapter.title}
        </h1>
        {chapter.sections && (
          <div className="flex flex-wrap justify-center gap-2">
            {chapter.sections.map((section) => (
              <span
                key={section}
                className="rounded-full border border-accent/10 bg-surface px-3 py-1 text-xs text-secondary"
              >
                {section}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Content placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 text-[1.05rem] leading-[1.8] text-secondary"
      >
        <div className="rounded-2xl border border-accent/10 bg-surface p-10 text-center">
          <p className="text-sm text-secondary">
            Content for &ldquo;{chapter.title}&rdquo; will be added here.
          </p>
          <p className="mt-2 text-xs text-secondary/50">
            This chapter will include full thesis text with inline [X] citations,
            figures, tables, and section headings.
          </p>
        </div>
      </motion.div>

      {/* Chapter navigation — large cards */}
      <div className="mt-20 grid gap-4 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/thesis/${prev.slug}`}
            className="group flex flex-col rounded-2xl border border-accent/8 bg-surface p-6 transition-all duration-300 hover:shadow-md hover:shadow-accent/8"
          >
            <span className="mb-2 text-xs font-medium text-secondary/50">Previous</span>
            <span className="flex items-center gap-2 font-medium text-primary transition-colors group-hover:text-accent">
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/thesis/${next.slug}`}
            className="group flex flex-col items-end rounded-2xl border border-accent/8 bg-surface p-6 text-right transition-all duration-300 hover:shadow-md hover:shadow-accent/8"
          >
            <span className="mb-2 text-xs font-medium text-secondary/50">Next</span>
            <span className="flex items-center gap-2 font-medium text-primary transition-colors group-hover:text-accent">
              {next.title}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* References */}
      <div className="mt-20 border-t border-accent/8 pt-10">
        <ReferenceList />
      </div>
    </article>
  );
}
