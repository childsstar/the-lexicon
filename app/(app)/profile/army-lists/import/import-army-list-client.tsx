"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";

const GAME_SYSTEMS = [
  "Warhammer 40,000",
  "Warhammer Age of Sigmar",
  "Kill Team",
  "The Old World",
  "Horus Heresy",
  "Star Wars: Legion",
  "Marvel: Crisis Protocol",
  "Other / infer from paste",
];

export default function ImportArmyListClient() {
  const router = useRouter();
  const { user, profile, session, loading } = useAuth();
  const [name, setName] = useState("");
  const [gameSystem, setGameSystem] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!rawText.trim()) {
      setError("Paste an army list before importing.");
      return;
    }

    setSubmitting(true);
    try {
      if (loading) {
        setError("Still checking your sign-in session. Please try again in a moment.");
        return;
      }

      const token = session?.access_token;
      if (!user || !token) {
        setError("Sign in to import an army list.");
        return;
      }

      const response = await fetch("/api/army-lists", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          gameSystem: gameSystem === "Other / infer from paste" ? "" : gameSystem,
          rawText,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Army list import failed.");
        return;
      }
      router.push(`/profile/army-lists/${payload.armyList.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Import Army List"
        description="Paste a roster export into the candlelight. The Lexicon will preserve the original script and translate it into recommendation-ready profile data."
        backHref="/profile"
        backLabel="Profile"
      />

      <form onSubmit={handleSubmit} className="card space-y-5 p-5">
        {loading && (
          <div className="rounded-md border border-border bg-surface-raised px-4 py-3 text-sm text-text-muted">
            Checking your Lexicon session before enabling saved imports…
          </div>
        )}

        {!loading && !user && (
          <div className="rounded-md border border-gold-700/50 bg-gold-950/20 px-4 py-3 text-sm text-gold-100">
            <p className="font-semibold">Sign in to import an army list.</p>
            <p className="mt-1 text-gold-100/80">Saved army lists are tied to your commander profile.</p>
          </div>
        )}
        {error && (
          <div className="rounded-md border border-ember-500/50 bg-ember-950/30 px-4 py-3 text-sm text-ember-200">
            {error}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-semibold text-text">Army list name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Friday night Crusade list"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-subtle focus:border-gold-500 focus:outline-none"
          />
          <span className="mt-1 block text-xs text-text-subtle">Optional — useful if you maintain several forces.</span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-text">Game system</span>
          <select
            value={gameSystem}
            onChange={(event) => setGameSystem(event.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:border-gold-500 focus:outline-none"
          >
            <option value="">Infer from paste</option>
            {GAME_SYSTEMS.map((system) => (
              <option key={system} value={system}>{system}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-text">Roster text</span>
          <textarea
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            rows={16}
            placeholder="Paste an export from your roster tool, app, PDF, or a plain text list…"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-text-subtle focus:border-gold-500 focus:outline-none"
          />
          <span className="mt-2 block text-sm text-text-muted">
            Exports from roster tools and plain text lists both work. The MVP only reads pasted text; third-party roster integrations will come later.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting || loading || !user}
          className="w-full rounded-md bg-gold-600 px-6 py-3 text-sm font-bold text-ink shadow-candle transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking session…" : submitting ? "Reading the roster…" : "Import army list"}
        </button>
        {!loading && user && (
          <p className="text-center text-xs text-text-subtle">
            This import will be saved to {profile?.display_name || profile?.username || "your commander profile"}.
          </p>
        )}
      </form>
    </div>
  );
}
