"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { QualityLevel } from "@/lib/qualityPresets";

/**
 * Detects GPU tier at startup using detect-gpu (bundled in drei).
 * Sets qualityLevel in Zustand store based on GPU capability + device type.
 *
 * Uses dynamic import to avoid SSR issues with getGPUTier.
 */
export function useAdaptiveQuality() {
  const isMobile = useAppStore((s) => s.isMobile);
  const setQualityLevel = useAppStore((s) => s.setQualityLevel);

  useEffect(() => {
    async function detect() {
      try {
        const { getGPUTier } = await import("detect-gpu");
        const gpuTier = await getGPUTier();

        let level: QualityLevel;
        if (isMobile || gpuTier.tier <= 1) {
          level = "low";
        } else if (gpuTier.tier === 2) {
          level = "medium";
        } else {
          level = "high";
        }

        setQualityLevel(level);
        console.log(
          `[AdaptiveQuality] GPU tier: ${gpuTier.tier} (${gpuTier.gpu}), quality: ${level}`
        );
      } catch {
        // Fallback to medium if detection fails
        setQualityLevel("medium");
        console.warn("[AdaptiveQuality] GPU detection failed, defaulting to medium");
      }
    }

    detect();
  }, [isMobile, setQualityLevel]);
}
