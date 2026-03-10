"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { getHeartbeat } from "@/lib/heartbeat";

/**
 * GPU Instanced Particles — single draw call for thousands of particles.
 *
 * Uses InstancedMesh with a custom ShaderMaterial. Per-instance attributes
 * (aOffset, aScale, aPhase) are set once at init. All animation happens
 * in the vertex shader via uTime + uHeartbeat uniforms — zero JS per-frame work.
 */

const particleVertexShader = `
  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aPhase;

  uniform float uTime;
  uniform float uHeartbeat;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Orbital drift — each particle slowly orbits around Y axis
    float angle = uTime * 0.05 + aPhase * 6.2832;
    float cosA = cos(angle);
    float sinA = sin(angle);
    vec3 pos = aOffset;
    vec3 rotated = vec3(
      pos.x * cosA - pos.z * sinA,
      pos.y,
      pos.x * sinA + pos.z * cosA
    );

    // Heartbeat expansion — scatter outward
    float expand = 1.0 + uHeartbeat * 0.15;
    rotated *= expand;

    // Apply instance scale with heartbeat pulse
    float s = aScale * (1.0 + uHeartbeat * 0.5);

    // Billboard: scale the local vertex position
    vec3 worldPos = rotated + position * s;

    // Color variation based on phase
    float colorMix = sin(aPhase * 12.566) * 0.5 + 0.5;
    vColor = mix(
      vec3(0.82, 0.44, 0.09),   // #d07018
      vec3(1.0, 0.60, 0.18),     // #ff9a2e
      colorMix
    );

    // Twinkle alpha
    float twinkle = sin(uTime * (1.5 + aPhase * 2.0) + aPhase * 6.2832) * 0.5 + 0.5;
    vAlpha = (0.5 + twinkle * 0.5) * (0.7 + uHeartbeat * 0.3);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`;

const particleFragmentShader = `
  precision highp float;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Soft sphere: fade at edges for round appearance
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float dist = length(uv);
    if (dist > 1.0) discard;

    float softEdge = 1.0 - smoothstep(0.5, 1.0, dist);
    gl_FragColor = vec4(vColor, vAlpha * softEdge);
  }
`;

export function InstancedParticles({
  count = 1000,
  radius = 1.6,
}: {
  count?: number;
  radius?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-compute per-instance data
  const { offsets, scales, phases } = useMemo(() => {
    const offsets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);

    // Golden angle distribution for even sphere coverage
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      const r = radius + (Math.random() - 0.5) * 0.6;
      offsets[i * 3] = Math.cos(theta) * radiusAtY * r;
      offsets[i * 3 + 1] = y * r;
      offsets[i * 3 + 2] = Math.sin(theta) * radiusAtY * r;

      scales[i] = 0.02 + Math.random() * 0.04;
      phases[i] = Math.random();
    }

    return { offsets, scales, phases };
  }, [count, radius]);

  // Initialize instance matrices (identity — actual positioning done in shader)
  useMemo(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  // Set instance attributes once geometry mounts
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 6, 6);

    // Add per-instance attributes
    geo.setAttribute(
      "aOffset",
      new THREE.InstancedBufferAttribute(offsets, 3)
    );
    geo.setAttribute(
      "aScale",
      new THREE.InstancedBufferAttribute(scales, 1)
    );
    geo.setAttribute(
      "aPhase",
      new THREE.InstancedBufferAttribute(phases, 1)
    );

    return geo;
  }, [offsets, scales, phases]);

  // Update only two uniforms per frame — everything else on GPU
  useAnimationFrame((state) => {
    if (matRef.current) {
      const t = state.clock.getElapsedTime();
      matRef.current.uniforms.uTime.value = t;
      matRef.current.uniforms.uHeartbeat.value = getHeartbeat(t, 0.1);
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uHeartbeat: { value: 0 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </instancedMesh>
  );
}
