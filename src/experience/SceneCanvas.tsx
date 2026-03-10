"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { Preload, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { HeroScene } from "./HeroScene";
import { PostProcessing } from "./PostProcessing";
import { ChromaticAberration } from "./ChromaticAberration";
import { useAppStore } from "@/store/useAppStore";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { QUALITY_PRESETS } from "@/lib/qualityPresets";

const EDGE_COLOR = new THREE.Color("#C4D8F0");

// ─── Light Blue Space Background ────────────────────────────────────────────

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

  // Hash for star placement
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);

    // Light blue center -> deeper blue edge
    vec3 blueCenter = vec3(0.910, 0.941, 0.980);  // #E8F0FA
    vec3 blueEdge   = vec3(0.769, 0.847, 0.941);  // #C4D8F0

    float blend = smoothstep(0.0, 0.70, dist);
    vec3 col = mix(blueCenter, blueEdge, blend);

    // Subtle vignette darkening at corners
    float vignette = 1.0 - smoothstep(0.5, 0.85, dist) * 0.08;
    col *= vignette;

    // Star field — tiny bright dots scattered across the plane
    vec2 starUv = vUv * 120.0;
    vec2 starCell = floor(starUv);
    float starHash = hash(starCell);

    // Only ~8% of cells have stars
    if (starHash > 0.92) {
      vec2 starPos = vec2(hash(starCell + 0.5), hash(starCell + 1.5));
      float starDist = length(fract(starUv) - starPos);
      float starSize = 0.02 + starHash * 0.03;
      float star = 1.0 - smoothstep(0.0, starSize, starDist);

      // Twinkle animation
      float twinkle = sin(uTime * (1.0 + starHash * 2.0) + starHash * 6.2832) * 0.5 + 0.5;
      float starAlpha = star * (0.3 + twinkle * 0.5) * 0.6;

      col += vec3(0.95, 0.97, 1.0) * starAlpha;
    }

    // Animated dot grid (HUD feel) — blue-white tint
    vec2 gridUv = vUv * 50.0;
    vec2 gridCell = fract(gridUv);
    float dot = 1.0 - smoothstep(0.0, 0.12, length(gridCell - 0.5));

    float cellId = floor(gridUv.x) * 7.3 + floor(gridUv.y) * 13.7;
    float pulse = sin(uTime * 0.6 + cellId) * 0.5 + 0.5;
    float gridAlpha = dot * 0.03 * (0.4 + pulse * 0.6);

    // Blue-white dot tint
    col += vec3(0.7, 0.82, 1.0) * gridAlpha;

    // Gentle breathing
    col += 0.005 * sin(uTime * 0.4 + dist * 2.5);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function GradientBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useAnimationFrame((_, delta) => {
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

// ─── Mouse Parallax — camera shifts with cursor for depth feel ──────────────

function MouseParallax() {
  const { camera } = useThree();
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    if (reducedMotion) return;
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      mouse.current.x * 0.5,
      0.05
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      -mouse.current.y * 0.3,
      0.05
    );
  });

  return null;
}

// ─── Loading Overlay — real progress tracking ────────────────────────────────

function LoadingOverlay() {
  const { progress, active, loaded, total } = useProgress();
  const setLoaded = useAppStore((s) => s.setLoaded);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  // Determine if loading is truly done:
  // - either progress hit 100% and nothing is actively loading
  // - or nothing was ever queued (total === 0) and loader is idle
  const isDone = (!active && progress === 100) || (!active && total === 0 && !visible) || (!active && loaded === total && total > 0);

  useEffect(() => {
    // If nothing to load at all (procedural scene), dismiss after a short delay
    if (!active && total === 0) {
      const timer = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
          setLoaded(true);
        }, 700);
      }, 600);
      return () => clearTimeout(timer);
    }

    // Normal case: assets finished loading
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
          setLoaded(true);
        }, 700);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [active, progress, total, setLoaded]);

  if (!visible) return null;

  // Show 100% when fading out for a polished feel
  const displayProgress = fading ? 100 : Math.round(progress);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-accent/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        {/* Percentage */}
        <p className="font-mono text-sm tabular-nums text-secondary">
          {displayProgress}%
        </p>
        <p className="text-xs text-secondary/60">Loading experience...</p>
      </div>
    </div>
  );
}

// ─── Suspense Fallback ──────────────────────────────────────────────────────

function SuspenseFallback() {
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
  const qualityLevel = useAppStore((s) => s.qualityLevel);
  const quality = QUALITY_PRESETS[qualityLevel];

  return (
    <div className="canvas-container">
      <Suspense fallback={<SuspenseFallback />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={quality.dpr}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          style={{ background: "#C4D8F0" }}
        >
          <SceneSetup />
          <MouseParallax />
          <GradientBackground />
          <HeroScene />
          {!isMobile && <PostProcessing />}
          {quality.enableChromaticAberration && (
            <ChromaticAberration strength={quality.chromaticStrength} />
          )}
          <Preload all />
        </Canvas>
      </Suspense>
      <LoadingOverlay />
    </div>
  );
}
