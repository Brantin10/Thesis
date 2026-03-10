"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function ReadThesis() {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center bg-surface px-8 py-40">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-10 text-center"
      >
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight text-primary">
          Read the Full
          <br />
          <span className="text-accent">Thesis</span>
        </h2>
        <p className="max-w-md text-lg leading-relaxed text-secondary">
          Explore our complete research with interactive citations,
          chapter navigation, and built-in text-to-speech.
        </p>
        <Link
          href="/thesis"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:bg-accent-soft hover:shadow-xl hover:shadow-accent/30"
        >
          Enter Thesis Reader
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
