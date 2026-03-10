import { create } from "zustand";

interface AppState {
  isLoaded: boolean;
  scrollProgress: number;
  isMobile: boolean;
  reducedMotion: boolean;
  ttsPlaying: boolean;
  ttsRate: number;

  setLoaded: (loaded: boolean) => void;
  setScrollProgress: (progress: number) => void;
  setIsMobile: (mobile: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setTtsPlaying: (playing: boolean) => void;
  setTtsRate: (rate: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoaded: false,
  scrollProgress: 0,
  isMobile: false,
  reducedMotion: false,
  ttsPlaying: false,
  ttsRate: 1,

  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setTtsPlaying: (playing) => set({ ttsPlaying: playing }),
  setTtsRate: (rate) => set({ ttsRate: rate }),
}));
