"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";

// Same positions as LearningPathSteps — expanded 1.15x for longer nerve strings
const CARD_POSITIONS: [number, number, number][] = [
  [3.2 * 1.15, 1.5 * 1.15, 0.5 * 1.15],
  [-3 * 1.15, 2 * 1.15, -1 * 1.15],
  [2.5 * 1.15, -1.5 * 1.15, 1.5 * 1.15],
  [-3.45, -1.4, -0.7],
  [1 * 1.15, 3 * 1.15, -1.5 * 1.15],
  [-1.5 * 1.15, -2.5 * 1.15, 1 * 1.15],
];

// ─── Single Nerve Line (core + glow) ────────────────────────────────────────

function NerveLine({
  target,
  index,
}: {
  target: [number, number, number];
  index: number;
}) {
  const coreRef = useRef<any>(null);
  const glowRef = useRef<any>(null);

  // Compute curved mid-point — offset perpendicular to the start→end line
  const mid = useMemo<[number, number, number]>(() => {
    const dir = new THREE.Vector3(...target).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    // Get perpendicular direction
    const perp = new THREE.Vector3().crossVectors(dir, up);
    if (perp.length() < 0.01) perp.set(1, 0, 0);
    perp.normalize();

    // Midpoint of the line, offset perpendicular for a nice arc
    const midBase = new THREE.Vector3(...target).multiplyScalar(0.5);
    const offsetAmount = 0.6 + index * 0.15; // vary per nerve
    const offsetDir = index % 2 === 0 ? 1 : -1;
    midBase.addScaledVector(perp, offsetAmount * offsetDir);

    return [midBase.x, midBase.y, midBase.z];
  }, [target, index]);

  // Distance for pulse delay
  const dist = useMemo(
    () => Math.sqrt(target[0] ** 2 + target[1] ** 2 + target[2] ** 2),
    [target]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Heartbeat-synced pulse intensity
    const heartRaw = Math.sin(t * 2.5) * 0.5 + 0.5;
    const heartbeat = Math.pow(heartRaw, 4);

    // Propagation delay based on distance (pulse travels outward)
    const delay = dist * 0.08;
    const delayedHeart =
      Math.pow(Math.max(0, Math.sin((t - delay) * 2.5) * 0.5 + 0.5), 4);

    // Animate dashOffset — scrolling pulse pattern
    if (coreRef.current?.material) {
      coreRef.current.material.dashOffset -= 0.02 + delayedHeart * 0.05;
      coreRef.current.material.opacity = 0.45 + delayedHeart * 0.35;
    }
    if (glowRef.current?.material) {
      glowRef.current.material.dashOffset -= 0.02 + delayedHeart * 0.05;
      glowRef.current.material.opacity = 0.2 + delayedHeart * 0.35;
    }
  });

  return (
    <group>
      {/* Base wire — always visible, continuous */}
      <QuadraticBezierLine
        start={[0, 0, 0]}
        end={target}
        mid={mid}
        lineWidth={1.2}
        color="#d4890a"
        transparent
        opacity={0.18}
      />
      {/* Glow layer — wider, softer */}
      <QuadraticBezierLine
        ref={glowRef}
        start={[0, 0, 0]}
        end={target}
        mid={mid}
        lineWidth={6}
        color="#ff9a2e"
        transparent
        opacity={0.2}
        dashed
        dashSize={1.0}
        gapSize={0.3}
        dashScale={1}
      />
      {/* Core layer — bright, visible */}
      <QuadraticBezierLine
        ref={coreRef}
        start={[0, 0, 0]}
        end={target}
        mid={mid}
        lineWidth={2.5}
        color="#ffb84d"
        transparent
        opacity={0.55}
        dashed
        dashSize={0.6}
        gapSize={0.4}
        dashScale={1}
      />
    </group>
  );
}

// ─── All Nerve Connections ───────────────────────────────────────────────────

export function NerveConnections() {
  return (
    <group>
      {CARD_POSITIONS.map((pos, i) => (
        <NerveLine key={i} target={pos} index={i} />
      ))}
    </group>
  );
}
