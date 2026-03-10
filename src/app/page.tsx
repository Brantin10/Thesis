"use client";

import { SceneCanvas } from "@/experience/SceneCanvas";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Abstract } from "@/sections/Abstract";
import { Methods } from "@/sections/Methods";
import { Results } from "@/sections/Results";
import { ReadThesis } from "@/sections/ReadThesis";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useViewport } from "@/hooks/useViewport";
import { useLenisScroll } from "@/hooks/useLenis";
import { useAdaptiveQuality } from "@/hooks/useAdaptiveQuality";

export default function Home() {
  useScrollProgress();
  useViewport();
  useLenisScroll();
  useAdaptiveQuality();

  return (
    <>
      <SceneCanvas />
      <Navigation />
      <main className="content-layer">
        <Hero />
        <Abstract />
        <Methods />
        <Results />
        <ReadThesis />
      </main>
      <Footer />
    </>
  );
}
