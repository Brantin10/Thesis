"use client";

import { motion } from "framer-motion";

export function Abstract() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-background px-8 py-40">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Abstract
        </p>
        <h2 className="mb-10 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-primary">
          Can a fine-tuned small model compete with GPT-4?
        </h2>
        <div className="space-y-6 text-lg leading-relaxed text-secondary">
          <p>
            As the demand for personalized education grows, large language models
            offer a promising approach for generating adaptive learning paths.
            But how do different LLM strategies compare in quality, consistency,
            and personalization?
          </p>
          <p>
            This thesis evaluates three approaches — a fine-tuned Phi-3 Mini
            model using QLoRA, the commercial GPT-4o API, and GPT-4o-mini — across
            a 10-metric scoring framework that measures everything from
            step-ordering quality to career relevance.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
