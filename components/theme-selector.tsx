"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "system" | "dark" | "light";

const storageKey = "lexicon-theme";

function resolveTheme(choice: ThemeChoice) {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(choice: ThemeChoice) {
  const theme = resolveTheme(choice);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeChoice = choice;
}

export default function ThemeSelector() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeChoice | null;
    const next = stored === "dark" || stored === "light" ? stored : "system";
    setChoice(next);
    applyTheme(next);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const syncSystemTheme = () => {
      if ((localStorage.getItem(storageKey) || "system") === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", syncSystemTheme);
    return () => media.removeEventListener("change", syncSystemTheme);
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
        <option value="system">System</option>
        <option value="dark">Candlelight</option>
        <option value="light">Parchment</option>
      </select>
    </label>
  );
}
