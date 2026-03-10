"use client";

import { useTTS } from "@/hooks/useTTS";
import clsx from "clsx";

export function TTSControls() {
  const {
    speak,
    pause,
    resume,
    stop,
    speaking,
    paused,
    rate,
    setRate,
    voices,
    selectedVoice,
    setSelectedVoice,
  } = useTTS();

  function handlePlayPause() {
    if (speaking && !paused) {
      pause();
    } else if (paused) {
      resume();
    } else {
      const content = document.querySelector("[data-thesis-content]");
      if (content) {
        speak(content.textContent || "");
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Play / Pause */}
      <button
        onClick={handlePlayPause}
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
          speaking
            ? "bg-accent text-white shadow-sm shadow-accent/20"
            : "bg-primary/5 text-secondary hover:bg-accent/10 hover:text-accent"
        )}
        aria-label={speaking && !paused ? "Pause" : "Play"}
      >
        {speaking && !paused ? (
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Stop */}
      {speaking && (
        <button
          onClick={stop}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
          aria-label="Stop"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        </button>
      )}

      {/* Speed */}
      <select
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        className="rounded-lg border border-accent/10 bg-surface px-2 py-1 text-xs text-secondary"
      >
        <option value={0.5}>0.5x</option>
        <option value={0.75}>0.75x</option>
        <option value={1}>1x</option>
        <option value={1.25}>1.25x</option>
        <option value={1.5}>1.5x</option>
        <option value={2}>2x</option>
      </select>

      {/* Voice */}
      {voices.length > 0 && (
        <select
          value={selectedVoice?.name || ""}
          onChange={(e) => {
            const voice = voices.find((v) => v.name === e.target.value);
            if (voice) setSelectedVoice(voice);
          }}
          className="max-w-[140px] truncate rounded-lg border border-accent/10 bg-surface px-2 py-1 text-xs text-secondary"
        >
          {voices
            .filter((v) => v.lang.startsWith("en"))
            .map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
        </select>
      )}
    </div>
  );
}
