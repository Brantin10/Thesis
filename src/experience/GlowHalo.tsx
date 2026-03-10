"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { getHeartbeat } from "@/lib/heartbeat";

/**
 * Fake Bloom — additive glow halo rendered as a second, slightly larger mesh.
 *
 * Since EffectComposer / real bloom turns the shader background black,
 * we simulate bloom per-element by drawing a blurred, additive-blended
 * duplicate at 1.15× scale. On heartbeat peaks the halo surges brighter
 * and shifts toward warm white, giving a convincing "glow" effect.
 *
 * Supports sphere and torus geometries via the `type` prop.
 */

type GlowHaloProps = {
  /** Geometry type for the halo */
  type: "sphere" | "torus";
  /** Base geometry size — for sphere: radius, for torus: [ring, tube] */
  size: number | [number, number];
  /** Scale multiplier over the original mesh (default 1.15) */
  glowScale?: number;
  /** Base glow color */
  color?: string;
  /** Base opacity (default 0.18) */
  baseOpacity?: number;
  /** Peak opacity on heartbeat (default 0.5) */
  peakOpacity?: number;
  /** Heartbeat delay for staggered timing */
  heartbeatDelay?: number;
  /** Position offset */
  position?: [number, number, number];
};

export function GlowHalo({
  type,
  size,
  glowScale = 1.15,
  color = "#ff9a2e",
  baseOpacity = 0.18,
  peakOpacity = 0.5,
  heartbeatDelay = 0,
  position = [0, 0, 0],
}: GlowHaloProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const peakColor = useMemo(() => new THREE.Color("#fff5e0"), []);
  const lerpColor = useMemo(() => new THREE.Color(), []);

  useAnimationFrame((state) => {
    const t = state.clock.getElapsedTime();
    const heartbeat = getHeartbeat(t, heartbeatDelay);

    if (matRef.current) {
      // Opacity surges on heartbeat
      matRef.current.opacity =
        baseOpacity + (peakOpacity - baseOpacity) * heartbeat;

      // Color shifts warm-white at peak
      lerpColor.copy(baseColor).lerp(peakColor, heartbeat * 0.7);
      matRef.current.color.copy(lerpColor);
    }
    if (meshRef.current) {
      // Slight scale pulse on heartbeat
      const s = glowScale + heartbeat * 0.08;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={glowScale}>
      {type === "sphere" ? (
        <icosahedronGeometry args={[size as number, 3]} />
      ) : (
        <torusGeometry
          args={[
            (size as [number, number])[0],
            (size as [number, number])[1] * 2.5,
            12,
            64,
          ]}
        />
      )}
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={baseOpacity}
        depthWrite={false}
        blending={THREE.NormalBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
