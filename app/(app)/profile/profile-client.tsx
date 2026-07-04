"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import ProfileForm from "@/components/profile-form";
import { useAuth } from "@/components/auth-provider";
import { isProfileEnriched } from "@/lib/profiles";
import { UserIcon } from "@/components/icons";
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_LEVELS,
  PLAY_STYLES,
} from "@/lib/types";

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string | null
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | string[] | null;
}) {
  const text = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <p className="text-sm font-medium text-parchment-100">{label}</p>
      {text ? (
        <p className="max-w-[60%] text-right text-sm text-parchment-500">
          {text}
        </p>
      ) : (
        <span className="rounded-full border border-ink-700 px-3 py-1 text-xs text-parchment-700">
          Not set
        </span>
      )}
    </div>
  );
}

export default function ProfileClient() {
  const router = useRouter();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null; // AuthGuard handles the redirect.

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    // Full navigation (not router.replace) so the auth guard can't race us
    // to /sign-in and the app remounts with a clean slate.
    window.location.assign("/");
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader
          title="Edit your profile"
          description="Amend the record. Your chronicle stays yours."
          backHref="/profile"
          backLabel="Profile"
        />
        <ProfileForm
          userId={user.id}
          initial={profile}
          submitLabel="Save changes"
          onSaved={() => {
            void refreshProfile().then(() => setEditing(false));
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your commander identity — who you are, when you play, and how you like your battles fought."
        action={
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-md border border-gold-600 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
          >
            Edit
          </button>
        }
      />

      <div className="card mb-4 flex items-center gap-4 p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold-600/40 bg-ink-850 text-gold-500">
          <UserIcon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold text-parchment-100">
            {profile?.display_name || profile?.username || "Unnamed Commander"}
          </h2>
          <p className="mt-0.5 text-sm text-parchment-500">
            @{profile?.username ?? "—"}
          </p>
        </div>
      </div>

      {!isProfileEnriched(profile) && (
        <Link
          href="/profile/setup"
          className="card card-interactive mb-4 block border-gold-600/50 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Complete your profile
          </p>
          <p className="mt-1 text-sm text-parchment-500">
            Add your experience level, play style, and factions so the right
            opponents can find you.
          </p>
        </Link>
      )}

      <div className="card divide-y divide-ink-800">
        <Row
          label="Availability"
          value={labelFor(AVAILABILITY_OPTIONS, profile?.availability ?? null)}
        />
        <Row
          label="Experience"
          value={labelFor(EXPERIENCE_LEVELS, profile?.experience_level ?? null)}
        />
        <Row
          label="Play style"
          value={labelFor(PLAY_STYLES, profile?.preferred_play_style ?? null)}
        />
        <Row
          label="Game systems"
          value={profile?.preferred_game_systems ?? null}
        />
        <Row label="Primary factions" value={profile?.primary_factions ?? null} />
        <Row
          label="Faction interests"
          value={profile?.faction_interests ?? null}
        />
        <Row label="Home locations" value={profile?.home_locations ?? null} />
        <Row label="Discord" value={profile?.discord_username ?? null} />
      </div>

      {profile?.bio && (
        <div className="card mt-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-parchment-700">
            Your chronicle so far
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-parchment-300">
            {profile.bio}
          </p>
        </div>
      )}

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-8 w-full rounded-md border border-ink-600 px-6 py-3 text-sm font-medium text-parchment-500 transition-colors hover:border-ember-500 hover:text-ember-400 disabled:opacity-60"
      >
        {signingOut ? "Closing the tome…" : "Sign out"}
      </button>
    </div>
  );
}
