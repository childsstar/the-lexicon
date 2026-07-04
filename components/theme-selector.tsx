"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "dark" | "light";

const storageKey = "lexicon-theme";

function normalizeThemeChoice(choice: string | null): ThemeChoice {
  return choice === "light" ? "light" : "dark";
}

function applyTheme(choice: ThemeChoice) {
  document.documentElement.dataset.theme = choice;
  document.documentElement.dataset.themeChoice = choice;
}

export default function ThemeSelector() {
  const [choice, setChoice] = useState<ThemeChoice>("dark");

  useEffect(() => {
    const next = normalizeThemeChoice(localStorage.getItem(storageKey));
    setChoice(next);
    applyTheme(next);
  }, []);

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-text-muted">
      <span className="hidden md:inline">Theme</span>
      <select
        aria-label="Theme"
        className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-text transition-colors focus:border-gold-500 focus:outline-none"
        value={choice}
        onChange={(event) => {
          const next = event.target.value as ThemeChoice;
          localStorage.setItem(storageKey, next);
          setChoice(next);
          applyTheme(next);
        }}
      >
        <option value="dark">Candlelight</option>
        <option value="light">Parchment (experimental)</option>
      </select>
    </label>
  );
}
