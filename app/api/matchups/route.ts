import { NextResponse } from "next/server";
import { computeMatchupStatus } from "@/lib/matchups/reveal";
import { getRequestUser } from "@/lib/supabase-server";
import type { MatchupRow } from "@/lib/matchups/types";

export async function POST(request: Request) {
  let body: { armyId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const armyId = typeof body.armyId === "string" ? body.armyId : "";
  if (!armyId) {
    return NextResponse.json({ error: "Choose an army to bring to this matchup." }, { status: 400 });
  }

  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to start a matchup." }, { status: 401 });
  }

  const { data: army, error: armyError } = await supabase
    .from("army_lists")
    .select("id")
    .eq("id", armyId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (armyError || !army) {
    return NextResponse.json({ error: "That army couldn't be found in your muster roll." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("army_matchups")
    .insert({ creator_user_id: user.id, creator_army_id: armyId })
    .select("id, invite_code")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matchupId: data.id, inviteCode: data.invite_code }, { status: 201 });
}

export async function GET(request: Request) {
  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to see your matchups." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("army_matchups")
    .select("id, creator_user_id, opponent_user_id, creator_locked_at, opponent_locked_at, status, invite_code, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userId = user.id;
  const matchups = ((data ?? []) as Pick<MatchupRow, "id" | "creator_user_id" | "opponent_user_id" | "creator_locked_at" | "opponent_locked_at" | "status" | "invite_code" | "created_at">[]).map((row) => {
    const isCreator = row.creator_user_id === userId;
    return {
      id: row.id,
      status: computeMatchupStatus(row),
      isCreator,
      hasOpponent: Boolean(row.opponent_user_id),
      selfLocked: Boolean(isCreator ? row.creator_locked_at : row.opponent_locked_at),
      opponentLocked: Boolean(isCreator ? row.opponent_locked_at : row.creator_locked_at),
      inviteCode: row.opponent_user_id ? null : row.invite_code,
      createdAt: row.created_at,
    };
  });

  return NextResponse.json({ matchups });
}
