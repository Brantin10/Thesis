"use client";

import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { getHeartbeat } from "@/lib/heartbeat";
import { QUALITY_PRESETS } from "@/lib/qualityPresets";
import { LearningPathSteps } from "./LearningPathSteps";
import { NerveConnections } from "./NerveConnections";
import { ParticleField } from "./ParticleField";
import { FloatingTitle } from "./FloatingTitle";
import { InstancedParticles } from "./InstancedParticles";
import { GlowHalo } from "./GlowHalo";
import { InteractiveBrainRegion } from "./InteractiveBrainRegion";

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
    vec3 norm = normalize(vNormal);

    // ── Enhanced Fresnel with animated rim light direction ──
    // Animated rim light direction — sweeps around the sphere
    vec3 rimDir = normalize(vec3(
      sin(t * 0.3) * 0.5,
      cos(t * 0.4) * 0.3,
      1.0
    ));
    float dirFresnel = 1.0 - abs(dot(rimDir, norm));
    dirFresnel = pow(dirFresnel, 2.0);

    float viewFresnel = 1.0 - abs(dot(viewDir, norm));
    viewFresnel = pow(viewFresnel, 1.5);

    // Combine: standard fresnel + directional highlight
    float fresnel = max(viewFresnel, dirFresnel * 0.6);

    vec3 n = norm;
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

    // ── Heartbeat-driven rim color shift ──
    vec3 rimBaseColor = vec3(1.0, 0.5, 0.08);  // orange
    vec3 rimPeakColor = vec3(1.0, 0.95, 0.85); // bright white
    vec3 rimColor = mix(rimBaseColor, rimPeakColor, uHeartbeat);
    col = mix(col, rimColor, fresnel * (0.5 + uHeartbeat * 0.5));

    float brightness = (surface * 0.8 + fresnel * 1.0) * breath;
    float alpha = (surface * 0.5 + fresnel * 0.85) * breath;
    alpha = clamp(alpha, 0.12, 0.95);

    // Heartbeat brightness surge — dramatic flash
    brightness *= (1.0 + uHeartbeat * 2.0);
    alpha = clamp(alpha + uHeartbeat * 0.35, 0.12, 1.0);

    // Color shift toward warm white at heartbeat peak
    vec3 hotWhite = vec3(1.0, 0.92, 0.7);
    col = mix(col, hotWhite, uHeartbeat * 0.4);

    gl_FragColor = vec4(col * brightness * 2.0, alpha);
  }
`;

// ─── Core Brain Sphere — independent scale pulse ────────────────────────────

function CoreSphere() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useAnimationFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const heartbeat = getHeartbeat(t);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
      matRef.current.uniforms.uHeartbeat.value = heartbeat;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
      const scale = 1.0 + heartbeat * 0.12;
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

  useAnimationFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.08;
      const t = state.clock.getElapsedTime();
      const heartbeat = getHeartbeat(t);
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.7 + heartbeat * 0.5;
      const scale = 1.0 + heartbeat * 0.25;
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

// ─── Wireframe Shell Fresnel Shaders ─────────────────────────────────────────

const wireframeVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const wireframeFragmentShader = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uOpacity;
  uniform float uHeartbeat;
  uniform vec3 uColor;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);

    // Heartbeat rim glow
    vec3 rimColor = mix(uColor, vec3(1.0, 0.9, 0.7), uHeartbeat * 0.6);
    float alpha = uOpacity + fresnel * 0.4 + uHeartbeat * 0.2;

    gl_FragColor = vec4(mix(uColor, rimColor, fresnel), alpha);
  }
`;

// ─── Wireframe Shell — breathes outward on heartbeat with fresnel ────────────

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
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useAnimationFrame((state, delta) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const heartbeat = getHeartbeat(t, 0.05);

      ref.current.rotation.y += delta * rotSpeedY;
      ref.current.rotation.x += delta * rotSpeedX;

      const scale = 1.0 + heartbeat * 0.12;
      ref.current.scale.setScalar(scale);

      if (matRef.current) {
        matRef.current.uniforms.uHeartbeat.value = heartbeat;
      }
    }
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[radius, detail]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={wireframeVertexShader}
        fragmentShader={wireframeFragmentShader}
        wireframe
        transparent
        depthWrite={false}
        uniforms={{
          uOpacity: { value: opacity },
          uHeartbeat: { value: 0 },
          uColor: { value: colorObj },
        }}
      />
    </mesh>
  );
}

// ─── Orbital Ring Fresnel Shaders ─────────────────────────────────────────────

const ringVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragmentShader = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uOpacity;
  uniform float uHeartbeat;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);

    vec3 baseColor = vec3(0.82, 0.44, 0.09); // #d07018
    vec3 rimColor = mix(baseColor, vec3(1.0, 0.85, 0.6), uHeartbeat * 0.7);

    float alpha = uOpacity + fresnel * 0.3 + uHeartbeat * 0.25;
    vec3 finalColor = mix(baseColor, rimColor, fresnel);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ─── Orbital Ring — staggered heartbeat ripple with fresnel ──────────────────

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
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useAnimationFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const heartbeat = getHeartbeat(t, heartbeatDelay);

    if (ref.current) {
      const speedMult = 1.0 + heartbeat * 1.5;
      ref.current.rotation.y += delta * speed * speedMult;
    }
    if (meshRef.current) {
      const scale = 1.0 + heartbeat * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
    if (matRef.current) {
      matRef.current.uniforms.uHeartbeat.value = heartbeat;
    }
  });

  return (
    <group ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[radius, tube, 16, 128]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={ringVertexShader}
          fragmentShader={ringFragmentShader}
          transparent
          depthWrite={false}
          uniforms={{
            uOpacity: { value: opacity },
            uHeartbeat: { value: 0 },
          }}
        />
      </mesh>
    </group>
  );
}

// ─── Heartbeat Light — pulsing point light at orb center ────────────────────

function HeartbeatLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useAnimationFrame((state) => {
    const t = state.clock.getElapsedTime();
    const heartbeat = getHeartbeat(t);
    if (lightRef.current) {
      lightRef.current.intensity = heartbeat * 3.0;
      lightRef.current.color.setHSL(
        0.08 - heartbeat * 0.02,
        0.9 - heartbeat * 0.2,
        0.5 + heartbeat * 0.2
      );
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 0]}
      intensity={0}
      distance={8}
      decay={2}
      color="#ff9a2e"
    />
  );
}

// ─── Heartbeat Shockwave — expanding ring of brightness ─────────────────────

const shockwaveVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shockwaveFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = length(vUv - center) * 2.0;

    float period = 6.2832 / 2.5;
    float phase = mod(uTime, period) / period;

    float ringRadius = phase;
    float ringDist = abs(dist - ringRadius);
    float ringWidth = 0.04 + phase * 0.06;
    float ring = exp(-ringDist * ringDist / (2.0 * ringWidth * ringWidth));

    float fade = exp(-phase * 3.0);

    float heartRaw = sin(uTime * 2.5) * 0.5 + 0.5;
    float heartbeat = pow(max(0.0, heartRaw), 4.0);
    float activation = smoothstep(0.02, 0.1, heartbeat + phase * 0.3);

    float alpha = ring * fade * activation * 0.6;

    vec3 color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.9, 0.7), ring * 0.3);

    gl_FragColor = vec4(color, alpha);
  }
`;

function HeartbeatShockwave() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useAnimationFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0.05]}>
      <planeGeometry args={[16, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={shockwaveVertexShader}
        fragmentShader={shockwaveFragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Main Scene ─────────────────────────────────────────────────────────────

export function HeroScene() {
  const scrollProgress = useAppStore((s) => s.scrollProgress);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const qualityLevel = useAppStore((s) => s.qualityLevel);
  const quality = QUALITY_PRESETS[qualityLevel];
  const groupRef = useRef<THREE.Group>(null);

  // Scroll-based camera movement — keep as regular useFrame (user-initiated)
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#fff5e0" />
      <directionalLight
        position={[-4, 3, 6]}
        intensity={0.3}
        color="#ffe8cc"
      />
      <directionalLight
        position={[0, -2, -6]}
        intensity={0.2}
        color="#ffe0b0"
      />

      <group ref={groupRef}>
        <Float
          speed={reducedMotion ? 0 : 1.5}
          rotationIntensity={reducedMotion ? 0 : 0.15}
          floatIntensity={reducedMotion ? 0 : 0.3}
        >
          <group>
            {/* Interactive region: Neural Network Core */}
            <InteractiveBrainRegion regionId="core">
              <CoreSphere />
              <HeartbeatLight />
              <InnerGlow />
              {/* Fake bloom glow halos */}
              <GlowHalo
                type="sphere"
                size={1.2}
                glowScale={1.12}
                color="#ff9a2e"
                baseOpacity={0.06}
                peakOpacity={0.2}
              />
              <GlowHalo
                type="sphere"
                size={0.5}
                glowScale={1.2}
                color="#e87a10"
                baseOpacity={0.05}
                peakOpacity={0.18}
              />
            </InteractiveBrainRegion>

            {/* Interactive region: Data Processing Layer */}
            <InteractiveBrainRegion regionId="shell">
              <WireframeShell
                radius={0.85}
                detail={2}
                rotSpeedY={-0.15}
                rotSpeedX={0.05}
                color="#c96a10"
                opacity={0.45}
              />
            </InteractiveBrainRegion>

            {/* Interactive region: Attention Mechanism Orbits */}
            <InteractiveBrainRegion regionId="orbits">
              <OrbitalRing
                radius={1.5}
                tiltX={0}
                tiltZ={0}
                speed={0.3}
                opacity={0.7}
                tube={0.012}
                heartbeatDelay={0.06}
              />
              <OrbitalRing
                radius={1.55}
                tiltX={Math.PI / 4}
                tiltZ={0.2}
                speed={-0.2}
                opacity={0.55}
                tube={0.01}
                heartbeatDelay={0.12}
              />
              <OrbitalRing
                radius={1.45}
                tiltX={-Math.PI / 6}
                tiltZ={-0.3}
                speed={0.25}
                opacity={0.5}
                tube={0.01}
                heartbeatDelay={0.18}
              />
              <OrbitalRing
                radius={1.7}
                tiltX={Math.PI / 3}
                tiltZ={0.5}
                speed={0.15}
                opacity={0.35}
                tube={0.008}
                heartbeatDelay={0.24}
              />
            </InteractiveBrainRegion>

            {/* Interactive region: Training Data Field */}
            <InteractiveBrainRegion regionId="particles">
              <InstancedParticles
                count={quality.particleCount}
                radius={1.6}
              />
            </InteractiveBrainRegion>

            {quality.enableShockwave && <HeartbeatShockwave />}
          </group>
        </Float>

        <NerveConnections />
        <LearningPathSteps />
      </group>

      {/* 3D floating title — Suspense for font loading */}
      <Suspense fallback={null}>
        <FloatingTitle />
      </Suspense>

      {/* Background particles */}
      <ParticleField count={quality.backgroundParticleCount} />

      {/* Amber sparkles */}
      <Sparkles
        count={quality.sparkleCount}
        scale={15}
        size={2}
        speed={reducedMotion ? 0 : 0.3}
        color="#e08020"
        opacity={0.5}
      />
    </>
  );
}
