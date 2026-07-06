import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseArmyList } from "@/lib/army-lists/parser";
import { buildTacticalOverview, EMPTY_TACTICAL_SUMMARY } from "@/lib/army-lists/tactical-overview";
import { generateFallbackArmyName } from "@/lib/army-lists/naming";
import { generateVisualIdentity } from "@/lib/armies/visual-identity";
import type { ParsedArmyList } from "@/lib/army-lists/types";

const MAX_RAW_TEXT_LENGTH = 40_000;

type RequestBody = {
  name?: unknown;
  gameSystem?: unknown;
  faction?: unknown;
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
  // The user-entered name is sacred: it is only ever read here and passed
  // straight through to the insert below. The parser is never allowed to
  // overwrite it — if it's blank, generateFallbackArmyName() below fills
  // in a neutral placeholder from the parsed faction instead.
  const userEnteredName = typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
  const gameSystem =
    typeof body.gameSystem === "string" && body.gameSystem.trim()
      ? body.gameSystem.trim()
      : null;
  const faction =
    typeof body.faction === "string" && body.faction.trim()
      ? body.faction.trim()
      : null;

  if (!rawText) {
    return NextResponse.json({ error: "Paste a roster before mustering this army." }, { status: 400 });
  }
  if (rawText.length > MAX_RAW_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Roster text is too long for this MVP import. Please trim it and try again." },
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
    return NextResponse.json({ error: "Sign in to muster an army." }, { status: 401 });
  }

  let parsed: ParsedArmyList | null = null;
  let parserStatus: "succeeded" | "failed" = "succeeded";
  let parserError: string | null = null;

  try {
    parsed = await parseArmyList({ rawText, gameSystem, faction, name: userEnteredName });
  } catch (err) {
    parserStatus = "failed";
    parserError = err instanceof Error ? err.message : "Army list parsing failed.";
  }

  const resolvedFaction = parsed?.faction ?? faction;
  const resolvedGameSystem = parsed?.game_system ?? gameSystem;
  const name = userEnteredName || generateFallbackArmyName({ faction: resolvedFaction, gameSystem: resolvedGameSystem });
  const tacticalSummary = parsed && parsed.units.length ? buildTacticalOverview(parsed) : EMPTY_TACTICAL_SUMMARY;
  const visualIdentity = generateVisualIdentity({
    faction: resolvedFaction,
    name,
    playstyleTags: parsed?.inferred_playstyle_tags ?? [],
  });

  const { data, error } = await supabase
    .from("army_lists")
    .insert({
      user_id: userData.user.id,
      profile_id: userData.user.id,
      name,
      game_system: resolvedGameSystem,
      faction: resolvedFaction,
      subfaction: parsed?.subfaction ?? null,
      points_total: parsed?.points_total ?? null,
      datasheet_count: parsed?.unit_count ?? parsed?.units.length ?? null,
      model_count: parsed?.model_count ?? null,
      detachment_names: parsed?.detachment_names ?? [],
      detachment_points: parsed?.detachment_points ?? null,
      raw_text: rawText,
      parsed_json: parsed,
      playstyle_tags: parsed?.inferred_playstyle_tags ?? [],
      tactical_summary: tacticalSummary,
      parser_status: parserStatus,
      parser_error: parserError,
      visibility: "private",
      visual_identity_json: visualIdentity,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ armyList: data }, { status: 201 });
}
