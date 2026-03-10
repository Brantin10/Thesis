"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { LearningPathSteps } from "./LearningPathSteps";
import { NerveConnections } from "./NerveConnections";
import { ParticleField } from "./ParticleField";
import { FloatingTitle } from "./FloatingTitle";

// ─── Core Sphere Shaders ────────────────────────────────────────────────────

const coreVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coreFragmentShader = `
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uHeartbeat;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1, 0)), f.x),
      mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x),
      f.y
    );
  }

  vec2 hexGrid(vec2 uv, float scale) {
    uv *= scale;
    vec2 r = vec2(1.0, 1.732);
    vec2 h = r * 0.5;
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    vec2 gv = (dot(a, a) < dot(b, b)) ? a : b;
    float cellDist = max(abs(gv.x), abs(gv.y * 0.577 + abs(gv.x) * 0.5));
    float edge = smoothstep(0.46, 0.50, cellDist);
    return vec2(edge, hash(floor(uv / r)));
  }

  void main() {
    float t = uTime;

    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    fresnel = pow(fresnel, 1.5);

    vec3 n = normalize(vNormal);
    float theta = acos(clamp(n.y, -1.0, 1.0));
    float phi = atan(n.z, n.x);
    vec2 sphereUV = vec2(phi / 6.2832 + 0.5, theta / 3.1416);

    vec2 hex = hexGrid(sphereUV + vec2(t * 0.02, 0.0), 12.0);
    float hexEdge = hex.x;
    float hexId = hex.y;

    float traceH = smoothstep(0.47, 0.50, fract(sphereUV.x * 30.0 + t * 0.1));
    float traceV = smoothstep(0.47, 0.50, fract(sphereUV.y * 20.0 + t * 0.08));
    float traces = max(traceH, traceV) * 0.25;

    float pulse = sin(t * 2.0 + hexId * 6.2832) * 0.5 + 0.5;
    float dataGlow = (hexId > 0.55) ? pulse * 0.5 : 0.0;

    float surface = hexEdge * 0.45 + traces + dataGlow;
    float breath = 0.85 + 0.15 * sin(t * 1.5);

    vec3 baseCol = vec3(0.85, 0.35, 0.02);
    vec3 hiCol = vec3(1.0, 0.5, 0.08);
    vec3 hotCol = vec3(1.0, 0.7, 0.25);

    vec3 col = mix(baseCol, hiCol, surface);
    col = mix(col, hotCol, fresnel * 0.5);

    float brightness = (surface * 0.8 + fresnel * 1.0) * breath;
    float alpha = (surface * 0.5 + fresnel * 0.85) * breath;
    alpha = clamp(alpha, 0.12, 0.95);

    // Heartbeat brightness surge
    brightness *= (1.0 + uHeartbeat * 0.6);
    alpha = clamp(alpha + uHeartbeat * 0.15, 0.12, 0.98);

    gl_FragColor = vec4(col * brightness * 2.0, alpha);
  }
`;

// ─── Heartbeat helper ───────────────────────────────────────────────────────

function getHeartbeat(t: number, delay = 0): number {
  return Math.pow(Math.max(0, Math.sin((t - delay) * 2.5) * 0.5 + 0.5), 4);
}

// ─── Core Brain Sphere — independent scale pulse ────────────────────────────

function CoreSphere() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const heartbeat = getHeartbeat(t);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
      matRef.current.uniforms.uHeartbeat.value = heartbeat;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
      // Independent scale pulse — core swells 8%
      const scale = 1.0 + heartbeat * 0.08;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 4]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={coreVertexShader}
        fragmentShader={coreFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uHeartbeat: { value: 0 },
        }}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

// ─── Inner Glow Core — flares bigger on heartbeat ───────────────────────────

function InnerGlow() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.08;
      const t = state.clock.getElapsedTime();
      const heartbeat = getHeartbeat(t);
      // Opacity flare
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.7 + heartbeat * 0.3;
      // Scale pump — 15% bigger than core for visual depth
      const scale = 1.0 + heartbeat * 0.15;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.5, 3]} />
      <meshBasicMaterial
        color="#e87a10"
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Wireframe Shell — breathes outward on heartbeat ────────────────────────

function WireframeShell({
  radius,
  detail,
  rotSpeedY,
  rotSpeedX = 0,
  color,
  opacity,
}: {
  radius: number;
  detail: number;
  rotSpeedY: number;
  rotSpeedX?: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const heartbeat = getHeartbeat(t, 0.05); // slight delay after core

      ref.current.rotation.y += delta * rotSpeedY;
      ref.current.rotation.x += delta * rotSpeedX;

      // Breathe outward — 12% expansion
      const scale = 1.0 + heartbeat * 0.12;
      ref.current.scale.setScalar(scale);

      // Opacity surge
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        opacity + heartbeat * 0.2;
    }
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[radius, detail]} />
      <meshBasicMaterial
        wireframe
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Orbital Ring — staggered heartbeat ripple ──────────────────────────────

function OrbitalRing({
  radius,
  tiltX,
  tiltZ,
  speed,
  opacity = 0.4,
  tube = 0.006,
  heartbeatDelay = 0,
}: {
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  opacity?: number;
  tube?: number;
  heartbeatDelay?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const heartbeat = getHeartbeat(t, heartbeatDelay);

    if (ref.current) {
      // Speed surge on heartbeat — rotation speeds up briefly
      const speedMult = 1.0 + heartbeat * 1.5;
      ref.current.rotation.y += delta * speed * speedMult;
    }
    if (meshRef.current) {
      // Scale ripple — ring expands outward
      const scale = 1.0 + heartbeat * 0.10;
      meshRef.current.scale.setScalar(scale);

      // Opacity pulse
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
        opacity + heartbeat * 0.25;
    }
  });

  return (
    <group ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[radius, tube, 16, 128]} />
        <meshBasicMaterial
          color="#d07018"
          transparent
          opacity={opacity}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── Data Points — scatter outward on heartbeat ─────────────────────────────

function DataPoints({ count = 40, radius = 1.6 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + (Math.random() - 0.5) * 0.4;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius]);

  useFrame((state, delta) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const heartbeat = getHeartbeat(t, 0.1); // slight delay

      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.x += delta * 0.02;

      // Points scatter outward on beat — 15% expansion
      const scale = 1.0 + heartbeat * 0.15;
      ref.current.scale.setScalar(scale);
    }
    // Point size surge — grow brighter/larger on beat
    if (matRef.current) {
      const t = state.clock.getElapsedTime();
      const heartbeat = getHeartbeat(t, 0.1);
      matRef.current.size = 0.06 + heartbeat * 0.03;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        ref={matRef}
        color="#d07018"
        size={0.06}
        transparent
        opacity={0.9}
        blending={THREE.NormalBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Main Scene ─────────────────────────────────────────────────────────────

export function HeroScene() {
  const scrollProgress = useAppStore((s) => s.scrollProgress);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const targetZ = 8 + scrollProgress * 15;
      const targetY = scrollProgress * -3;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.05
      );
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        -targetZ + 8,
        0.05
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#fff5e0" />

      <group ref={groupRef}>
        <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
          <group>
            <CoreSphere />
            <InnerGlow />
            <WireframeShell
              radius={0.85}
              detail={2}
              rotSpeedY={-0.15}
              rotSpeedX={0.05}
              color="#c96a10"
              opacity={0.45}
            />
            {/* Orbital rings with staggered heartbeat delays */}
            <OrbitalRing radius={1.5} tiltX={0} tiltZ={0} speed={0.3} opacity={0.7} tube={0.012} heartbeatDelay={0.06} />
            <OrbitalRing radius={1.55} tiltX={Math.PI / 4} tiltZ={0.2} speed={-0.2} opacity={0.55} tube={0.01} heartbeatDelay={0.12} />
            <OrbitalRing radius={1.45} tiltX={-Math.PI / 6} tiltZ={-0.3} speed={0.25} opacity={0.5} tube={0.01} heartbeatDelay={0.18} />
            <OrbitalRing radius={1.7} tiltX={Math.PI / 3} tiltZ={0.5} speed={0.15} opacity={0.35} tube={0.008} heartbeatDelay={0.24} />
            <DataPoints count={70} radius={1.6} />
          </group>
        </Float>

        <NerveConnections />
        <LearningPathSteps />
      </group>

      {/* 3D floating title */}
      <FloatingTitle />

      {/* Background particles */}
      <ParticleField />

      {/* Amber sparkles */}
      <Sparkles
        count={100}
        scale={15}
        size={2}
        speed={0.3}
        color="#e08020"
        opacity={0.5}
      />
    </>
  );
}
