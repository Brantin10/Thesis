"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

// Positions expanded 1.15x to match NerveConnections endpoints
const STEPS = [
  { label: "Python Basics", position: [3.68, 1.725, 0.575] as const, delay: 0 },
  { label: "Data Structures", position: [-3.45, 2.3, -1.15] as const, delay: 0.5 },
  { label: "ML Fundamentals", position: [2.875, -1.725, 1.725] as const, delay: 1 },
  { label: "Neural Networks", position: [-3.45, -1.4, -0.7] as const, delay: 1.5 },
  { label: "NLP & Transformers", position: [1.15, 3.45, -1.725] as const, delay: 2 },
  { label: "Fine-Tuning LLMs", position: [-1.725, -2.875, 1.15] as const, delay: 2.5 },
];

function StepCard({
  label,
  position,
  delay,
}: {
  label: string;
  position: readonly [number, number, number];
  delay: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const time = useRef(delay * 2);

  // Distance from origin for heartbeat propagation delay
  const dist = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);

  useFrame((state, delta) => {
    time.current += delta;
    const t = state.clock.getElapsedTime();

    // Heartbeat with propagation delay
    const propagationDelay = dist * 0.08;
    const heartRaw = Math.sin((t - propagationDelay) * 2.5) * 0.5 + 0.5;
    const heartbeat = Math.pow(Math.max(0, heartRaw), 4);

    if (ref.current) {
      // Bobbing motion
      ref.current.position.y =
        position[1] + Math.sin(time.current * 0.8 + delay) * 0.15;

      // Heartbeat scale reaction
      const scale = 1.0 + heartbeat * 0.08;
      ref.current.scale.setScalar(scale);
    }

    // Connection dot flare on heartbeat
    if (dotRef.current) {
      (dotRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.9 + heartbeat * 0.1;
    }
    if (haloRef.current) {
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.1 + heartbeat * 0.35;
      const haloScale = 1.0 + heartbeat * 0.5;
      haloRef.current.scale.setScalar(haloScale);
    }

    // Card glow intensity on heartbeat
    if (htmlRef.current) {
      const glowIntensity = 0.2 + heartbeat * 0.3;
      htmlRef.current.style.boxShadow = `0 0 15px rgba(255,154,46,${glowIntensity}), 0 0 30px rgba(255,154,46,${glowIntensity * 0.4})`;
    }
  });

  return (
    <group ref={ref} position={[position[0], position[1], position[2]]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <Html
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={htmlRef}
            className="select-none whitespace-nowrap rounded-lg border border-amber-400/20 px-4 py-2 text-sm font-medium backdrop-blur-md"
            style={{
              background: "rgba(240, 248, 255, 0.85)",
              color: "#1a1408",
              boxShadow:
                "0 0 15px rgba(255, 154, 46, 0.2), 0 0 30px rgba(255, 154, 46, 0.08)",
            }}
          >
            {label}
          </div>
        </Html>
      </Float>

      {/* Connection node dot */}
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#ff9a2e" transparent opacity={0.9} />
      </mesh>

      {/* Glow halo behind dot */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial
          color="#ff9a2e"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function LearningPathSteps() {
  return (
    <group>
      {STEPS.map((step) => (
        <StepCard key={step.label} {...step} />
      ))}
    </group>
  );
}
