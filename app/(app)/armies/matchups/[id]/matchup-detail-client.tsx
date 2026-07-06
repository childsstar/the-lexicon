"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/page-header";
import ArmyOverviewPanel from "@/components/army-overview-panel";
import { LexiconMark, SwordsIcon } from "@/components/icons";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import type { ArmyList } from "@/lib/army-lists/types";
import type { MatchupView } from "@/lib/matchups/types";

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

const STATUS_COPY: Record<MatchupView["status"], string> = {
  pending: "Sealed — waiting on locks",
  one_locked: "One side locked",
  revealed: "Revealed",
  cancelled: "Cancelled",
};

export default function MatchupDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const [matchup, setMatchup] = useState<MatchupView | null>(null);
  const [armies, setArmies] = useState<ArmyList[] | null>(null);
  const [selectedArmyId, setSelectedArmyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);

  const load = useCallback(async () => {
    const token = await getAccessToken();
    const response = await fetch(`/api/matchups/${id}`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Could not load this matchup.");
      return;
    }
    setMatchup(payload.matchup);
    setSelectedArmyId((current) => current || payload.matchup.self?.army_id || "");
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadArmies() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from("army_lists").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      if (cancelled) return;
      const list = (data as ArmyList[] | null) ?? [];
      setArmies(list);
      setSelectedArmyId((current) => current || list[0]?.id || "");
    }
    void loadArmies();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleLock() {
    if (!selectedArmyId) {
      setError("Choose an army to lock into this matchup.");
      return;
    }
    setLocking(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/matchups/${id}/lock`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ armyId: selectedArmyId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Locking this list failed.");
        return;
      }
      setMatchup(payload.matchup);
    } finally {
      setLocking(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Sealed Matchup"
        description="Shareable army overview — sealed until both players lock, then revealed to both sides at once."
        backHref="/armies/matchups"
        backLabel="Matchups"
      />

      {error && <div className="card mb-4 border-ember-500/50 p-4 text-sm text-ember-200">{error}</div>}
      {!matchup && !error && <div className="card p-5 text-sm text-text-muted">Opening the sealed ledger…</div>}

      {matchup && (
        <div className="space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-600/40 bg-surface text-gold-400">
                <SwordsIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-text">{STATUS_COPY[matchup.status]}</p>
                <p className="text-xs text-text-subtle">
                  {matchup.selfLocked ? "You've locked your list." : "You haven't locked your list yet."}{" "}
                  {matchup.opponentLocked ? "Your opponent has locked." : "Your opponent hasn't locked yet."}
                </p>
              </div>
            </div>
          </div>

          {!matchup.hasOpponent && matchup.inviteCode && (
            <div className="card border-gold-700/40 bg-gold-950/10 p-5">
              <p className="text-sm font-semibold text-gold-200">Waiting for an opponent</p>
              <p className="mt-1 text-sm text-text-muted">Share this invite code so they can join the matchup:</p>
              <p className="mt-3 rounded-md border border-gold-600/40 bg-surface px-4 py-2 text-center font-mono text-lg tracking-widest text-gold-200">
                {matchup.inviteCode}
              </p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              {matchup.self ? (
                <ArmyOverviewPanel overview={matchup.self} eyebrow="Your army" />
              ) : (
                <div className="card p-5 text-sm text-text-muted">Choose an army below to preview it here.</div>
              )}

              {!matchup.selfLocked && (
                <div className="card space-y-3 p-5">
                  {armies !== null && armies.length > 0 ? (
                    <label className="block">
                      <span className="text-sm font-semibold text-text">Bring which army?</span>
                      <select value={selectedArmyId} onChange={(event) => setSelectedArmyId(event.target.value)} className="field mt-2">
                        {armies.map((army) => (
                          <option key={army.id} value={army.id}>{army.name || "Untitled army"}</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="text-sm text-text-muted">Muster an army first, then come back to lock it in.</p>
                  )}
                  <button
                    onClick={handleLock}
                    disabled={locking || !selectedArmyId}
                    className="w-full rounded-md bg-gold-600 px-6 py-3 text-sm font-bold text-ink shadow-candle transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locking ? "Sealing your list…" : "Lock list"}
                  </button>
                  <p className="text-center text-xs text-text-subtle">
                    Locking snapshots your army as it stands right now. Later edits to the source army won&apos;t change
                    this matchup.
                  </p>
                </div>
              )}
            </div>

            <div>
              {matchup.opponent ? (
                <ArmyOverviewPanel overview={matchup.opponent} eyebrow="Opponent's army — revealed" />
              ) : (
                <div className="card flex flex-col items-center gap-3 p-8 text-center">
                  <LexiconMark className="h-8 w-8 text-text-subtle" />
                  <p className="font-display text-lg font-semibold text-text">Sealed until both players lock</p>
                  <p className="max-w-xs text-sm text-text-muted">
                    {!matchup.hasOpponent
                      ? "Once an opponent joins and both sides lock, their army overview appears here."
                      : "Your opponent's army overview will appear here the moment you're both locked in."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
