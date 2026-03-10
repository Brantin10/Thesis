/**
 * Brain region metadata — maps interactive 3D elements to tooltip content.
 *
 * Each region wraps one or more scene components (CoreSphere, WireframeShell,
 * OrbitalRings, Particles) and displays a glass-morphism tooltip on click.
 */

export interface BrainRegion {
  id: string;
  name: string;
  description: string;
  /** Short technical note shown under the description */
  tech: string;
}

export const BRAIN_REGIONS: Record<string, BrainRegion> = {
  core: {
    id: "core",
    name: "Neural Network Core",
    description:
      "The central processing hub where LLM inference happens — transformers compute attention across token sequences.",
    tech: "Custom GLSL shader · Hex grid · Fresnel rim lighting",
  },
  shell: {
    id: "shell",
    name: "Data Processing Layer",
    description:
      "Tokenization and embedding layers that convert raw text into high-dimensional vector representations.",
    tech: "Wireframe icosahedron · Heartbeat-synced fresnel glow",
  },
  orbits: {
    id: "orbits",
    name: "Attention Mechanism Orbits",
    description:
      "Multi-head attention rings that route information between tokens — the core innovation of transformer architectures.",
    tech: "Torus geometry · Staggered heartbeat delays · Fresnel shader",
  },
  particles: {
    id: "particles",
    name: "Training Data Field",
    description:
      "Thousands of data points representing the training corpus — fine-tuned models learn patterns from domain-specific datasets.",
    tech: "GPU InstancedMesh · Golden-angle distribution · Single draw call",
  },
};
