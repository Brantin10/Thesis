"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { Preload } from "@react-three/drei";
import { Color } from "three";
import { HeroScene } from "./HeroScene";
import { PostProcessing } from "./PostProcessing";
import { useAppStore } from "@/store/useAppStore";

const BG_COLOR = new Color("#FAFAF7");

function SceneBackground() {
  const { scene, gl } = useThree();
  useEffect(() => {
    scene.background = BG_COLOR;
    gl.setClearColor(BG_COLOR, 1);
  }, [scene, gl]);
  return null;
}

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
          style={{ background: "#FAFAF7" }}
        >
          <SceneBackground />
          <HeroScene />
          {!isMobile && <PostProcessing />}
          <Preload all />
        </Canvas>
      </Suspense>
    </div>
  );
}
