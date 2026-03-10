"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useMemo } from "react";
import { Preload } from "@react-three/drei";
import * as THREE from "three";
import { HeroScene } from "./HeroScene";
import { PostProcessing } from "./PostProcessing";
import { useAppStore } from "@/store/useAppStore";

const EDGE_COLOR = new THREE.Color("#D8EAEF");

// ─── Radial Gradient Background ─────────────────────────────────────────────
// Full-screen plane behind the scene with warm-center → cool-blue-edge gradient
// plus a subtle animated HUD dot grid

const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);

    // Warm center -> cool edge
    vec3 warmCenter = vec3(0.961, 0.961, 0.941);  // #F5F5F0
    vec3 coolEdge   = vec3(0.847, 0.918, 0.937);  // #D8EAEF

    float blend = smoothstep(0.0, 0.65, dist);
    vec3 col = mix(warmCenter, coolEdge, blend);

    // Subtle animated dot grid (HUD feel)
    vec2 gridUv = vUv * 50.0;
    vec2 gridCell = fract(gridUv);
    float dot = 1.0 - smoothstep(0.0, 0.12, length(gridCell - 0.5));

    // Pulse random dots
    float cellId = floor(gridUv.x) * 7.3 + floor(gridUv.y) * 13.7;
    float pulse = sin(uTime * 0.6 + cellId) * 0.5 + 0.5;
    float gridAlpha = dot * 0.035 * (0.4 + pulse * 0.6);

    // Tint dots cool blue
    col += vec3(0.55, 0.72, 0.88) * gridAlpha;

    // Gentle breathing
    col += 0.006 * sin(uTime * 0.4 + dist * 2.5);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function GradientBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh position={[0, 0, -20]} renderOrder={-1}>
      <planeGeometry args={[60, 40]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function SceneSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor(EDGE_COLOR, 1);
  }, [gl]);
  return null;
}

// ─── Loader ─────────────────────────────────────────────────────────────────

function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-1 w-48 overflow-hidden rounded-full bg-accent/10">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
        </div>
        <p className="text-sm text-secondary">Loading experience...</p>
      </div>
    </div>
  );
}

// ─── Canvas ─────────────────────────────────────────────────────────────────

export function SceneCanvas() {
  const isMobile = useAppStore((s) => s.isMobile);

  return (
    <div className="canvas-container">
      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          style={{ background: "#D8EAEF" }}
        >
          <SceneSetup />
          <GradientBackground />
          <HeroScene />
          {!isMobile && <PostProcessing />}
          <Preload all />
        </Canvas>
      </Suspense>
    </div>
  );
}
