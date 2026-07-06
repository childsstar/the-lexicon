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
      <p className="text-sm font-medium text-text">{label}</p>
      {text ? (
        <p className="max-w-[60%] text-right text-sm text-text-muted">
          {text}
        </p>
      ) : (
        <span className="rounded-full border border-border px-3 py-1 text-xs text-text-subtle">
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!user) return null; // AuthGuard handles the redirect.

  async function getAccessToken() {
    const { getSupabaseClient } = await import("@/lib/supabase");
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    // Full navigation (not router.replace) so the auth guard can't race us
    // to /sign-in and the app remounts with a clean slate.
    window.location.assign("/");
  }

  async function handleResetOnboarding() {
    setAccountError(null);
    setResettingOnboarding(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch("/api/account/reset-onboarding", {
        method: "POST",
        headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Onboarding reset failed.");
      }
      try {
        localStorage.removeItem("lexicon-active-universe");
      } catch {
        /* localStorage unavailable — server state was still reset */
      }
      await refreshProfile();
      router.replace("/profile/setup");
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : String(err));
    } finally {
      setResettingOnboarding(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteText !== "DELETE") return;
    setAccountError(null);
    setDeleting(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Account deletion failed.");
      }
      await signOut();
      window.location.assign("/");
    } catch (err) {
      setDeleting(false);
      setAccountError(err instanceof Error ? err.message : String(err));
    }
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
          <div className="flex shrink-0 gap-2">
            <Link
              href="/profile/army-lists/import"
              className="rounded-md border border-gold-600 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
            >
              Import Army List
            </Link>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-gold-600 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
            >
              Edit
            </button>
          </div>
        }
      />

      <div className="card mb-4 flex items-center gap-4 p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold-600/40 bg-surface text-gold-500">
          <UserIcon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold text-text">
            {profile?.display_name || profile?.username || "Unnamed Commander"}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
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
          <p className="mt-1 text-sm text-text-muted">
            Add your experience level, play style, and factions so the right
            opponents can find you.
          </p>
        </Link>
      )}

      <div className="card divide-y divide-border-muted">
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
          <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">
            Your chronicle so far
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-soft">
            {profile.bio}
          </p>
        </div>
      )}


      <section className="card mt-8 border-ember-900/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember-400">
          Account
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-text">
          Account settings
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Manage development onboarding state or permanently close your Lexicon
          account. Deletion removes your profile and user-owned records before
          removing your Supabase Auth user.
        </p>

        {accountError && (
          <p className="mt-4 rounded-md border border-ember-800/60 bg-ember-950/30 px-4 py-3 text-sm text-ember-300">
            {accountError}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {isDevelopment && (
            <button
              onClick={handleResetOnboarding}
              disabled={resettingOnboarding || deleting}
              className="rounded-md border border-border-strong px-4 py-2 text-sm font-semibold text-text-muted transition-colors hover:border-gold-600 hover:text-gold-300 disabled:opacity-60"
            >
              {resettingOnboarding ? "Resetting…" : "Reset onboarding"}
            </button>
          )}
          <button
            onClick={() => {
              setDeleteText("");
              setConfirmingDelete(true);
            }}
            disabled={deleting}
            className="rounded-md border border-ember-700 px-4 py-2 text-sm font-semibold text-ember-300 transition-colors hover:border-ember-500 hover:text-ember-200 disabled:opacity-60"
          >
            Delete Account
          </button>
        </div>
      </section>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md border-ember-800 p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember-400">
              Permanent action
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-text">
              Delete your account?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              This removes your profile, armies, army lists, battles,
              connections, created campaigns, created venues, and Auth user.
              Type DELETE to confirm.
            </p>
            <input
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
              placeholder="DELETE"
              className="mt-5 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-ember-500"
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== "DELETE" || deleting}
                className="rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ember-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-8 w-full rounded-md border border-border-strong px-6 py-3 text-sm font-medium text-text-muted transition-colors hover:border-ember-500 hover:text-ember-400 disabled:opacity-60"
      >
        {signingOut ? "Closing the tome…" : "Sign out"}
      </button>
    </div>
  );
}
