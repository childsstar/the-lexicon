import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/supabase-server";

/**
 * Cancellation runs through the cancel_matchup() SECURITY DEFINER
 * function so a cancel can also clear the "locked" flag on both sides'
 * source armies when nothing else holds them — the caller's own RLS
 * can only touch their own armies.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to cancel a matchup." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("cancel_matchup", { matchup_id: id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const outcome = (data as { outcome: string }).outcome;
  switch (outcome) {
    case "cancelled":
      return NextResponse.json({ ok: true });
    case "not_participant":
      return NextResponse.json({ error: "You're not part of this matchup." }, { status: 403 });
    case "already_revealed":
      return NextResponse.json(
        { error: "Both lists are already revealed — this matchup is complete and can't be cancelled." },
        { status: 409 }
      );
    case "not_found":
    default:
      return NextResponse.json({ error: "Matchup not found." }, { status: 404 });
  }
}
