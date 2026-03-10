"use client";

import { getAllReferences } from "@/lib/references";

export function ReferenceList() {
  const refs = getAllReferences();

  if (refs.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-secondary">
        References will appear here once added.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="mb-6 text-lg font-semibold text-primary">References</h3>
      {refs.map((ref) => (
        <div
          key={ref.id}
          id={`ref-${ref.id}`}
          className="scroll-mt-24 rounded-xl border border-accent/8 bg-surface p-4 text-sm text-secondary transition-all duration-200 hover:shadow-sm hover:shadow-accent/5"
        >
          <span className="mr-2 font-semibold text-accent">[{ref.id}]</span>
          {ref.ieee}
          {ref.doi && (
            <a
              href={`https://doi.org/${ref.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-accent/60 hover:text-accent"
            >
              DOI
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
