"use client";

import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { getHeartbeat } from "@/lib/heartbeat";

/**
 * GPU Instanced Particles — single draw call for hundreds/thousands of particles.
 *
 * Uses InstancedMesh with per-frame matrix updates. Each particle has a unique
 * position on a sphere (golden angle distribution), orbits slowly, and expands
 * on heartbeat. Still just ONE draw call regardless of count.
 */

export function InstancedParticles({
  count = 600,
  radius = 1.6,
}: {
  count?: number;
  radius?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-compute per-instance base data (once)
  const { basePositions, baseScales, phases } = useMemo(() => {
    const basePositions = new Float32Array(count * 3);
    const baseScales = new Float32Array(count);
    const phases = new Float32Array(count);

    // Golden angle distribution for even sphere coverage
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / Math.max(count - 1, 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      const r = radius + (Math.random() - 0.5) * 0.6;
      basePositions[i * 3] = Math.cos(theta) * radiusAtY * r;
      basePositions[i * 3 + 1] = y * r;
      basePositions[i * 3 + 2] = Math.sin(theta) * radiusAtY * r;

      baseScales[i] = 0.02 + Math.random() * 0.04;
      phases[i] = Math.random();
    }

    return { basePositions, baseScales, phases };
  }, [count, radius]);

  // Initialize all instance matrices on mount
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        basePositions[i * 3],
        basePositions[i * 3 + 1],
        basePositions[i * 3 + 2]
      );
      dummy.scale.setScalar(baseScales[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, basePositions, baseScales, dummy]);

  // Per-frame: update matrices with orbit + heartbeat
  useAnimationFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const heartbeat = getHeartbeat(t, 0.1);
    const expand = 1.0 + heartbeat * 0.15;

    for (let i = 0; i < count; i++) {
      const phase = phases[i];
      const angle = t * 0.05 + phase * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Rotate base position around Y axis
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      dummy.position.set(
        (bx * cosA - bz * sinA) * expand,
        by * expand,
        (bx * sinA + bz * cosA) * expand
      );

      // Scale pulses with heartbeat + twinkle
      const twinkle =
        Math.sin(t * (1.5 + phase * 2) + phase * 6.2832) * 0.3 + 0.7;
      dummy.scale.setScalar(
        baseScales[i] * (1 + heartbeat * 0.5) * twinkle
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#d07018"
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
