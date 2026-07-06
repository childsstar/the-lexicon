"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchLocationSuggestions } from "@/lib/venues";

/**
 * Chip list + combobox for home locations. Replaces free-typed
 * comma-separated text: each location is its own removable chip, and
 * suggestions are drawn from cities/ZIPs already on file for venues, so
 * typing points at real communities instead of relying on exact formatting.
 */
export default function LocationTagInput({
  id,
  values,
  onChange,
  placeholder,
}: {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    let cancelled = false;
    fetchLocationSuggestions(getSupabaseClient()).then((locations) => {
      if (!cancelled) setSuggestions(locations);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    const taken = new Set(values.map((v) => v.toLowerCase()));
    return suggestions
      .filter((s) => !taken.has(s.toLowerCase()))
      .filter((s) => !query || s.toLowerCase().includes(query))
      .slice(0, 8);
  }, [suggestions, inputValue, values]);

  function addLocation(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    onChange([...values, trimmed]);
    setInputValue("");
    setHighlighted(0);
  }

  function removeLocation(target: string) {
    onChange(values.filter((v) => v !== target));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (open && filtered[highlighted]) {
        addLocation(filtered[highlighted]);
      } else {
        addLocation(inputValue);
      }
      setOpen(false);
    } else if (e.key === "Backspace" && inputValue === "" && values.length > 0) {
      removeLocation(values[values.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 transition-colors focus-within:border-gold-500">
        {values.map((loc) => (
          <span
            key={loc}
            className="inline-flex items-center gap-1 rounded-full border border-gold-600/40 bg-gold-500/10 py-1 pl-3 pr-1.5 text-xs font-medium text-gold-200"
          >
            {loc}
            <button
              type="button"
              onClick={() => removeLocation(loc)}
              aria-label={`Remove ${loc}`}
              className="rounded-full px-1 text-gold-300/70 hover:bg-gold-500/20 hover:text-gold-100"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-controls={listboxId}
          autoComplete="off"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 100);
          }}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : "Add another…"}
          className="min-w-32 flex-1 bg-transparent py-1 text-sm text-text outline-none placeholder:text-text-subtle"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface shadow-lg"
        >
          {filtered.map((s, i) => (
            <li key={s} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  addLocation(s);
                  inputRef.current?.focus();
                }}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  i === highlighted
                    ? "bg-gold-500/15 text-gold-200"
                    : "text-text-muted hover:bg-gold-500/10 hover:text-gold-200"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
