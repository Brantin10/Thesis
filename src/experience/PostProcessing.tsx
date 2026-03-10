"use client";

// PostProcessing disabled — EffectComposer renders to its own framebuffer
// which causes the custom background shader plane to appear black.
// The scene uses a shader plane at z=-20 instead of scene.background,
// which EffectComposer doesn't composite properly.
export function PostProcessing() {
  return null;
}
