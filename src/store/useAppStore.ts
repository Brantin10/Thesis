import { create } from "zustand";
import type { QualityLevel } from "@/lib/qualityPresets";

interface AppState {
  isLoaded: boolean;
  scrollProgress: number;
  isMobile: boolean;
  reducedMotion: boolean;
  ttsPlaying: boolean;
  ttsRate: number;

  // Adaptive quality
  qualityLevel: QualityLevel;

  // Interactive brain regions
  hoveredRegion: string | null;

  // Audio
  audioEnabled: boolean;
  audioVolume: number;

  setLoaded: (loaded: boolean) => void;
  setScrollProgress: (progress: number) => void;
  setIsMobile: (mobile: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setTtsPlaying: (playing: boolean) => void;
  setTtsRate: (rate: number) => void;
  setQualityLevel: (level: QualityLevel) => void;
  setHoveredRegion: (id: string | null) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setAudioVolume: (volume: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoaded: false,
  scrollProgress: 0,
  isMobile: false,
  reducedMotion: false,
  ttsPlaying: false,
  ttsRate: 1,
  qualityLevel: "medium",
  hoveredRegion: null,
  audioEnabled: false,
  audioVolume: 0.5,

  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setTtsPlaying: (playing) => set({ ttsPlaying: playing }),
  setTtsRate: (rate) => set({ ttsRate: rate }),
  setQualityLevel: (level) => set({ qualityLevel: level }),
  setHoveredRegion: (id) => set({ hoveredRegion: id }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setAudioVolume: (volume) => set({ audioVolume: volume }),
}));
