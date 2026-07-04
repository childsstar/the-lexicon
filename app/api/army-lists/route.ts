import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseArmyListWithAi, type ParsedArmyList } from "@/lib/army-lists/parser";

const MAX_RAW_TEXT_LENGTH = 40_000;

type RequestBody = {
  name?: unknown;
  gameSystem?: unknown;
  rawText?: unknown;
};

function getSupabaseForRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization") ?? "";
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured.");
  }
  return createClient(url, anonKey, {
    global: { headers: authorization ? { authorization } : {} },
    auth: { persistSession: false },
  });
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
  const gameSystem =
    typeof body.gameSystem === "string" && body.gameSystem.trim()
      ? body.gameSystem.trim()
      : null;

  if (!rawText) {
    return NextResponse.json({ error: "Paste an army list before importing." }, { status: 400 });
  }
  if (rawText.length > MAX_RAW_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Army list text is too long for this MVP import. Please trim it and try again." },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseForRequest(request);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in to import an army list." }, { status: 401 });
  }

  let parsed: ParsedArmyList | null = null;
  let parserStatus: "succeeded" | "failed" = "succeeded";
  let parserError: string | null = null;

  try {
    parsed = await parseArmyListWithAi({ rawText, gameSystem, name });
  } catch (err) {
    parserStatus = "failed";
    parserError = err instanceof Error ? err.message : "Army list parsing failed.";
  }

  const { data, error } = await supabase
    .from("army_lists")
    .insert({
      user_id: userData.user.id,
      profile_id: userData.user.id,
      name,
      game_system: parsed?.game_system ?? gameSystem,
      faction: parsed?.faction ?? null,
      points_total: parsed?.points_total ?? null,
      raw_text: rawText,
      parsed_json: parsed,
      parser_status: parserStatus,
      parser_error: parserError,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ armyList: data }, { status: 201 });
}
