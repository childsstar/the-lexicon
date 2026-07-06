"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getSupabaseClient } from "@/lib/supabase";
import type { ArmyList } from "@/lib/army-lists/types";

export default function ArmyListDetailClient({ id }: { id: string }) {
  const [armyList, setArmyList] = useState<ArmyList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = getSupabaseClient();
      const { data, error: loadError } = await supabase
        .from("army_lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (loadError) setError(loadError.message);
      setArmyList((data as ArmyList | null) ?? null);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [id]);

  const parsed = armyList?.parsed_json;
  const unitCount = parsed?.unit_count ?? parsed?.units.length ?? 0;
  const detachmentLine = parsed?.detachment_names?.length ? `${parsed.detachment_names.join(" / ")}${parsed.detachment_points ? ` (${parsed.detachment_points} DP)` : ""}` : parsed?.subfaction || "Unknown";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Imported Army List"
        description="A preserved roster and its first structured reading for future recommendations."
        backHref="/profile"
        backLabel="Profile"
      />

      {loading && <div className="card p-5 text-sm text-text-muted">Opening the roster…</div>}
      {error && <div className="card border-ember-500/50 p-5 text-sm text-ember-200">{error}</div>}
      {!loading && !armyList && !error && <div className="card p-5 text-sm text-text-muted">Army list not found.</div>}

      {armyList && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">List name</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-text">{armyList.name || "Untitled army list"}</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${armyList.parser_status === "succeeded" ? "border-gold-600/50 text-gold-300" : "border-ember-500/50 text-ember-200"}`}>
                {armyList.parser_status}
              </span>
            </div>

            {armyList.parser_status === "failed" && (
              <div className="mt-4 rounded-md border border-ember-500/50 bg-ember-950/30 p-4 text-sm text-ember-100">
                The raw text was saved, but parsing failed: {armyList.parser_error || "Unknown parser error."} Re-import this roster to retry.
              </div>
            )}

            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Summary label="Game system" value={armyList.game_system || parsed?.game_system || "Unknown"} />
              <Summary label="Faction" value={[armyList.faction || parsed?.faction, parsed?.subfaction].filter(Boolean).join(" / ") || "Unknown"} />
              <Summary label="Points total" value={String(armyList.points_total ?? parsed?.points_total ?? "Unknown")} />
              <Summary label="Datasheet count" value={String(unitCount)} />
              <Summary label="Detachments" value={detachmentLine} />
            </dl>
          </div>

          {parsed && (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">Playstyle tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {parsed.inferred_playstyle_tags.length ? parsed.inferred_playstyle_tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-gold-600/40 px-3 py-1 text-xs text-gold-200">{tag}</span>
                )) : <span className="text-sm text-text-muted">No tags inferred.</span>}
              </div>

              {parsed.warnings.length > 0 && (
                <div className="mt-5 rounded-md border border-gold-700/40 bg-gold-950/20 p-4">
                  <p className="text-sm font-semibold text-gold-200">Warnings</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
                    {parsed.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {parsed?.units.length ? (
            <div className="card divide-y divide-border-muted">
              {parsed.units.map((unit, index) => (
                <div key={`${unit.name}-${index}`} className="p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <p className="font-semibold text-text">{unit.quantity ? `${unit.quantity}× ` : ""}{unit.name}</p>
                    <p className="text-sm text-text-muted">{unit.points ?? "—"} pts{unit.section ? ` · ${unit.section}` : ""}{unit.role ? ` · ${unit.role}` : ""}</p>
                  </div>
                  {[...unit.enhancements, ...unit.upgrades, ...unit.wargear].length > 0 && (
                    <p className="mt-2 text-sm text-text-muted">{[...unit.enhancements, ...unit.upgrades, ...unit.wargear].join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <details className="card p-5">
            <summary className="cursor-pointer text-sm font-semibold text-text">Raw pasted text</summary>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-surface/70 p-4 text-xs text-text-muted">{armyList.raw_text}</pre>
          </details>

          <Link href="/profile/army-lists/import" className="block rounded-md border border-gold-600 px-4 py-3 text-center text-sm font-semibold text-gold-300 hover:border-gold-400 hover:text-gold-200">
            Import another army list
          </Link>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-muted bg-surface/60 p-3">
      <dt className="text-xs uppercase tracking-widest text-text-subtle">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-text">{value}</dd>
    </div>
  );
}
