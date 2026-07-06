import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Reset onboarding is only available in development builds." },
      { status: 404 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization") ?? "";

  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: authorization ? { authorization } : {} },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Sign in before resetting onboarding." },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      experience_level: null,
      preferred_play_style: null,
      preferred_game_systems: [],
      primary_factions: [],
      faction_interests: [],
      home_locations: [],
      home_venue_id: null,
      banner_id: null,
      travel_radius_miles: null,
      preferred_universe_key: null,
      preferred_realm_key: null,
      preferred_game_key: null,
      profile_completed_at: null,
    })
    .eq("id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
