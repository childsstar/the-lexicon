"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type DiscordAuthButtonProps = {
  label?: string;
  redirectPath?: string;
  className?: string;
};

export default function DiscordAuthButton({
  label = "Continue with Discord",
  redirectPath = "/auth/callback?next=/dashboard",
  className = "",
}: DiscordAuthButtonProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDiscordAuth() {
    setError(null);
    setStarting(true);

    try {
      const redirectTo = `${window.location.origin}${redirectPath}`;
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo },
      });

      if (error) {
        setError(error.message);
        setStarting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStarting(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleDiscordAuth}
        disabled={starting}
        className="w-full rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {starting ? "Opening Discord…" : label}
      </button>
      {error && (
        <p className="mt-3 rounded-md border border-ember-500/50 bg-ember-500/10 px-4 py-3 text-sm text-ember-400">
          {error}
        </p>
      )}
    </div>
  );
}
