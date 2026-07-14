"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import ArmySigil from "@/components/army-sigil";
import { SwordsIcon, PlusIcon, ChevronRightIcon } from "@/components/icons";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import type { VisualIdentity } from "@/lib/armies/visual-identity";

type MatchupSummary = {
  id: string;
  status: "pending" | "one_locked" | "revealed" | "cancelled";
  isCreator: boolean;
  hasOpponent: boolean;
  selfLocked: boolean;
  opponentLocked: boolean;
  inviteCode: string | null;
  createdAt: string;
  selfArmyName: string | null;
  selfArmyIdentity: VisualIdentity | null;
  opponentArmyName: string | null;
};

const STATUS_LABEL: Record<MatchupSummary["status"], string> = {
  pending: "Sealed — waiting on locks",
  one_locked: "One side locked",
  revealed: "Revealed",
  cancelled: "Cancelled",
};

export default function MatchupsClient() {
  const { session, loading } = useAuth();
  const [matchups, setMatchups] = useState<MatchupSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !session?.access_token) return;
    let cancelled = false;
    async function load() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const response = await fetch("/api/matchups", {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      const payload = await response.json();
      if (cancelled) return;
      if (!response.ok) {
        setError(payload.error || "Could not load matchups.");
        return;
      }
      setMatchups(payload.matchups);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loading, session]);

  return (
    <div>
      <PageHeader
        title="Matchups"
        description="Sealed until both players lock. Prep a fair matchup without giving either side a pre-lock peek at the other's list."
        action={
          <Link
            href="/armies/matchups/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            <PlusIcon className="h-4 w-4" />
            New matchup
          </Link>
        }
      />

      {error && <div className="card mb-4 border-ember-500/50 p-4 text-sm text-ember-200">{error}</div>}

      {matchups === null && !error && <div className="card p-5 text-sm text-text-muted">Opening the ledger…</div>}

      {matchups !== null && matchups.length === 0 && (
        <EmptyState
          icon={<SwordsIcon className="h-7 w-7" />}
          title="No matchups yet"
          body="Start a sealed matchup with one of your armies, or join one with an invite code from an opponent."
          actionHref="/armies/matchups/new"
          actionLabel="Start a matchup"
        />
      )}

      {matchups !== null && matchups.length > 0 && (
        <div className="space-y-3">
          {matchups.map((matchup) => (
            <Link key={matchup.id} href={`/armies/matchups/${matchup.id}`} className="card card-interactive flex items-center gap-4 p-5">
              {matchup.selfArmyIdentity ? (
                <ArmySigil identity={matchup.selfArmyIdentity} size="md" />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-gold-500">
                  <SwordsIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold text-text">{STATUS_LABEL[matchup.status]}</p>
                <p className="truncate text-sm text-text-muted">
                  {matchup.selfArmyName || "No army chosen yet"}
                  {matchup.opponentArmyName ? ` vs ${matchup.opponentArmyName}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-text-subtle">
                  {matchup.isCreator ? "You created this matchup" : "You joined this matchup"}
                  {!matchup.hasOpponent && matchup.inviteCode ? ` · invite code ${matchup.inviteCode}` : ""}
                </p>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-subtle" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
