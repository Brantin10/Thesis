"use client";

import { motion } from "framer-motion";

const MODELS = [
  {
    name: "Phi-3 Mini (Fine-tuned)",
    tag: "QLoRA",
    description: "Fine-tuned with 800+ curated training examples using rank-32 QLoRA adapters",
    color: "#ff9a2e",
  },
  {
    name: "GPT-4o",
    tag: "API",
    description: "OpenAI\u2019s flagship commercial model accessed via structured prompting",
    color: "#10B981",
  },
  {
    name: "GPT-4o-mini",
    tag: "API",
    description: "Lightweight commercial variant balancing cost and quality",
    color: "#F59E0B",
  },
];

export function Results() {
  return (
    <section className="relative bg-background px-8 py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Models Under Test
          </p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-primary">
            Three Approaches, One Task
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {MODELS.map((model, i) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative overflow-hidden rounded-2xl border border-amber-900/8 bg-surface p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-accent/5"
            >
              {/* Accent left border */}
              <div
                className="absolute left-0 top-0 h-full w-[3px]"
                style={{ background: model.color }}
              />

              <div className="mb-4 flex items-center gap-3">
                <span
                  className="rounded-md px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: `${model.color}15`,
                    color: model.color,
                  }}
                >
                  {model.tag}
                </span>
              </div>

              <h3 className="mb-3 text-xl font-semibold text-primary">{model.name}</h3>
              <p className="text-sm leading-relaxed text-secondary">
                {model.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
