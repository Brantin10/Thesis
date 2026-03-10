"use client";

import { useState } from "react";
import { getReference } from "@/lib/references";

interface CitationProps {
  num: number;
}

export function Citation({ num }: CitationProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = getReference(num);

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          const el = document.getElementById(`ref-${num}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        className="cursor-pointer text-accent transition-colors hover:text-accent-soft"
        aria-label={`Citation ${num}`}
      >
        [{num}]
      </button>

      {showTooltip && ref && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-xl border border-accent/10 bg-white p-3 shadow-lg shadow-accent/5">
          <p className="text-xs leading-relaxed text-secondary">
            {ref.ieee}
          </p>
          {ref.summary && (
            <p className="mt-1 text-xs text-secondary/60">{ref.summary}</p>
          )}
        </div>
      )}
    </span>
  );
}
