"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import ArmySigil from "@/components/army-sigil";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import type { ArmyList } from "@/lib/army-lists/types";

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function NewMatchupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const presetArmyId = searchParams.get("armyId");
  const [armies, setArmies] = useState<ArmyList[] | null>(null);
  const [armyId, setArmyId] = useState(presetArmyId ?? "");
  const [changingArmy, setChangingArmy] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("army_lists")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      const list = (data as ArmyList[] | null) ?? [];
      setArmies(list);
      setArmyId((current) => (list.some((army) => army.id === current) ? current : list[0]?.id || ""));
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Arriving via an army page's "Use in a matchup" button pre-answers
  // the "bring which army?" question — show a confirmation instead of a picker.
  const presetArmy = !changingArmy && presetArmyId && armyId === presetArmyId
    ? armies?.find((army) => army.id === presetArmyId)
    : undefined;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!armyId) {
      setError("Muster an army before starting a matchup.");
      return;
    }
    setCreating(true);
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/matchups", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ armyId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Could not start this matchup.");
        return;
      }
      router.push(`/armies/matchups/${payload.matchupId}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoinError(null);
    if (!inviteCode.trim()) {
      setJoinError("Enter an invite code.");
      return;
    }
    setJoining(true);
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/matchups/join", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setJoinError(payload.error || "Could not join that matchup.");
        return;
      }
      router.push(`/armies/matchups/${payload.matchupId}`);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="New matchup"
        description="Two players, two sealed lists. Neither side can see the other's army until both have locked."
        backHref="/armies/matchups"
        backLabel="Matchups"
      />

      <form onSubmit={handleCreate} className="card space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-text">Start a matchup</h2>
        {error && <div className="rounded-md border border-ember-500/50 bg-ember-950/30 px-4 py-3 text-sm text-ember-200">{error}</div>}
        {!loading && armies !== null && armies.length === 0 && (
          <p className="text-sm text-text-muted">You haven&apos;t mustered an army yet — muster one first, then come back here.</p>
        )}
        {presetArmy ? (
          <div className="flex items-center gap-3 rounded-md border border-gold-600/40 bg-surface/60 p-3">
            <ArmySigil identity={presetArmy.visual_identity_json} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{presetArmy.name || "Untitled army"}</p>
              <p className="truncate text-xs text-text-muted">{presetArmy.faction || "Unknown faction"}</p>
            </div>
            <button
              type="button"
              onClick={() => setChangingArmy(true)}
              className="shrink-0 text-xs font-semibold text-gold-400 transition-colors hover:text-gold-300"
            >
              Change army
            </button>
          </div>
        ) : (
          armies !== null &&
          armies.length > 0 && (
            <label className="block">
              <span className="text-sm font-semibold text-text">Bring which army?</span>
              <select value={armyId} onChange={(event) => setArmyId(event.target.value)} className="field mt-2">
                {armies.map((army) => (
                  <option key={army.id} value={army.id}>{army.name || "Untitled army"} — {army.faction || "Unknown faction"}</option>
                ))}
              </select>
            </label>
          )
        )}
        <button
          type="submit"
          disabled={creating || !armyId}
          className="w-full rounded-md bg-gold-600 px-6 py-3 text-sm font-bold text-ink shadow-candle transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Sealing the invite…" : "Start matchup"}
        </button>
        <p className="text-center text-xs text-text-subtle">
          You&apos;ll get an invite code to share with your opponent. Your list stays sealed until you both lock.
        </p>
      </form>

      <form onSubmit={handleJoin} className="card space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-text">Join a matchup</h2>
        {joinError && <div className="rounded-md border border-ember-500/50 bg-ember-950/30 px-4 py-3 text-sm text-ember-200">{joinError}</div>}
        <label className="block">
          <span className="text-sm font-semibold text-text">Invite code</span>
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="e.g. a1b2c3d4e5"
            className="field mt-2 font-mono"
          />
        </label>
        <button
          type="submit"
          disabled={joining}
          className="w-full rounded-md border border-gold-600 px-6 py-3 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {joining ? "Joining…" : "Join matchup"}
        </button>
        <p className="text-center text-xs text-text-subtle">
          Enter your opponent&apos;s invite code to join their matchup. Their list stays sealed — you&apos;ll explore it
          once you&apos;ve both locked.
        </p>
      </form>
    </div>
  );
}
