"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import ProfileForm from "@/components/profile-form";
import { LexiconMark } from "@/components/icons";

export default function ProfileSetupClient() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

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
        <div className="gilded-rule mt-5" />
      </div>

      <ProfileForm
        userId={user.id}
        initial={profile}
        submitLabel="Enter your Lexicon"
        onSaved={() => {
          void refreshProfile().then(() => router.replace("/dashboard"));
        }}
      />
    </div>
  );
}
