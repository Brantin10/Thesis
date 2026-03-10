"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { chapters } from "@/lib/chapters";

export default function ThesisOverview() {
  return (
    <div>
      {/* Centered hero header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <h1 className="mb-6 text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.15] tracking-tight text-primary">
          Comparing LLM Approaches for Personalized Learning Path Generation
        </h1>

        {/* Decorative amber line */}
        <div className="mx-auto mb-6 h-[2px] w-16 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <p className="text-sm font-medium text-secondary">
          Emil Jansson & Oliver Brantin
        </p>
        <p className="mt-1 text-sm text-secondary/60">
          Kristianstad University — Bachelor Thesis, Spring 2026
        </p>
      </motion.div>

      {/* Table of Contents header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Table of Contents
        </p>
      </motion.div>

      {/* Chapter cards — 2-column grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {chapters.map((chapter, i) => (
          <motion.div
            key={chapter.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
          >
            <Link
              href={`/thesis/${chapter.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-accent/8 bg-surface p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-accent/8"
            >
              {/* Amber left accent */}
              <div className="absolute left-0 top-0 h-full w-[3px] bg-accent/30 transition-colors group-hover:bg-accent" />

              {/* Large semi-transparent chapter number */}
              <span className="absolute right-4 top-3 text-[4rem] font-bold leading-none text-accent/[0.06]">
                {chapter.number}
              </span>

              <span className="mb-3 text-xs font-semibold text-accent/60">
                Chapter {chapter.number}
              </span>
              <h3 className="mb-3 text-lg font-semibold text-primary transition-colors group-hover:text-accent">
                {chapter.title}
              </h3>
              {chapter.sections && (
                <div className="flex flex-wrap gap-1.5">
                  {chapter.sections.map((section) => (
                    <span
                      key={section}
                      className="rounded-full bg-background px-2.5 py-0.5 text-[0.7rem] text-secondary"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-12 rounded-2xl border border-accent/8 bg-surface p-6 text-center"
      >
        <p className="text-sm text-secondary">
          Select a chapter to begin reading. Each chapter includes inline citations and references.
        </p>
      </motion.div>
    </div>
  );
}
