"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useViewport() {
  const setIsMobile = useAppStore((s) => s.setIsMobile);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    function handleMotionChange(e: MediaQueryListEvent) {
      setReducedMotion(e.matches);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [setIsMobile, setReducedMotion]);
}
