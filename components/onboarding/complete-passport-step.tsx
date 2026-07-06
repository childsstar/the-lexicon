"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { friendlyProfileError } from "@/lib/profiles";
import { useActiveUniverse } from "@/components/active-universe-provider";
import {
  AVAILABILITY_OPTIONS,
  TRAVEL_RADIUS_OPTIONS,
  USERNAME_PATTERN,
} from "@/lib/types";
import type { BannerSelection } from "@/components/onboarding/choose-banner-step";
import { toList, type ProfileFormDefaults } from "@/components/profile-form";

function suggestUsername(seed: string | null): string {
  if (!seed) return "";
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

export default function CompletePassportStep({
  userId,
  importedDefaults,
  bannerSelection,
  venueId,
  onSaved,
}: {
  userId: string;
  importedDefaults?: ProfileFormDefaults;
  bannerSelection: BannerSelection;
  venueId: string | null;
  onSaved: () => void;
}) {
  const { universeKey, realmKey, gameKey } = useActiveUniverse();
  const [username, setUsername] = useState(
    suggestUsername(
      importedDefaults?.discord_username ?? importedDefaults?.display_name ?? null
    )
  );
  const [displayName, setDisplayName] = useState(
    importedDefaults?.display_name ?? ""
  );
  const [availability, setAvailability] = useState("");
  const [homeTerritories, setHomeTerritories] = useState("");
  const [travelRadius, setTravelRadius] = useState<string>("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(cleanUsername)) {
      setError(
        "Username must be 3–32 characters: lowercase letters, numbers, and underscores only."
      );
      return;
    }
    if (!availability) {
      setError("Set your availability — it's how opponents find you.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        username: cleanUsername,
        display_name: displayName.trim() || null,
        availability,
        preferred_game_systems: bannerSelection.gameSystem
          ? [bannerSelection.gameSystem]
          : [],
        primary_factions: bannerSelection.primaryFaction
          ? [bannerSelection.primaryFaction]
          : [],
        home_locations: toList(homeTerritories),
        home_venue_id: venueId,
        travel_radius_miles: travelRadius ? Number(travelRadius) : null,
        banner_id: bannerSelection.bannerId,
        discord_username: importedDefaults?.discord_username ?? null,
        avatar_url: importedDefaults?.avatar_url ?? null,
        bio: bio.trim() || null,
        preferred_universe_key: universeKey,
        preferred_realm_key: realmKey,
        preferred_game_key: gameKey,
        profile_completed_at: new Date().toISOString(),
      });
      if (error) {
        setError(friendlyProfileError(error));
        setSaving(false);
        return;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <div className="animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          Complete your passport
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-snug text-text">
          A few last details for the road ahead.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Only two of these are required — the rest can wait until later.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="ob_username"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Username <span className="text-gold-400">*</span>
            </label>
            <input
              id="ob_username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="e.g. emberfall_veteran"
              className="field"
            />
          </div>

          <div>
            <label
              htmlFor="ob_availability"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              When can you usually take the field?{" "}
              <span className="text-gold-400">*</span>
            </label>
            <select
              id="ob_availability"
              required
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="field"
            >
              <option value="" disabled>
                Choose your availability
              </option>
              {AVAILABILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ob_display_name"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Display name
            </label>
            <input
              id="ob_display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you'd like to be addressed"
              className="field"
            />
          </div>

          <div>
            <label
              htmlFor="ob_home_territories"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Home territories
            </label>
            <input
              id="ob_home_territories"
              type="text"
              value={homeTerritories}
              onChange={(e) => setHomeTerritories(e.target.value)}
              placeholder="e.g. Brooklyn NY, Austin TX, 94607"
              className="field"
            />
            <p className="mt-1.5 text-xs text-text-subtle">
              One or more cities or ZIP codes, comma separated — each one
              anchors you to a local community. Add every city you actually
              spend time in.
            </p>
          </div>

          <div>
            <label
              htmlFor="ob_travel_radius"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Travel radius
            </label>
            <select
              id="ob_travel_radius"
              value={travelRadius}
              onChange={(e) => setTravelRadius(e.target.value)}
              className="field"
            >
              <option value="">How far will you travel?</option>
              {TRAVEL_RADIUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ob_bio"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Bio
            </label>
            <textarea
              id="ob_bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few lines of your legend so far…"
              className="field resize-y"
            />
          </div>

          {error && (
            <p className="rounded-md border border-ember-500/50 bg-ember-500/10 px-4 py-3 text-sm text-ember-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Inscribing your passport…" : "Stamp my passport"}
          </button>
          <p className="text-center text-xs text-text-subtle">
            Faction, game systems, and the rest can be filled in anytime from
            your profile.
          </p>
        </form>
      </div>
    </div>
  );
}
