export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  experience_level: string | null;
  availability: string;
  preferred_play_style: string | null;
  preferred_game_systems: string[];
  primary_factions: string[];
  faction_interests: string[];
  home_locations: string[];
  home_venue_id: string | null;
  discord_username: string | null;
  avatar_url: string | null;
  /** Snapshot of ActiveUniverseState at last save — see
   * components/active-universe-provider.tsx. localStorage remains the
   * live source of truth; these exist for a future cross-device sync. */
  preferred_universe_key: string | null;
  preferred_realm_key: string | null;
  preferred_game_key: string | null;
  /** Which chronicle banner (lib/chronicle/banners.ts) a traveler chose
   * during onboarding, if any. */
  banner_id: string | null;
  travel_radius_miles: number | null;
  profile_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const TRAVEL_RADIUS_OPTIONS = [
  { value: 5, label: "5 miles — walking distance" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles — I'll travel for a good game" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "new", label: "New recruit — just starting out" },
  { value: "casual", label: "Casual — I play when I can" },
  { value: "experienced", label: "Experienced — many battles behind me" },
  { value: "competitive", label: "Competitive — I play to win events" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "weeknights", label: "Weeknights" },
  { value: "weekends", label: "Weekends" },
  { value: "flexible", label: "Flexible — most times work" },
  { value: "occasional", label: "Occasional — a few games a month" },
] as const;

export const PLAY_STYLES = [
  { value: "casual", label: "Casual — beer & pretzels" },
  { value: "narrative", label: "Narrative — the story comes first" },
  { value: "competitive", label: "Competitive — sharpened lists" },
  { value: "mixed", label: "Mixed — depends on the day" },
] as const;

export const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;
