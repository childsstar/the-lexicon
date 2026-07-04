import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How The Lexicon handles Discord authentication, profile information, optional location sharing, analytics, cookies, and beta community data.",
};

export default function Page() {
  return (
    <article className="mx-auto w-full max-w-[800px] px-5 py-14 sm:py-20">
      <Link href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-text-subtle transition-colors hover:text-gold-300">
        The Lexicon
      </Link>
      <header className="mt-8 border-b border-border-muted pb-8">
        <h1 className="font-display text-4xl font-semibold text-text sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">How The Lexicon handles Discord authentication, profile information, optional location sharing, analytics, cookies, and beta community data.</p>
      </header>
      <div className="legal-content mt-8 space-y-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Effective Date: July 4, 2026</p>
      <section><h2>Overview</h2><p>The Lexicon is an early beta community platform for tabletop gaming, hobby discovery, venues, and events. The service is evolving, so our features and data practices may change as we learn what the community needs.</p></section>
      <section><h2>Information we collect</h2><p>When you sign in with Discord, we receive the basic account information Discord provides for authentication, such as your Discord user ID, username, avatar, and email address when available. We also collect profile details you choose to add, such as display name, hobby interests, armies, experience level, and community preferences.</p></section>
      <section><h2>Location, venues, and events</h2><p>You may choose to share location-related information to discover nearby players, venues, clubs, or events. Location sharing is optional and may be approximate. Venue and event listings may come from community submissions, public sources, or third-party information and may not always be current.</p></section>
      <section><h2>Analytics and cookies</h2><p>We may use privacy-conscious analytics, logs, and cookies or similar technologies to keep the service secure, understand how features are used, remember preferences, and improve the beta experience.</p></section>
      <section><h2>How we use and share data</h2><p>We use information to operate The Lexicon, personalize discovery, support community features, prevent abuse, and communicate important service updates. We do not sell user data to advertisers. We may share limited data with service providers that help us run the platform, when required by law, or to protect users and the service.</p></section>
      <section><h2>Your choices</h2><p>You can limit what profile information you add, avoid optional location sharing, and contact us to request help with account or data questions. Some information may remain in backups or logs for a limited period for security and operational reasons.</p></section>

      </div>
    </article>
  );
}
