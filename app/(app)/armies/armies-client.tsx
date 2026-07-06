"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import ArmyCard from "@/components/army-card";
import { ShieldIcon, PlusIcon, SwordsIcon } from "@/components/icons";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import type { ArmyList } from "@/lib/army-lists/types";

export default function ArmiesClient() {
  const { user } = useAuth();
  const [armies, setArmies] = useState<ArmyList[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const supabase = getSupabaseClient();
      const { data, error: loadError } = await supabase
        .from("army_lists")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      if (loadError) setError(loadError.message);
      setArmies((data as ArmyList[] | null) ?? []);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div>
      <PageHeader
        title="Armies"
        description="Every force you've mustered, in one roster. The Lexicon reads what you can field so matchmaking, battle prep, and collection tracking all get sharper."
        action={
          <Link
            href="/armies/muster"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            <PlusIcon className="h-4 w-4" />
            Muster
          </Link>
        }
      />

      <Link
        href="/armies/matchups"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400 hover:text-gold-300"
      >
        <SwordsIcon className="h-3.5 w-3.5" />
        Prep a sealed matchup
      </Link>

      {error && (
        <div className="card mb-4 border-ember-500/50 p-4 text-sm text-ember-200">{error}</div>
      )}

      {armies === null && (
        <div className="card p-5 text-sm text-text-muted">Opening the muster roll…</div>
      )}

      {armies !== null && armies.length === 0 && (
        <EmptyState
          icon={<ShieldIcon className="h-7 w-7" />}
          title="No armies mustered yet"
          body="Teach the Lexicon what you can field — muster your first army so other players know what kind of game you can bring."
          actionHref="/armies/muster"
          actionLabel="Muster your first army"
        />
      )}

      {armies !== null && armies.length > 0 && (
        <div className="space-y-3">
          {armies.map((army) => (
            <ArmyCard key={army.id} army={army} />
          ))}
        </div>
      )}
    </div>
  );
}
