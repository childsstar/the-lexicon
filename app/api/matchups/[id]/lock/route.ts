import { NextResponse } from "next/server";
import { buildArmyOverviewSnapshot, buildMatchupView, computeMatchupStatus } from "@/lib/matchups/reveal";
import { getRequestUser } from "@/lib/supabase-server";
import type { ArmyList } from "@/lib/army-lists/types";
import type { MatchupRow } from "@/lib/matchups/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { armyId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const armyId = typeof body.armyId === "string" ? body.armyId : "";
  if (!armyId) {
    return NextResponse.json({ error: "Choose which army to lock into this matchup." }, { status: 400 });
  }

  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to lock a list." }, { status: 401 });
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
    return NextResponse.json({ error: "Join this matchup with an invite code before locking a list." }, { status: 403 });
  }
  if ((isCreator && row.creator_locked_at) || (isOpponent && row.opponent_locked_at)) {
    return NextResponse.json({ error: "This side is already locked — snapshots are immutable once locked." }, { status: 409 });
  }

  const { data: army, error: armyError } = await supabase
    .from("army_lists")
    .select("*")
    .eq("id", armyId)
    .eq("user_id", userId)
    .maybeSingle();
  if (armyError || !army) {
    return NextResponse.json({ error: "That army couldn't be found in your muster roll." }, { status: 404 });
  }

  const snapshot = buildArmyOverviewSnapshot(army as ArmyList);
  const now = new Date().toISOString();

  const sideUpdate = isCreator
    ? { creator_army_id: armyId, creator_locked_at: now, creator_snapshot: snapshot }
    : { opponent_army_id: armyId, opponent_locked_at: now, opponent_snapshot: snapshot };

  const nextStatus = computeMatchupStatus({
    creator_locked_at: isCreator ? now : row.creator_locked_at,
    opponent_locked_at: isOpponent ? now : row.opponent_locked_at,
    status: row.status,
  });

  const { data: updated, error: updateError } = await supabase
    .from("army_matchups")
    .update({
      ...sideUpdate,
      status: nextStatus,
      revealed_at: nextStatus === "revealed" ? row.revealed_at ?? now : row.revealed_at,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "Locking this list failed." }, { status: 500 });
  }

  // Flag the source army as locked so its card/index reflect that it's
  // committed to an in-progress matchup. Editing armies isn't supported
  // yet in this MVP, so this is a visible-state guard rather than a
  // write-blocking one — the real immutability guarantee is the
  // snapshot taken above.
  if (!army.locked_at) {
    await supabase.from("army_lists").update({ locked_at: now }).eq("id", armyId);
  }

  const view = buildMatchupView(updated as MatchupRow, userId, snapshot);
  return NextResponse.json({ matchup: view });
}
