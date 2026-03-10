"use client";

import { motion } from "framer-motion";

const METRICS = [
  { name: "Step Ordering", description: "Prerequisite compliance & logical sequencing" },
  { name: "Accuracy", description: "Factual correctness of content" },
  { name: "Clarity", description: "Readability & instructional quality" },
  { name: "Relevance", description: "Alignment with learner goals" },
  { name: "Completeness", description: "Coverage of required topics" },
  { name: "Knowledge Quality", description: "Semantic depth of explanations" },
  { name: "Career Value", description: "Practical industry applicability" },
  { name: "Personalization", description: "Adaptation to learner profile" },
  { name: "Consistency", description: "Stability across repeated runs" },
  { name: "Penalty", description: "Deductions for errors & hallucinations" },
];

export function Methods() {
  return (
    <section className="relative bg-surface px-8 py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Methodology
          </p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-primary">
            10-Metric Scoring Framework
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group rounded-2xl border border-amber-900/8 bg-background p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-accent/5"
            >
              <div className="mb-1 text-xs font-semibold text-accent/70">
                DV{i + 1}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">{metric.name}</h3>
              <p className="text-sm leading-relaxed text-secondary">{metric.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
