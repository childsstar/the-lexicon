"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/page-header";
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
  const [armies, setArmies] = useState<ArmyList[] | null>(null);
  const [armyId, setArmyId] = useState(searchParams.get("armyId") ?? "");
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
      setArmyId((current) => current || list[0]?.id || "");
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
        {armies !== null && armies.length > 0 && (
          <label className="block">
            <span className="text-sm font-semibold text-text">Bring which army?</span>
            <select value={armyId} onChange={(event) => setArmyId(event.target.value)} className="field mt-2">
              {armies.map((army) => (
                <option key={army.id} value={army.id}>{army.name || "Untitled army"} — {army.faction || "Unknown faction"}</option>
              ))}
            </select>
          </label>
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
      </form>
    </div>
  );
}
