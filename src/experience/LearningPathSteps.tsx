"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

const STEPS = [
  { label: "Python Basics", position: [3.2, 1.5, 0.5] as const, delay: 0 },
  { label: "Data Structures", position: [-3, 2, -1] as const, delay: 0.5 },
  { label: "ML Fundamentals", position: [2.5, -1.5, 1.5] as const, delay: 1 },
  { label: "Neural Networks", position: [-2.5, -0.5, -0.5] as const, delay: 1.5 },
  { label: "NLP & Transformers", position: [1, 3, -1.5] as const, delay: 2 },
  { label: "Fine-Tuning LLMs", position: [-1.5, -2.5, 1] as const, delay: 2.5 },
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
  const time = useRef(delay * 2);

  useFrame((_, delta) => {
    time.current += delta;
    if (ref.current) {
      ref.current.position.y =
        position[1] + Math.sin(time.current * 0.8 + delay) * 0.15;
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
            className="select-none whitespace-nowrap rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md"
            style={{
              background: "rgba(18, 18, 18, 0.7)",
              boxShadow: "0 0 20px 0 0 20px rgba(255, 154, 46, 0.15), inset 0 0 20px rgba(255, 154, 46, 0.05)",
            }}
          >
            {label}
          </div>
        </Html>
      </Float>

      {/* Glow dot at card position */}
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff9a2e" transparent opacity={0.8} />
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
