import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildArmyOverviewSnapshot, buildMatchupView } from "@/lib/matchups/reveal";
import type { ArmyList } from "@/lib/army-lists/types";
import type { MatchupRow } from "@/lib/matchups/types";

function getSupabaseForRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization") ?? "";
  if (!url || !anonKey) throw new Error("Supabase is not configured.");
  return createClient(url, anonKey, {
    global: { headers: authorization ? { authorization } : {} },
    auth: { persistSession: false },
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let supabase;
  try {
    supabase = getSupabaseForRequest(request);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in to view this matchup." }, { status: 401 });
  }
  const userId = userData.user.id;

  const { data: matchup, error: matchupError } = await supabase
    .from("army_matchups")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (matchupError || !matchup) {
    return NextResponse.json({ error: "Matchup not found." }, { status: 404 });
  }
  const row = matchup as MatchupRow;

  const isCreator = row.creator_user_id === userId;
  const isOpponent = row.opponent_user_id === userId;
  if (!isCreator && !isOpponent) {
    return NextResponse.json({ error: "You're not part of this matchup." }, { status: 403 });
  }

  const selfLockedAt = isCreator ? row.creator_locked_at : row.opponent_locked_at;
  const selfArmyId = isCreator ? row.creator_army_id : row.opponent_army_id;

  let liveSelfOverview = null;
  if (!selfLockedAt && selfArmyId) {
    const { data: army } = await supabase.from("army_lists").select("*").eq("id", selfArmyId).eq("user_id", userId).maybeSingle();
    if (army) liveSelfOverview = buildArmyOverviewSnapshot(army as ArmyList);
  }

  const view = buildMatchupView(row, userId, liveSelfOverview);
  return NextResponse.json({ matchup: view });
}
