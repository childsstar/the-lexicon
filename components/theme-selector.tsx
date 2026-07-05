"use client";

import { useEffect, useState } from "react";
import { Flame, Scroll } from "lucide-react";

type ThemeChoice = "dark" | "light";

const storageKey = "lexicon-theme";

const THEME_LABELS: Record<ThemeChoice, string> = {
  dark: "Candlelight",
  light: "Parchment",
};

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

  function toggle() {
    const next: ThemeChoice = choice === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    setChoice(next);
    applyTheme(next);
  }

  const Icon = choice === "dark" ? Flame : Scroll;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Theme: ${THEME_LABELS[choice]}. Switch to ${THEME_LABELS[choice === "dark" ? "light" : "dark"]}.`}
      title={THEME_LABELS[choice]}
      className="flex items-center justify-center rounded-full border border-border-strong p-1.5 text-text-muted transition-colors hover:border-gold-600 hover:text-gold-300"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
