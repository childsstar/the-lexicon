import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/supabase-server";

/**
 * Joining goes through the join_matchup_by_code() SECURITY DEFINER
 * function (see 20260714010000_matchup_join_rpc_and_cancel.sql): the
 * database owns the invite-code lookup, and hands back a specific
 * outcome so we can tell the player what actually went wrong instead
 * of one catch-all rejection.
 */
type JoinOutcome = {
  outcome: "joined" | "already_joined" | "own_matchup" | "already_claimed" | "cancelled" | "not_found";
  matchup_id?: string;
  creator_locked?: boolean;
};

export async function POST(request: Request) {
  let body: { inviteCode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const inviteCode = typeof body.inviteCode === "string" ? body.inviteCode.trim() : "";
  if (!inviteCode) {
    return NextResponse.json({ error: "Enter an invite code to join a matchup." }, { status: 400 });
  }

  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to join a matchup." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("join_matchup_by_code", { code: inviteCode });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data as JoinOutcome;
  switch (result.outcome) {
    case "joined":
    case "already_joined":
      return NextResponse.json({ matchupId: result.matchup_id, creatorLocked: result.creator_locked ?? null });
    case "own_matchup":
      return NextResponse.json(
        { error: "That's your own invite code — share it with your opponent so they can join.", matchupId: result.matchup_id },
        { status: 400 }
      );
    case "already_claimed":
      return NextResponse.json(
        { error: "That matchup already has both players. Ask your opponent to start a fresh one." },
        { status: 409 }
      );
    case "cancelled":
      return NextResponse.json({ error: "That matchup was cancelled by its creator." }, { status: 410 });
    case "not_found":
    default:
      return NextResponse.json(
        { error: "No matchup found for that code — double-check it with your opponent." },
        { status: 404 }
      );
  }
}
