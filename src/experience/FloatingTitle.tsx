"use client";

import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";

export function FloatingTitle() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, viewport } = useThree();

  useAnimationFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Elliptical orbit in XY — wide background sweep
      const orbitSpeed = 0.06;
      const angle = t * orbitSpeed;

      const radiusX = 7.0;
      const radiusY = 3.0;

      let x = Math.sin(angle) * radiusX;
      let y = -Math.cos(angle) * radiusY + 0.2;
      const z = -5.0 + Math.sin(angle * 0.5) * 0.8; // BEHIND the brain

      // Perspective-aware clamping for background depth
      const perspScale = (camera.position.z - z) / camera.position.z;
      const visW = viewport.width * perspScale;
      const visH = viewport.height * perspScale;
      const halfW = visW / 2 - 5.0;
      const halfH = visH / 2 - 1.5;

      x = THREE.MathUtils.clamp(x, -halfW, halfW);
      y = THREE.MathUtils.clamp(y, -halfH, halfH);

      groupRef.current.position.set(x, y, z);

      // Continuous Y rotation — reveals 3D extrusion depth as text spins
      groupRef.current.rotation.y = t * 0.15;
      // Gentle pitch wobble
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <group>
          {/* Line 1: AI-Driven — glowing Jarvis orange */}
          <Text3D
            font={FONT_URL}
            size={0.65}
            height={0.2}
            bevelEnabled
            bevelThickness={0.04}
            bevelSize={0.02}
            bevelSegments={4}
            curveSegments={12}
            letterSpacing={-0.01}
          >
            AI-Driven
            <meshPhysicalMaterial
              color="#e88a20"
              metalness={0.3}
              roughness={0.2}
              clearcoat={0.6}
              clearcoatRoughness={0.1}
              reflectivity={0.5}
              emissive="#d07018"
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
            />
          </Text3D>

          {/* Line 2: Learning Paths — glowing Jarvis orange (warmer) */}
          <Text3D
            font={FONT_URL}
            size={0.65}
            height={0.2}
            bevelEnabled
            bevelThickness={0.04}
            bevelSize={0.02}
            bevelSegments={4}
            curveSegments={12}
            letterSpacing={-0.01}
            position={[0, -0.95, 0]}
          >
            Learning Paths
            <meshPhysicalMaterial
              color="#ff9a2e"
              metalness={0.3}
              roughness={0.15}
              clearcoat={0.6}
              clearcoatRoughness={0.1}
              reflectivity={0.5}
              emissive="#e87a10"
              emissiveIntensity={0.7}
              transparent
              opacity={0.65}
            />
          </Text3D>
        </group>
      </Center>
    </group>
  );
}
