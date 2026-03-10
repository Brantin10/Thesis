"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { HEARTBEAT_PERIOD } from "@/lib/heartbeat";

/**
 * Sound Design — Web Audio API ambient hum + heartbeat thump.
 *
 * Ambient hum: Two sine oscillators (55Hz fundamental + 110Hz harmonic)
 * routed through a low-pass filter (200Hz cutoff) at very low gain.
 * Creates a subtle "machine room" ambience.
 *
 * Heartbeat thump: On-demand oscillator triggered every HEARTBEAT_PERIOD
 * (~2.5s). 80Hz→40Hz pitch drop with fast gain envelope (0.15→0.001
 * over 300ms). Sounds like a soft thud.
 *
 * AudioContext created only on user gesture (click) to comply with
 * browser autoplay policy. Disabled when reducedMotion is active.
 */

export function useAudioEngine() {
  const audioEnabled = useAppStore((s) => s.audioEnabled);
  const audioVolume = useAppStore((s) => s.audioVolume);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const ambientGain = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const heartbeatTimer = useRef<number>(0);
  const isInitialized = useRef(false);

  // Initialize audio context (called once on first user gesture)
  const initAudio = useCallback(() => {
    if (isInitialized.current || reducedMotion) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Master gain — controls overall volume
    const master = ctx.createGain();
    master.gain.value = audioVolume;
    master.connect(ctx.destination);
    masterGain.current = master;

    // Ambient gain — sub-mix for the hum
    const ambGain = ctx.createGain();
    ambGain.gain.value = 0;
    ambientGain.current = ambGain;

    // Low-pass filter for warmth
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 200;
    lpf.Q.value = 1;
    lpf.connect(ambGain);
    ambGain.connect(master);

    // Oscillator 1: fundamental 55Hz
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55;
    const g1 = ctx.createGain();
    g1.gain.value = 0.06;
    osc1.connect(g1);
    g1.connect(lpf);
    osc1.start();
    osc1Ref.current = osc1;

    // Oscillator 2: harmonic 110Hz
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 110;
    const g2 = ctx.createGain();
    g2.gain.value = 0.02;
    osc2.connect(g2);
    g2.connect(lpf);
    osc2.start();
    osc2Ref.current = osc2;

    isInitialized.current = true;
  }, [reducedMotion, audioVolume]);

  // Heartbeat thump — triggered on an interval
  const playThump = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterGain.current;
    if (!ctx || !master) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.35);
  }, []);

  // Start/stop ambient + heartbeat based on audioEnabled
  useEffect(() => {
    if (!isInitialized.current) return;

    const ctx = ctxRef.current;
    const ambGain = ambientGain.current;
    if (!ctx || !ambGain) return;

    if (audioEnabled && !reducedMotion) {
      // Resume context if suspended
      if (ctx.state === "suspended") ctx.resume();

      // Fade in ambient
      ambGain.gain.cancelScheduledValues(ctx.currentTime);
      ambGain.gain.setValueAtTime(ambGain.gain.value, ctx.currentTime);
      ambGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.5);

      // Start heartbeat thumps
      playThump(); // immediate first thump
      heartbeatTimer.current = window.setInterval(
        playThump,
        HEARTBEAT_PERIOD * 1000
      );
    } else {
      // Fade out ambient
      ambGain.gain.cancelScheduledValues(ctx.currentTime);
      ambGain.gain.setValueAtTime(ambGain.gain.value, ctx.currentTime);
      ambGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      // Stop heartbeat thumps
      clearInterval(heartbeatTimer.current);
    }

    return () => {
      clearInterval(heartbeatTimer.current);
    };
  }, [audioEnabled, reducedMotion, playThump]);

  // Update master volume
  useEffect(() => {
    if (masterGain.current && ctxRef.current) {
      masterGain.current.gain.setValueAtTime(
        audioVolume,
        ctxRef.current.currentTime
      );
    }
  }, [audioVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(heartbeatTimer.current);
      osc1Ref.current?.stop();
      osc2Ref.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

  return { initAudio };
}
