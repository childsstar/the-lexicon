"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { GAMES } from "@/lib/games";
import { factionsForGame } from "@/lib/game-data";
import { detectRosterGame } from "@/lib/army-lists/import-utils";

const GAME_SYSTEMS = [
  "Warhammer 40,000",
  "Warhammer: Age of Sigmar",
  "Kill Team",
  "Warhammer: The Old World",
  "The Horus Heresy",
  "Star Wars: Legion",
  "Marvel: Crisis Protocol",
];

export default function MusterArmyClient() {
  const router = useRouter();
  const { user, profile, session, loading } = useAuth();
  const [name, setName] = useState("");
  const [gameSystem, setGameSystem] = useState("");
  const [gameWasSelected, setGameWasSelected] = useState(false);
  const [faction, setFaction] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedGame = Object.values(GAMES).find((game) => game.name === gameSystem);
  const curatedFactions = selectedGame ? factionsForGame(selectedGame.key) : [];

  useEffect(() => {
    if (!gameWasSelected) setGameSystem(detectRosterGame(rawText)?.name ?? "");
  }, [rawText, gameWasSelected]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!rawText.trim()) {
      setError("Paste a plain-text roster before mustering this army.");
      return;
    }

    setSubmitting(true);
    try {
      if (loading) {
        setError("Still checking your Lexicon session. Please try again in a moment.");
        return;
      }

      const token = session?.access_token;
      if (!user || !token) {
        setError("Sign in to muster an army.");
        return;
      }

      const response = await fetch("/api/army-lists", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, gameSystem, faction, rawText }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "This army could not be mustered. Review the roster text and try again.");
        return;
      }
      router.push(`/armies/${payload.armyList.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Muster an Army"
        description="Teach the Lexicon what you can field. Import a roster so other players know what kind of game you can bring — and so the Lexicon can help with matchmaking, battle prep, and collection tracking."
        backHref="/armies"
        backLabel="Armies"
      />

      <form onSubmit={handleSubmit} className="card space-y-5 p-5 sm:p-6">
        {loading && (
          <div className="rounded-md border border-border bg-surface-raised px-4 py-3 text-sm text-text-muted">
            Checking your Lexicon session before enabling saved musters…
          </div>
        )}

        {!loading && !user && (
          <div className="rounded-md border border-gold-700/50 bg-gold-950/20 px-4 py-3 text-sm text-gold-100">
            <p className="font-semibold">Sign in to muster an army.</p>
            <p className="mt-1 text-gold-100/80">
              Mustered armies are saved to your commander profile and carry your visual identity into future
              matchups.
            </p>
            <Link
              href="/sign-in"
              className="mt-3 inline-block rounded-md bg-gold-600 px-4 py-2 text-xs font-bold text-ink shadow-candle transition-colors hover:bg-gold-500"
            >
              Sign in
            </Link>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-ember-500/50 bg-ember-950/30 px-4 py-3 text-sm text-ember-200">
            {error}
          </div>
        )}

        <Field label="Army name" hint="Optional — leave blank and the Lexicon will name it for you. Whatever you type here is never overwritten by the parser.">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. The Gilded Crusade"
            className="field"
          />
        </Field>

        <Field label="Game system" hint="Choose one or leave blank so the roster text can suggest it.">
          <select value={gameSystem} onChange={(event) => { setGameSystem(event.target.value); setGameWasSelected(Boolean(event.target.value)); }} className="field">
            <option value="">Infer from roster text</option>
            {GAME_SYSTEMS.map((system) => (
              <option key={system} value={system}>{system}</option>
            ))}
          </select>
        </Field>

        <Field label="Faction" hint="Choose a curated faction or enter your own community faction.">
          <input list="muster-factions"
            value={faction}
            onChange={(event) => setFaction(event.target.value)}
            placeholder="e.g. Adepta Sororitas"
            className="field"
          />
          <datalist id="muster-factions">{curatedFactions.map((item) => <option key={item.key} value={item.name}>{item.supportStatus}</option>)}</datalist>
        </Field>

        <Field label="Roster text" hint="Paste plain text from a builder or your notes. Unknown entries are preserved and never block saving.">
          <textarea
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            rows={16}
            placeholder={"Paste your roster export…\nFaction: Adepta Sororitas\nTotal: 1000 pts\nCanoness - 50 pts - plasma pistol\n10x Battle Sisters - 110 pts"}
            className="field min-h-72 font-mono"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting || loading || !user}
          className="w-full rounded-md bg-gold-600 px-6 py-3.5 text-sm font-bold text-ink shadow-candle transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking session…" : submitting ? "Reading the roster…" : "Muster this army"}
        </button>
        {!loading && user && (
          <p className="text-center text-xs text-text-subtle">
            This army will be saved to {profile?.display_name || profile?.username || "your commander profile"}.
          </p>
        )}
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-text">{label}</span>
      <div className="mt-2">{children}</div>
      <span className="mt-1.5 block text-xs text-text-subtle">{hint}</span>
    </label>
  );
}
