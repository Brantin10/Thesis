"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export function FloatingTitle() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle orbital float — orbit around the brain at brain-level depth
      const orbitRadius = 4.5;
      const orbitSpeed = 0.04;
      const x = Math.sin(t * orbitSpeed) * orbitRadius;
      const z = Math.cos(t * orbitSpeed) * 1.0; // at brain depth (z ~= 0)
      const y = Math.sin(t * 0.1) * 0.6 + 0.5;

      groupRef.current.position.set(x, y, z);

      // Always face the camera
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <Html
        center
        transform
        distanceFactor={8}
        style={{ pointerEvents: "none" }}
      >
        <div
          className="select-none"
          style={{
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "1.4rem",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textAlign: "center",
            whiteSpace: "nowrap",
            opacity: 0.88,
            textShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}
        >
          <div style={{ color: "#1a1408" }}>AI-Driven</div>
          <div style={{ color: "#ff9a2e", marginTop: "0.15em" }}>
            Learning Paths
          </div>
        </div>
      </Html>
    </group>
  );
}
