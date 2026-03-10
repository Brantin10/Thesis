export interface Chapter {
  slug: string;
  number: number;
  title: string;
  sections?: string[];
}

export const chapters: Chapter[] = [
  {
    slug: "introduction",
    number: 1,
    title: "Introduction",
    sections: ["Background", "Problem Statement", "Research Questions", "Contribution"],
  },
  {
    slug: "literature-review",
    number: 2,
    title: "Literature Review",
    sections: ["Learning Path Generation", "LLM-Based Recommendation", "Fine-Tuning Methods", "Evaluation Frameworks"],
  },
  {
    slug: "methodology",
    number: 3,
    title: "Methodology",
    sections: ["Research Design", "Dependent Variables", "Data Collection", "Experiment Setup"],
  },
  {
    slug: "implementation",
    number: 4,
    title: "Implementation",
    sections: ["System Architecture", "Fine-Tuning Pipeline", "Scoring Framework", "API Integration"],
  },
  {
    slug: "results",
    number: 5,
    title: "Results & Analysis",
    sections: ["Model Comparison", "Statistical Analysis", "Per-Metric Breakdown"],
  },
  {
    slug: "discussion",
    number: 6,
    title: "Discussion & Conclusion",
    sections: ["Key Findings", "Limitations", "Future Work", "Conclusion"],
  },
];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getAdjacentChapters(slug: string) {
  const index = chapters.findIndex((c) => c.slug === slug);
  return {
    prev: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
  };
}
