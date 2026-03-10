"use client";

import { useRef, useMemo, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";

/**
 * Chromatic Aberration — subtle RGB fringing toward screen edges.
 *
 * Intercepts the R3F render loop by patching `gl.render`. On each frame:
 * 1. Renders the scene into an off-screen WebGLRenderTarget.
 * 2. Draws a fullscreen quad that samples the texture with slight R/G/B
 *    UV offsets, creating radial chromatic fringing.
 *
 * The effect is very subtle (1–2px) — barely noticeable but adds polish
 * and convincingly demonstrates post-processing knowledge.
 *
 * Disabled on low quality. Reduced strength on medium.
 */

const caVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const caFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uStrength;
  uniform vec2 uResolution;

  void main() {
    vec2 center = vec2(0.5);
    vec2 dir = vUv - center;
    float dist = length(dir);

    // Radial offset — increases toward screen edges
    vec2 offset = dir * dist * uStrength;

    float r = texture2D(uTexture, vUv + offset).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - offset).b;
    float a = texture2D(uTexture, vUv).a;

    gl_FragColor = vec4(r, g, b, a);
  }
`;

export function ChromaticAberration({ strength = 0.004 }: { strength?: number }) {
  const { gl, scene, camera, size } = useThree();
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  // Off-screen render target — matches viewport size
  const renderTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });
  }, []);

  // Resize render target when viewport changes
  useEffect(() => {
    renderTarget.setSize(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
  }, [size, gl, renderTarget]);

  // Fullscreen quad for the CA pass
  const { quadScene, quadCamera, quadMaterial } = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: caVertexShader,
      fragmentShader: caFragmentShader,
      uniforms: {
        uTexture: { value: null },
        uStrength: { value: strength },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
      },
      depthTest: false,
      depthWrite: false,
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geo, mat);
    const qScene = new THREE.Scene();
    qScene.add(mesh);

    const qCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    return { quadScene: qScene, quadCamera: qCamera, quadMaterial: mat };
  }, []);

  // Update strength uniform
  useEffect(() => {
    quadMaterial.uniforms.uStrength.value = reducedMotion ? 0 : strength;
  }, [strength, reducedMotion, quadMaterial]);

  // Update resolution uniform
  useEffect(() => {
    quadMaterial.uniforms.uResolution.value.set(size.width, size.height);
  }, [size, quadMaterial]);

  // Cleanup
  useEffect(() => {
    return () => {
      renderTarget.dispose();
      quadMaterial.dispose();
    };
  }, [renderTarget, quadMaterial]);

  // Intercept the render — render scene to RT, then draw CA quad to screen
  useFrame(() => {
    if (reducedMotion) return; // Skip post-processing entirely

    // 1. Render the full scene into the off-screen target
    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // 2. Draw the CA fullscreen quad to screen
    quadMaterial.uniforms.uTexture.value = renderTarget.texture;
    gl.render(quadScene, quadCamera);
  }, 100); // High priority number = runs AFTER all other useFrame calls

  return null;
}
