import { NextResponse } from "next/server";
import { buildArmyOverviewSnapshot, buildMatchupView } from "@/lib/matchups/reveal";
import { getRequestUser } from "@/lib/supabase-server";
import type { ArmyList } from "@/lib/army-lists/types";
import type { MatchupRow } from "@/lib/matchups/types";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to view this matchup." }, { status: 401 });
  }
  const userId = user.id;

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
