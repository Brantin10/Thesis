"use client";

import { ChapterNav } from "@/components/thesis/ChapterNav";
import { ReadingProgress } from "@/components/thesis/ReadingProgress";
import { TTSControls } from "@/components/thesis/TTSControls";
import Link from "next/link";

export default function ThesisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />

      {/* Top bar — frosted white glass */}
      <header className="fixed left-0 top-0 z-40 flex h-14 w-full items-center justify-between border-b border-accent/8 bg-white/80 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-primary transition-colors hover:text-accent"
          >
            LearningPath<span className="text-accent">AI</span>
          </Link>
          <span className="text-xs text-secondary/40">/</span>
          <span className="text-xs font-medium text-secondary">Thesis</span>
        </div>

        <TTSControls />
      </header>

      {/* Floating horizontal chapter nav */}
      <div className="fixed left-0 top-14 z-30 w-full border-b border-accent/6 bg-white/60 backdrop-blur-lg">
        <ChapterNav />
      </div>

      {/* Main content — full page, centered, article-like */}
      <main className="px-6 pb-20 pt-40 sm:px-8">
        <div className="mx-auto max-w-[65ch]" data-thesis-content>
          {children}
        </div>
      </main>
    </div>
  );
}
