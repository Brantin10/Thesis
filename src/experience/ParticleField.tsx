"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
const SPAWN_RADIUS_MIN = 12;
const SPAWN_RADIUS_MAX = 18;
const ABSORB_RADIUS = 0.8;

function spawnOnSphere(out: Float32Array, i: number) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = SPAWN_RADIUS_MIN + Math.random() * (SPAWN_RADIUS_MAX - SPAWN_RADIUS_MIN);
  out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  out[i * 3 + 2] = r * Math.cos(phi);
}

export function ParticleField({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize positions on a distant sphere
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      spawnOnSphere(pos, i);
    }
    return pos;
  }, [count]);

  // Per-particle random spiral offset (constant per particle)
  const spiralOffsets = useMemo(() => {
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      offsets[i] = (Math.random() - 0.5) * 0.01;
    }
    return offsets;
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useAnimationFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    const dt = Math.min(delta, 0.05) * 60; // normalize to 60fps

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = posArr[ix];
      const y = posArr[ix + 1];
      const z = posArr[ix + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);

      if (dist < ABSORB_RADIUS || dist < 0.01) {
        // Respawn at a distant point
        spawnOnSphere(posArr, i);
        continue;
      }

      // Move toward center with gentle acceleration
      const speed = (0.015 + (SPAWN_RADIUS_MAX - dist) * 0.0008) * dt;
      const invDist = 1 / dist;

      // Add slight spiral (tangential drift)
      const spiral = spiralOffsets[i] * dt;

      posArr[ix] -= x * invDist * speed - z * spiral;
      posArr[ix + 1] -= y * invDist * speed;
      posArr[ix + 2] -= z * invDist * speed + x * spiral;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.035}
        color="#ff9a2e"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
}
