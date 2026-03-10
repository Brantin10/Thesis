"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";

export function FloatingTitle() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, viewport } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Elliptical orbit in XY screen-space — avoids brain center
      // When text is at left/right extremes, it's at brain-level Y
      // When text crosses center-X, it's pushed to top/bottom — never overlapping the brain
      const orbitSpeed = 0.06;
      const angle = t * orbitSpeed;

      const radiusX = 4.5;
      const radiusY = 2.0;

      let x = Math.sin(angle) * radiusX;
      let y = -Math.cos(angle) * radiusY + 0.2;
      const z = 2.0 + Math.sin(angle * 0.5) * 0.6; // gentle z drift for depth feel

      // Perspective-aware clamping: visible area shrinks at z>0
      const perspScale = (camera.position.z - z) / camera.position.z;
      const visW = viewport.width * perspScale;
      const visH = viewport.height * perspScale;
      // Margins account for text bounding box (~4 wide, ~0.9 tall after Center)
      const halfW = visW / 2 - 2.5;
      const halfH = visH / 2 - 0.8;

      x = THREE.MathUtils.clamp(x, -halfW, halfW);
      y = THREE.MathUtils.clamp(y, -halfH, halfH);

      groupRef.current.position.set(x, y, z);

      // Face camera but add subtle Y rotation to reveal 3D depth on the letters
      groupRef.current.lookAt(camera.position);
      groupRef.current.rotateY(Math.sin(t * 0.3) * 0.2);
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <group>
          {/* Line 1: AI-Driven — dark extruded text */}
          <Text3D
            font={FONT_URL}
            size={0.32}
            height={0.1}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.01}
            bevelSegments={3}
            curveSegments={12}
            letterSpacing={-0.01}
          >
            AI-Driven
            <meshStandardMaterial
              color="#1a1408"
              metalness={0.2}
              roughness={0.5}
            />
          </Text3D>

          {/* Line 2: Learning Paths — orange/gold extruded text with glow */}
          <Text3D
            font={FONT_URL}
            size={0.32}
            height={0.1}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.01}
            bevelSegments={3}
            curveSegments={12}
            letterSpacing={-0.01}
            position={[0, -0.48, 0]}
          >
            Learning Paths
            <meshStandardMaterial
              color="#ff9a2e"
              metalness={0.3}
              roughness={0.35}
              emissive="#ff9a2e"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </group>
      </Center>
    </group>
  );
}
