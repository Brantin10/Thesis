"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chapters } from "@/lib/chapters";
import clsx from "clsx";

export function ChapterNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-3xl items-center justify-center gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
      {/* Overview */}
      <Link
        href="/thesis"
        className={clsx(
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
          pathname === "/thesis"
            ? "bg-accent text-white shadow-sm shadow-accent/20"
            : "text-secondary hover:bg-accent/8 hover:text-primary"
        )}
      >
        Overview
      </Link>

      <span className="mx-1 text-accent/20">|</span>

      {/* Chapter pills */}
      {chapters.map((chapter) => {
        const href = `/thesis/${chapter.slug}`;
        const isActive = pathname === href;

        return (
          <Link
            key={chapter.slug}
            href={href}
            title={chapter.title}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-accent text-white shadow-sm shadow-accent/20"
                : "text-secondary hover:bg-accent/8 hover:text-primary"
            )}
          >
            <span className={clsx(
              "flex h-4 w-4 items-center justify-center rounded-full text-[0.6rem] font-bold",
              isActive
                ? "bg-white/20"
                : "bg-primary/5"
            )}>
              {chapter.number}
            </span>
            <span className="hidden sm:inline">{chapter.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
