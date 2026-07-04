"use client";

import { useEffect, useState } from "react";

const phrases = [
  "Warhammer story",
  "tabletop saga",
  "hobby journey",
  "tabletop passport",
  "faction chronicle",
  "campaign legend",
  "gaming circle",
  "next army",
];

const ROTATION_INTERVAL_MS = 3000;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

export function RotatingHeroPhrase() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhraseIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setPhraseIndex((currentIndex) => (currentIndex + 1) % phrases.length);
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [prefersReducedMotion]);

  return (
    <span
      aria-live="off"
      className="inline-block min-w-[18ch] text-gold-300 sm:min-w-[17ch]"
    >
      <span
        key={phraseIndex}
        className="inline-block animate-hero-phrase"
      >
        {phrases[phraseIndex]}
      </span>
    </span>
  );
}
