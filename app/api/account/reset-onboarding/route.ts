import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/supabase-server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Reset onboarding is only available in development builds." },
      { status: 404 }
    );
  }

  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  if (!user) {
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
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
