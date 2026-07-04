"use client";

import { useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { friendlyProfileError } from "@/lib/profiles";
import {
  GAME_SYSTEMS,
  SYSTEM_BY_NAME,
  KNOWN_SYSTEM_NAMES,
  KNOWN_FACTION_NAMES,
} from "@/lib/game-data";
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

function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        selected
          ? "border-gold-500 bg-gold-500/15 text-gold-200"
          : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text-soft"
      }`}
    >
      {label}
    </button>
  );
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

  // Game systems: curated names live in chips, anything unrecognized from a
  // previous save lands in the free-text field so nothing is ever lost.
  const initialSystems = initial?.preferred_game_systems ?? [];
  const [systems, setSystems] = useState<string[]>(
    initialSystems.filter((s) => KNOWN_SYSTEM_NAMES.has(s))
  );
  const [otherSystems, setOtherSystems] = useState(
    fromList(initialSystems.filter((s) => !KNOWN_SYSTEM_NAMES.has(s)))
  );

  // Primary factions: same split, with chips grouped by selected system.
  const initialFactions = initial?.primary_factions ?? [];
  const [factions, setFactions] = useState<string[]>(
    initialFactions.filter((f) => KNOWN_FACTION_NAMES.has(f))
  );
  const [otherFactions, setOtherFactions] = useState(
    fromList(initialFactions.filter((f) => !KNOWN_FACTION_NAMES.has(f)))
  );

  const [factionInterests, setFactionInterests] = useState(
    fromList(initial?.faction_interests)
  );
  const [homeLocations, setHomeLocations] = useState(
    fromList(initial?.home_locations)
  );
  const [discordUsername, setDiscordUsername] = useState(
    initial?.discord_username ?? ""
  );
  const [bio, setBio] = useState(initial?.bio ?? "");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Faction groups follow the systems selected above.
  const factionGroups = useMemo(
    () =>
      systems
        .map((name) => SYSTEM_BY_NAME.get(name))
        .filter((s): s is NonNullable<typeof s> => Boolean(s?.factions.length)),
    [systems]
  );

  function toggleSystem(name: string) {
    setSystems((prev) => {
      const removing = prev.includes(name);
      const next = removing
        ? prev.filter((s) => s !== name)
        : [...prev, name];
      if (removing) {
        // Drop selected factions that no remaining system offers.
        const visible = new Set(
          next.flatMap((n) => SYSTEM_BY_NAME.get(n)?.factions ?? [])
        );
        setFactions((f) => f.filter((x) => visible.has(x)));
      }
      return next;
    });
  }

  function toggleFaction(name: string) {
    setFactions((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  }

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
        preferred_game_systems: [...systems, ...toList(otherSystems)],
        primary_factions: [...factions, ...toList(otherFactions)],
        faction_interests: toList(factionInterests),
        home_locations: toList(homeLocations),
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
          className="mb-1.5 block text-sm font-medium text-text"
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
        <p className="mt-1.5 text-xs text-text-subtle">
          Your name on the battlefield — lowercase letters, numbers, and
          underscores.
        </p>
      </div>

      <div>
        <label
          htmlFor="display_name"
          className="mb-1.5 block text-sm font-medium text-text"
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
          className="mb-1.5 block text-sm font-medium text-text"
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
          className="mb-1.5 block text-sm font-medium text-text"
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
          className="mb-1.5 block text-sm font-medium text-text"
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
        <p className="mb-1.5 text-sm font-medium text-text">
          Game systems
        </p>
        <p className="mb-3 text-xs text-text-subtle">
          Pick every system you play — your faction choices follow from these.
        </p>
        <div className="flex flex-wrap gap-2">
          {GAME_SYSTEMS.map((system) => (
            <Chip
              key={system.name}
              label={system.name}
              selected={systems.includes(system.name)}
              onToggle={() => toggleSystem(system.name)}
            />
          ))}
        </div>
        <input
          id="other_systems"
          type="text"
          value={otherSystems}
          onChange={(e) => setOtherSystems(e.target.value)}
          placeholder="Playing something not listed? Add it here, comma separated"
          className="field mt-3"
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-text">
          Primary factions
        </p>
        {factionGroups.length === 0 ? (
          <p className="mb-3 text-xs text-text-subtle">
            Select a game system above to choose from its factions, or type
            yours below.
          </p>
        ) : (
          <div className="space-y-4">
            {factionGroups.map((system) => (
              <div key={system.name}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-subtle">
                  {system.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {system.factions.map((faction) => (
                    <Chip
                      key={`${system.name}:${faction}`}
                      label={faction}
                      selected={factions.includes(faction)}
                      onToggle={() => toggleFaction(faction)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <input
          id="other_factions"
          type="text"
          value={otherFactions}
          onChange={(e) => setOtherFactions(e.target.value)}
          placeholder="Other banners you march under, comma separated"
          className="field mt-3"
        />
      </div>

      <div>
        <label
          htmlFor="faction_interests"
          className="mb-1.5 block text-sm font-medium text-text"
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
          htmlFor="home_locations"
          className="mb-1.5 block text-sm font-medium text-text"
        >
          Home locations
        </label>
        <input
          id="home_locations"
          type="text"
          value={homeLocations}
          onChange={(e) => setHomeLocations(e.target.value)}
          placeholder="e.g. Brooklyn, NY 11215, 94607"
          className="field"
        />
        <p className="mt-1.5 text-xs text-text-subtle">
          One or more cities or ZIP codes, comma separated — each one anchors
          you to a local community.
        </p>
      </div>

      <div>
        <label
          htmlFor="discord_username"
          className="mb-1.5 block text-sm font-medium text-text"
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
          className="mb-1.5 block text-sm font-medium text-text"
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
