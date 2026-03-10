"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * AudioControls — fixed bottom-right audio toggle + volume slider.
 *
 * Speaker icon toggles audio on/off. Hover reveals a volume slider.
 * Hidden when reduced motion is active. First click initializes
 * the AudioContext (browser autoplay policy compliance).
 */

export function AudioControls({
  onFirstInteraction,
}: {
  onFirstInteraction: () => void;
}) {
  const audioEnabled = useAppStore((s) => s.audioEnabled);
  const audioVolume = useAppStore((s) => s.audioVolume);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setAudioEnabled = useAppStore((s) => s.setAudioEnabled);
  const setAudioVolume = useAppStore((s) => s.setAudioVolume);

  const [showSlider, setShowSlider] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  if (reducedMotion) return null;

  const handleToggle = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onFirstInteraction();
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowSlider(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowSlider(false), 800);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Volume slider */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          width: showSlider ? "100px" : "0px",
          opacity: showSlider ? 1 : 0,
        }}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={audioVolume}
          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
          className="h-1 w-full cursor-pointer accent-accent"
          style={{ accentColor: "#d07018" }}
        />
      </div>

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-white/60 text-accent backdrop-blur-md transition-all hover:bg-white/80 hover:shadow-md"
        aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
        title={audioEnabled ? "Mute" : "Sound on"}
      >
        {audioEnabled ? (
          // Speaker with waves
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          // Speaker muted
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </div>
  );
}
