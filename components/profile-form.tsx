"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { friendlyProfileError } from "@/lib/profiles";
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_LEVELS,
  PLAY_STYLES,
  USERNAME_PATTERN,
  type Profile,
} from "@/lib/types";

function toList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromList(value: string[] | null | undefined): string {
  return (value ?? []).join(", ");
}

export default function ProfileForm({
  userId,
  initial,
  submitLabel,
  onSaved,
}: {
  userId: string;
  initial: Profile | null;
  submitLabel: string;
  onSaved: () => void;
}) {
  const [username, setUsername] = useState(initial?.username ?? "");
  const [displayName, setDisplayName] = useState(initial?.display_name ?? "");
  const [experience, setExperience] = useState(
    initial?.experience_level ?? ""
  );
  const [availability, setAvailability] = useState(
    initial?.availability ?? ""
  );
  const [playStyle, setPlayStyle] = useState(
    initial?.preferred_play_style ?? ""
  );
  const [gameSystems, setGameSystems] = useState(
    fromList(initial?.preferred_game_systems)
  );
  const [factions, setFactions] = useState(fromList(initial?.primary_factions));
  const [factionInterests, setFactionInterests] = useState(
    fromList(initial?.faction_interests)
  );
  const [homeLocation, setHomeLocation] = useState(
    initial?.home_location ?? ""
  );
  const [discordUsername, setDiscordUsername] = useState(
    initial?.discord_username ?? ""
  );
  const [bio, setBio] = useState(initial?.bio ?? "");

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
        experience_level: experience || null,
        availability,
        preferred_play_style: playStyle || null,
        preferred_game_systems: toList(gameSystems),
        primary_factions: toList(factions),
        faction_interests: toList(factionInterests),
        home_location: homeLocation.trim() || null,
        discord_username: discordUsername.trim() || null,
        bio: bio.trim() || null,
        profile_completed_at:
          initial?.profile_completed_at ?? new Date().toISOString(),
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Username <span className="text-gold-400">*</span>
        </label>
        <input
          id="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="e.g. emberfall_veteran"
          className="field"
        />
        <p className="mt-1.5 text-xs text-parchment-700">
          Your name on the battlefield — lowercase letters, numbers, and
          underscores.
        </p>
      </div>

      <div>
        <label
          htmlFor="display_name"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Display name
        </label>
        <input
          id="display_name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you'd like to be addressed"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="availability"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Availability <span className="text-gold-400">*</span>
        </label>
        <select
          id="availability"
          required
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="field"
        >
          <option value="" disabled>
            When can you take the field?
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
          htmlFor="experience"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Experience level
        </label>
        <select
          id="experience"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="field"
        >
          <option value="">How long have you served?</option>
          {EXPERIENCE_LEVELS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="play_style"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Preferred play style
        </label>
        <select
          id="play_style"
          value={playStyle}
          onChange={(e) => setPlayStyle(e.target.value)}
          className="field"
        >
          <option value="">How do you like your battles?</option>
          {PLAY_STYLES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="game_systems"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Game systems
        </label>
        <input
          id="game_systems"
          type="text"
          value={gameSystems}
          onChange={(e) => setGameSystems(e.target.value)}
          placeholder="e.g. Grimdark 40K-scale, Skirmish, Fantasy battles"
          className="field"
        />
        <p className="mt-1.5 text-xs text-parchment-700">
          Separate multiple systems with commas.
        </p>
      </div>

      <div>
        <label
          htmlFor="factions"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Primary factions
        </label>
        <input
          id="factions"
          type="text"
          value={factions}
          onChange={(e) => setFactions(e.target.value)}
          placeholder="The banners you already march under"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="faction_interests"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Faction interests
        </label>
        <input
          id="faction_interests"
          type="text"
          value={factionInterests}
          onChange={(e) => setFactionInterests(e.target.value)}
          placeholder="Forces you're curious about mustering next"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="home_location"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Home location
        </label>
        <input
          id="home_location"
          type="text"
          value={homeLocation}
          onChange={(e) => setHomeLocation(e.target.value)}
          placeholder="City or region — for finding nearby players"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="discord_username"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Discord username
        </label>
        <input
          id="discord_username"
          type="text"
          value={discordUsername}
          onChange={(e) => setDiscordUsername(e.target.value)}
          placeholder="For coordinating games off the battlefield"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
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
        {saving ? "Inscribing…" : submitLabel}
      </button>
    </form>
  );
}
