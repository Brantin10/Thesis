"use client";

export function Footer() {
  return (
    <footer className="relative border-t border-accent/10 bg-background px-8 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-primary">
          LearningPath<span className="text-accent">AI</span>
        </p>
        <p className="text-xs text-secondary">
          A bachelor thesis by Emil Jansson & Oliver Brantin
          <span className="mx-2 text-accent/20">|</span>
          Kristianstad University — Spring 2026
        </p>
        <p className="text-xs text-secondary/50">
          Built with Next.js, React Three Fiber & GSAP
        </p>
      </div>
    </footer>
  );
}
