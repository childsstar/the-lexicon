import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

/** Fetch a user's profile row, or null if they haven't created one yet. */
export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    // Table not created yet (schema SQL not run) reads the same as "no
    // profile": the user is routed to setup, where the save surfaces a
    // clearer error.
    console.error("Failed to load profile:", error.message);
    return null;
  }
  return data as Profile | null;
}

/** The two fields v0.1 requires before the dashboard opens. */
export function isProfileComplete(profile: Profile | null): boolean {
  return Boolean(
    profile && profile.username?.trim() && profile.availability?.trim()
  );
}

/** Optional enrichment used for matchmaking hints — drives the
 * "complete your commander profile" nudge on the dashboard. */
export function isProfileEnriched(profile: Profile | null): boolean {
  return Boolean(
    profile && profile.experience_level && profile.preferred_play_style
  );
}

/** Map raw Supabase/Postgres errors to messages a player can act on. */
export function friendlyProfileError(error: {
  code?: string;
  message: string;
}): string {
  switch (error.code) {
    case "23505":
      return "That username is already taken — choose another.";
    case "23514":
      return "Username must be 3–32 characters: lowercase letters, numbers, and underscores only.";
    case "42P01":
    case "PGRST205": // PostgREST: table missing from schema cache
      return "The profiles table doesn't exist yet. Run supabase/schema_v0_1_profiles.sql in the Supabase SQL editor, then try again.";
    case "PGRST204": // PostgREST: column missing from schema cache
      return "The profiles table is out of date with the app. Re-run supabase/schema_v0_1_profiles.sql in the Supabase SQL editor (drop the old table first).";
    default:
      return error.message;
  }
}
