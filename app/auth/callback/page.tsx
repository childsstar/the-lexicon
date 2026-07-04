"use client";

import { useEffect, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { LexiconMark } from "@/components/icons";

function getSafeNextPath(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

function redirectToSignInError(message: string) {
  const url = new URL("/sign-in", window.location.origin);
  url.searchParams.set("error", message);
  window.location.replace(url.toString());
}

export default function AuthCallbackPage() {
  const hasExchangedCode = useRef(false);

  useEffect(() => {
    if (hasExchangedCode.current) return;
    hasExchangedCode.current = true;

    async function exchangeCode() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const next = getSafeNextPath(params.get("next"));
      const oauthError = params.get("error");
      const oauthErrorDescription = params.get("error_description");

      if (oauthError) {
        const message =
          oauthErrorDescription ||
          `Discord authorization failed: ${oauthError}`;
        console.error("Discord OAuth callback returned an error", {
          error: oauthError,
          errorDescription: oauthErrorDescription,
        });
        redirectToSignInError(message);
        return;
      }

      if (!code) {
        console.error("Discord OAuth callback is missing a code parameter");
        redirectToSignInError("Discord did not return an OAuth code.");
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Discord OAuth code exchange failed", error);
          redirectToSignInError(error.message);
          return;
        }

        window.location.replace(next);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Discord OAuth callback exchange crashed", err);
        redirectToSignInError(message);
      }
    }

    void exchangeCode();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <LexiconMark className="h-9 w-9 animate-pulse text-gold-500" />
      <h1 className="mt-4 font-display text-xl font-semibold text-parchment-100">
        Finishing sign-in…
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-parchment-500">
        Hold tight while Discord returns you to The Lexicon.
      </p>
    </main>
  );
}
