"use client";

import { FormEvent, useState } from "react";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { parseArmyListDeterministically } from "@/lib/army-lists/fallback-parser";
import type { ParsedArmyList } from "@/lib/army-lists/types";
import { getSupabaseClient } from "@/lib/supabase";

const GAME_SYSTEMS = [
  "Warhammer 40,000",
  "Warhammer Age of Sigmar",
  "Kill Team",
  "The Old World",
  "Horus Heresy",
  "Star Wars: Legion",
  "Marvel: Crisis Protocol",
];

type ImportResult = {
  name: string | null;
  game_system: string | null;
  faction: string | null;
  raw_text: string;
  parsed_json: ParsedArmyList;
  parser_status: "succeeded" | "failed";
  parser_error: string | null;
};

export default function MusterArmyClient() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [gameSystem, setGameSystem] = useState("");
  const [faction, setFaction] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!rawText.trim()) {
      setError("Paste a plain-text roster before importing.");
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          const response = await fetch("/api/army-lists", {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, gameSystem, faction, rawText }),
          });
          const payload = await response.json();
          if (response.ok) {
            setResult(payload.armyList);
            return;
          }
          setError(payload.error || "The roster was not saved, so this preview used fallback parsing.");
        }
      }

      const parsed = parseArmyListDeterministically({ rawText, gameSystem, faction, name });
      setResult({
        name: name.trim() || null,
        game_system: parsed.game_system ?? (gameSystem || null),
        faction: parsed.faction ?? (faction || null),
        raw_text: rawText.trim(),
        parsed_json: parsed,
        parser_status: parsed.units.length ? "succeeded" : "failed",
        parser_error: parsed.units.length ? null : "Fallback parser could not identify any unit rows.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Muster an Army"
        description="Paste a plain-text roster export and let the Lexicon preserve the parchment while it drafts a first structured reading."
        backHref="/armies"
        backLabel="Armies"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <form onSubmit={handleSubmit} className="card space-y-5 p-5 sm:p-6">
          {error && (
            <div className="rounded-md border border-ember-500/50 bg-ember-950/30 px-4 py-3 text-sm text-ember-200">
              {error}
            </div>
          )}

          <Field label="Army name" hint="Optional — the parser can work without it.">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. The Gilded Crusade" className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-subtle focus:border-gold-500 focus:outline-none" />
          </Field>

          <Field label="Game system" hint="Choose one or leave blank so the roster text can suggest it.">
            <select value={gameSystem} onChange={(event) => setGameSystem(event.target.value)} className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-subtle focus:border-gold-500 focus:outline-none">
              <option value="">Infer from roster text</option>
              {GAME_SYSTEMS.map((system) => <option key={system} value={system}>{system}</option>)}
            </select>
          </Field>

          <Field label="Faction" hint="Optional — useful when pasted exports omit the top-level faction.">
            <input value={faction} onChange={(event) => setFaction(event.target.value)} placeholder="e.g. Adepta Sororitas" className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-subtle focus:border-gold-500 focus:outline-none" />
          </Field>

          <Field label="Roster text" hint="Paste a plain-text roster/export from your builder, app, PDF, or notes. File upload and third-party sync are intentionally out of scope for this MVP.">
            <textarea value={rawText} onChange={(event) => setRawText(event.target.value)} rows={16} placeholder="Paste army list…\nFaction: Adepta Sororitas\nTotal: 1000 pts\nCanoness - 50 pts - plasma pistol\n10x Battle Sisters - 110 pts" className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-subtle focus:border-gold-500 focus:outline-none min-h-72 font-mono" />
          </Field>

          <button type="submit" disabled={submitting} className="w-full rounded-md bg-gold-600 px-6 py-3.5 text-sm font-bold text-ink shadow-candle transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Parsing roster…" : "Import army list"}
          </button>
          <p className="text-center text-xs text-text-subtle">
            {user ? "Signed-in imports are saved to your profile." : "Preview mode keeps this import on-screen until profile persistence is available."}
          </p>
        </form>

        <ParsedSummary result={result} rawText={rawText} />
      </div>
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

function ParsedSummary({ result, rawText }: { result: ImportResult | null; rawText: string }) {
  if (!result) {
    return (
      <aside className="card p-5 text-sm text-text-muted">
        <p className="font-semibold text-text">Parsed summary appears here</p>
        <p className="mt-2">Submit a roster to see faction, points, unit count, playstyle tags, warnings, and preserved raw text.</p>
      </aside>
    );
  }

  const parsed = result.parsed_json;
  const unitCount = parsed.unit_count ?? parsed.units.length;
  const detachmentLine = parsed.detachment_names?.length ? `${parsed.detachment_names.join(" / ")}${parsed.detachment_points ? ` (${parsed.detachment_points} DP)` : ""}` : parsed.subfaction || "Unknown";
  const factionLine = [result.faction || parsed.faction, parsed.subfaction].filter(Boolean).join(" / ") || "Unknown";

  return (
    <aside className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">Parsed summary</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-text">{result.name || "Untitled army list"}</h2>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${result.parser_status === "succeeded" ? "border-gold-600/50 text-gold-300" : "border-ember-500/50 text-ember-200"}`}>{result.parser_status}</span>
        </div>
        {result.parser_status === "failed" && <p className="mt-3 rounded-md border border-ember-500/50 bg-ember-950/30 p-3 text-sm text-ember-100">Failed parse: {result.parser_error || "Review the pasted text and try again."}</p>}
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Summary label="Game system" value={result.game_system || parsed.game_system || "Unknown"} />
          <Summary label="Faction" value={factionLine} />
          <Summary label="Points total" value={String(result.parsed_json.points_total ?? "Unknown")} />
          <Summary label="Datasheet count" value={String(unitCount)} />
          <Summary label="Detachments" value={detachmentLine} />
        </dl>
      </div>

      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">Playstyle tags</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {parsed.inferred_playstyle_tags.length ? parsed.inferred_playstyle_tags.map((tag) => <span key={tag} className="rounded-full border border-gold-600/40 px-3 py-1 text-xs text-gold-200">{tag}</span>) : <span className="text-sm text-text-muted">No tags inferred.</span>}
        </div>
        {parsed.warnings.length > 0 && (
          <div className="mt-4 rounded-md border border-gold-700/40 bg-gold-950/20 p-4">
            <p className="text-sm font-semibold text-gold-200">Warnings</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">{parsed.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          </div>
        )}
      </div>

      <details className="card p-5">
        <summary className="cursor-pointer text-sm font-semibold text-text">Raw pasted text</summary>
        <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-surface/70 p-4 text-xs text-text-muted">{result.raw_text || rawText}</pre>
      </details>
    </aside>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border-muted bg-surface/60 p-3"><dt className="text-xs uppercase tracking-widest text-text-subtle">{label}</dt><dd className="mt-1 text-sm font-semibold text-text">{value}</dd></div>;
}
