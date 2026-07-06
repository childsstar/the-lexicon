import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  try {
    supabase = getSupabaseForRequest(request);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in to join a matchup." }, { status: 401 });
  }

  // RLS ("An invited opponent can join by user id") permits this update
  // for any authenticated non-creator while opponent_user_id is still
  // null — the invite code in the WHERE clause is what actually scopes
  // it to the right row.
  const { error: updateError } = await supabase
    .from("army_matchups")
    .update({ opponent_user_id: userData.user.id })
    .eq("invite_code", inviteCode)
    .is("opponent_user_id", null);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: matchup, error: fetchError } = await supabase
    .from("army_matchups")
    .select("id")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (fetchError || !matchup) {
    return NextResponse.json(
      { error: "That invite code is invalid, already claimed, or is your own matchup." },
      { status: 404 }
    );
  }

  return NextResponse.json({ matchupId: matchup.id });
}
