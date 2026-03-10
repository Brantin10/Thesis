/**
 * Adaptive quality presets — tuned per GPU tier.
 * Driven by detect-gpu (bundled in drei).
 */

export type QualityLevel = "low" | "medium" | "high";

export interface QualitySettings {
  particleCount: number;
  backgroundParticleCount: number;
  sparkleCount: number;
  dpr: [number, number];
  enableShockwave: boolean;
  enableNerveGlow: boolean;
  enableChromaticAberration: boolean;
  chromaticStrength: number;
  shaderDetail: "simple" | "full";
}

export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  low: {
    particleCount: 200,
    backgroundParticleCount: 150,
    sparkleCount: 30,
    dpr: [1, 1],
    enableShockwave: false,
    enableNerveGlow: false,
    enableChromaticAberration: false,
    chromaticStrength: 0,
    shaderDetail: "simple",
  },
  medium: {
    particleCount: 600,
    backgroundParticleCount: 350,
    sparkleCount: 60,
    dpr: [1, 1.5],
    enableShockwave: true,
    enableNerveGlow: true,
    enableChromaticAberration: true,
    chromaticStrength: 0.002,
    shaderDetail: "full",
  },
  high: {
    particleCount: 1500,
    backgroundParticleCount: 500,
    sparkleCount: 100,
    dpr: [1, 2],
    enableShockwave: true,
    enableNerveGlow: true,
    enableChromaticAberration: true,
    chromaticStrength: 0.004,
    shaderDetail: "full",
  },
};
