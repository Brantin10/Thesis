"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8 px-6 text-center">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-secondary backdrop-blur-sm"
        >
          Bachelor Thesis — Spring 2026
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-display text-primary"
        >
          AI-Driven
          <br />
          <span className="text-accent">Learning Paths</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-xl text-body text-secondary"
        >
          Comparing LLM approaches for generating personalized learning paths
          — fine-tuned models vs. commercial APIs.
        </motion.p>

        {/* Authors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex gap-6 text-sm text-secondary/60"
        >
          <span>Emil Jansson</span>
          <span className="text-accent/40">|</span>
          <span>Oliver Brantin</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-secondary/40">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-[1px] bg-gradient-to-b from-accent/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
