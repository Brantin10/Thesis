"use client";

import { useFrame, type RootState } from "@react-three/fiber";
import { useAppStore } from "@/store/useAppStore";

/**
 * Drop-in replacement for useFrame that respects prefers-reduced-motion.
 * When reducedMotion is true, the callback is skipped — freezing all animation.
 * Scroll-based camera movement should still use regular useFrame (user-initiated).
 */
export function useAnimationFrame(
  callback: (state: RootState, delta: number) => void,
  priority?: number
) {
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    callback(state, delta);
  }, priority);
}
