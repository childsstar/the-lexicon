"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth-provider";
import ProfileForm, {
  type ProfileFormDefaults,
} from "@/components/profile-form";
import { LexiconMark } from "@/components/icons";

type Metadata = Record<string, unknown>;

function stringValue(metadata: Metadata, keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function discordMetadata(user: User): Metadata | null {
  const discordIdentity = user.identities?.find(
    (identity) => identity.provider === "discord"
  );
  if (!discordIdentity) return null;

  return {
    ...user.user_metadata,
    ...(discordIdentity.identity_data ?? {}),
  };
}

function importedDiscordDefaults(user: User): ProfileFormDefaults | null {
  const metadata = discordMetadata(user);
  if (!metadata) return null;

  const defaults = {
    display_name: stringValue(metadata, [
      "full_name",
      "name",
      "global_name",
      "username",
    ]),
    avatar_url: stringValue(metadata, ["avatar_url", "picture"]),
    discord_username: stringValue(metadata, [
      "discord_username",
      "full_name",
      "name",
      "global_name",
      "username",
    ]),
  };

  return Object.values(defaults).some(Boolean) ? defaults : null;
}

export default function ProfileSetupClient() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const importedDefaults = useMemo(
    () => (user ? importedDiscordDefaults(user) : null),
    [user]
  );

  if (!user) return null; // AuthGuard handles the redirect.

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <LexiconMark className="mx-auto h-9 w-9 text-gold-400" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          Forge your commander identity
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text">
          {profile ? "Complete your profile" : "Who takes the field?"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          A username and your availability are all The Lexicon needs to open
          your chronicle. The rest helps future opponents find you — add it
          now or later.
        </p>
        {importedDefaults && (
          <p className="mt-3 rounded-md border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs leading-relaxed text-gold-200">
            Some details were imported from Discord. You can edit them before
            entering The Lexicon.
          </p>
        )}
        <div className="gilded-rule mt-5" />
      </div>

      <ProfileForm
        userId={user.id}
        initial={profile}
        importedDefaults={importedDefaults ?? undefined}
        submitLabel="Enter your Lexicon"
        onSaved={() => {
          void refreshProfile().then(() => router.replace("/dashboard"));
        }}
      />
    </div>
  );
}
