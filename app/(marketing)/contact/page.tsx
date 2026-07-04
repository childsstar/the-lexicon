import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to contact The Lexicon team for support, beta feedback, venue updates, privacy questions, and community safety concerns.",
};

export default function Page() {
  return (
    <article className="mx-auto w-full max-w-[800px] px-5 py-14 sm:py-20">
      <Link href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-text-subtle transition-colors hover:text-gold-300">
        The Lexicon
      </Link>
      <header className="mt-8 border-b border-border-muted pb-8">
        <h1 className="font-display text-4xl font-semibold text-text sm:text-5xl">Contact</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">How to contact The Lexicon team for support, beta feedback, venue updates, privacy questions, and community safety concerns.</p>
      </header>
      <div className="legal-content mt-8 space-y-8">
      <section><h2>Reach the team</h2><p>The Lexicon is currently in public beta, and thoughtful feedback helps shape what comes next. For support, beta feedback, account questions, privacy requests, venue corrections, event updates, or community safety concerns, email us at <a href="mailto:hello@thelexicon.games">hello@thelexicon.games</a>.</p></section>
      <section><h2>What to include</h2><p>Please include the page or feature involved, your Discord username if relevant, links or screenshots that help explain the issue, and whether the request is urgent. For venue or event corrections, include the official source when possible.</p></section>
      <section><h2>Response expectations</h2><p>We are a small early beta team, so response times may vary. We prioritize safety, account access, privacy, and major data accuracy issues first.</p></section>

      </div>
    </article>
  );
}
