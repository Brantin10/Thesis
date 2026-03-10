"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useScrollProgress() {
  const setScrollProgress = useAppStore((s) => s.setScrollProgress);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrollProgress]);
}
