"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Custom Cursor — DOM-based animated cursor with trailing dots.
 *
 * Default: 8px amber dot following the mouse with lerp smoothing.
 * 5 trailing dots, each chasing the previous with decreasing size/opacity.
 * Over interactive 3D region: expands to 24px + orange glow shadow.
 *
 * Disabled on mobile and when reduced-motion is active (shows system cursor).
 * No Canvas involvement — pure DOM/CSS for zero GPU overhead.
 */

const TRAIL_COUNT = 5;
const LERP_SPEED = 0.15;
const TRAIL_LERP = 0.25;

export function CustomCursor() {
  const isMobile = useAppStore((s) => s.isMobile);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const hoveredRegion = useAppStore((s) => s.hoveredRegion);

  const mainRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const trailPos = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const rafId = useRef<number>(0);

  const setTrailRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      trailRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouse);

    const animate = () => {
      // Main dot lerp
      pos.current.x += (mouse.current.x - pos.current.x) * LERP_SPEED;
      pos.current.y += (mouse.current.y - pos.current.y) * LERP_SPEED;

      if (mainRef.current) {
        mainRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }

      // Trail dots — each follows the one before it
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const target = i === 0 ? pos.current : trailPos.current[i - 1];
        const trail = trailPos.current[i];
        const speed = TRAIL_LERP * (1 - i * 0.04);
        trail.x += (target.x - trail.x) * speed;
        trail.y += (target.y - trail.y) * speed;

        const el = trailRefs.current[i];
        if (el) {
          el.style.transform = `translate(${trail.x}px, ${trail.y}px) translate(-50%, -50%)`;
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(rafId.current);
    };
  }, [isMobile, reducedMotion]);

  // Don't render on mobile or reduced motion
  if (isMobile || reducedMotion) return null;

  const isHovering = hoveredRegion !== null;

  return (
    <>
      {/* Hide system cursor via a global style tag */}
      <style>{`
        @media (pointer: fine) {
          body { cursor: none !important; }
          a, button, [role="button"] { cursor: none !important; }
        }
      `}</style>

      {/* Trail dots (rendered first so main dot is on top) */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={setTrailRef(i)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${Math.max(3, 6 - i)}px`,
            height: `${Math.max(3, 6 - i)}px`,
            borderRadius: "50%",
            backgroundColor: "#d07018",
            opacity: 0.4 - i * 0.07,
            pointerEvents: "none",
            zIndex: 9998,
            willChange: "transform",
            transition: "width 0.3s, height 0.3s",
          }}
        />
      ))}

      {/* Main cursor dot */}
      <div
        ref={mainRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? "24px" : "8px",
          height: isHovering ? "24px" : "8px",
          borderRadius: "50%",
          backgroundColor: isHovering
            ? "rgba(208, 112, 24, 0.3)"
            : "#d07018",
          border: isHovering ? "2px solid #d07018" : "none",
          boxShadow: isHovering
            ? "0 0 20px rgba(208, 112, 24, 0.5), 0 0 40px rgba(208, 112, 24, 0.2)"
            : "none",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
          transition: "width 0.3s, height 0.3s, background-color 0.3s, box-shadow 0.3s, border 0.3s",
        }}
      />
    </>
  );
}
