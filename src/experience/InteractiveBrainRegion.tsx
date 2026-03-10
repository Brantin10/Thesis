"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { useAppStore } from "@/store/useAppStore";
import { BRAIN_REGIONS, type BrainRegion } from "@/lib/brainRegions";

/**
 * InteractiveBrainRegion — wraps a group of 3D children with hover/click
 * interactions. Hover: 1.05× scale + sets `hoveredRegion` in Zustand.
 * Click: toggles a glass-morphism tooltip via drei's `<Html>`.
 */

export function InteractiveBrainRegion({
  regionId,
  children,
}: {
  regionId: string;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hovered, setHovered] = useState(false);
  const setHoveredRegion = useAppStore((s) => s.setHoveredRegion);
  const region: BrainRegion | undefined = BRAIN_REGIONS[regionId];

  // Smooth scale lerp on hover
  useAnimationFrame(() => {
    if (groupRef.current) {
      const target = hovered ? 1.05 : 1.0;
      const current = groupRef.current.scale.x;
      const lerped = THREE.MathUtils.lerp(current, target, 0.1);
      groupRef.current.scale.setScalar(lerped);
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredRegion(regionId);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    setHoveredRegion(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setShowTooltip((prev) => !prev);
  };

  if (!region) return <group>{children}</group>;

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}

      {/* Glass-morphism tooltip */}
      {showTooltip && (
        <Html
          center
          distanceFactor={6}
          position={[0, 1.8, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "12px",
              padding: "16px 20px",
              minWidth: "240px",
              maxWidth: "300px",
              color: "#1a1a1a",
              fontFamily: "system-ui, sans-serif",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "6px",
                color: "#d07018",
                letterSpacing: "-0.01em",
              }}
            >
              {region.name}
            </div>
            <div
              style={{
                fontSize: "12px",
                lineHeight: "1.5",
                color: "#444",
                marginBottom: "8px",
              }}
            >
              {region.description}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#888",
                fontFamily: "monospace",
                borderTop: "1px solid rgba(0,0,0,0.08)",
                paddingTop: "6px",
              }}
            >
              {region.tech}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
