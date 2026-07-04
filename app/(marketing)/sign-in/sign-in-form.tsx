"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

// TODO: Supabase also supports Discord OAuth — enable the Discord provider in
// the Supabase dashboard and add signInWithOAuth({ provider: "discord" })
// here. No credentials belong in this repo.

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Straight to the dashboard.
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
    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "No commander answers to that email and password. Check them and try again."
            : error.message
        );
        setSubmitting(false);
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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
        {submitting ? "Opening the gates…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-parchment-500">
        New to The Lexicon?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-gold-300 hover:text-gold-200"
        >
          Begin your chronicle
        </Link>
      </p>
    </form>
  );
}
