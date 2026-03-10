export interface Reference {
  id: number;
  ieee: string;
  authors: string;
  title: string;
  year: number;
  venue?: string;
  doi?: string;
  url?: string;
  summary?: string;
  keywords?: string[];
}

// Placeholder — will be populated from references.json built via ChatGPT
const referencesData: Reference[] = [
  {
    id: 1,
    ieee: "L. Meng et al., \"Learning path sequencing...\"",
    authors: "L. Meng",
    title: "Learning Path Sequencing with Prerequisite Graphs",
    year: 2023,
    summary: "Prerequisite-based learning path ordering",
    keywords: ["learning paths", "prerequisites", "sequencing"],
  },
  {
    id: 2,
    ieee: "Z. Zhao et al., \"LLM-based recommender systems...\"",
    authors: "Z. Zhao",
    title: "LLM-Based Recommender Systems: Survey and Evaluation",
    year: 2024,
    summary: "Survey of LLM approaches for recommendation",
    keywords: ["LLM", "recommender systems", "fine-tuning"],
  },
];

export function getReference(id: number): Reference | undefined {
  return referencesData.find((r) => r.id === id);
}

export function getAllReferences(): Reference[] {
  return referencesData;
}

export function loadReferencesFromJson(data: Reference[]) {
  referencesData.length = 0;
  referencesData.push(...data);
}
