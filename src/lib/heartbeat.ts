/**
 * Shared heartbeat utility — synchronized pulse used across all 3D components.
 * Period ≈ 2.513 seconds (2π / 2.5).
 * Output: 0 at rest → 1 at peak, shaped by pow(x, 4) for sharp spikes.
 */

export function getHeartbeat(t: number, delay = 0): number {
  return Math.pow(Math.max(0, Math.sin((t - delay) * 2.5) * 0.5 + 0.5), 4);
}

export const HEARTBEAT_PERIOD = (2 * Math.PI) / 2.5; // ~2.513 seconds
