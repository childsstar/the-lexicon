"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import DiscordAuthButton from "@/components/discord-auth-button";

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => {
    try {
      getSupabaseClient()
        .auth.getSession()
        .then(({ data }) => {
          if (data.session) router.replace("/dashboard");
        });
    } catch {
      // Missing env config — the submit handler surfaces the message.
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Passwords need at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/sign-in`
              : undefined,
        },
      });
      if (error) {
        setError(error.message);
        setSubmitting(false);
        return;
      }
      if (data.session) {
        // Email confirmation disabled — signed in immediately.
        router.replace("/profile/setup");
        return;
      }
      // Email confirmation required.
      setAwaitingConfirmation(true);
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="card p-6 text-center">
        <h2 className="font-display text-xl font-semibold text-parchment-100">
          A raven has been dispatched
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-parchment-500">
          We sent a confirmation link to{" "}
          <span className="text-parchment-100">{email}</span>. Follow it, then
          sign in to begin your chronicle.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block rounded-md border border-gold-600 px-6 py-3 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DiscordAuthButton />

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-parchment-700">
        <span className="h-px flex-1 bg-ink-700" />
        <span>or continue with email</span>
        <span className="h-px flex-1 bg-ink-700" />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="mb-1.5 block text-sm font-medium text-parchment-100"
        >
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Once more, for the record"
          className="field"
        />
      </div>

      {error && (
        <p className="rounded-md border border-ember-500/50 bg-ember-500/10 px-4 py-3 text-sm text-ember-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Inscribing your name…" : "Create account"}
      </button>

      <p className="text-center text-sm text-parchment-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-gold-300 hover:text-gold-200"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
