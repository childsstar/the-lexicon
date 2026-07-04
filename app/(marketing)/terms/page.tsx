import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Concise beta terms for using The Lexicon tabletop gaming community platform, including user content ownership and venue and event listing expectations.",
};

export default function Page() {
  return (
    <article className="mx-auto w-full max-w-[800px] px-5 py-14 sm:py-20">
      <Link href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-text-subtle transition-colors hover:text-gold-300">
        The Lexicon
      </Link>
      <header className="mt-8 border-b border-border-muted pb-8">
        <h1 className="font-display text-4xl font-semibold text-text sm:text-5xl">Terms of Service</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">Concise beta terms for using The Lexicon tabletop gaming community platform, including user content ownership and venue and event listing expectations.</p>
      </header>
      <div className="legal-content mt-8 space-y-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Effective Date: July 4, 2026</p>
      <section><h2>Welcome to The Lexicon</h2><p>The Lexicon is an early beta community platform for tabletop gaming, hobby discovery, venues, and events. By using the service, you agree to these Terms and understand that features, availability, and policies may evolve as the platform grows.</p></section>
      <section><h2>Accounts and community use</h2><p>You are responsible for your account activity and for keeping your sign-in method secure. Use The Lexicon in a lawful, respectful way and do not harass others, impersonate people, scrape the service, disrupt the platform, or submit misleading, harmful, or infringing content.</p></section>
      <section><h2>Your content</h2><p>You retain ownership of content you submit, including profiles, army details, battle logs, posts, venue suggestions, event details, and other community contributions. You grant The Lexicon a non-exclusive, worldwide license to host, store, reproduce, display, format, and distribute that content as needed to operate, improve, and promote the service within The Lexicon.</p></section>
      <section><h2>Venues and events</h2><p>Venue, club, and event information may be provided by users, public sources, partners, or other third parties. The information may not always be current, complete, or accurate. Confirm times, locations, entry requirements, and availability directly with the organizer or venue before traveling or making plans.</p></section>
      <section><h2>Beta availability</h2><p>The Lexicon is provided on an early beta basis and may change, pause, or discontinue features without notice. We aim to keep the service useful and reliable, but we cannot promise it will always be error-free or available.</p></section>
      <section><h2>Contact</h2><p>If you have questions about these Terms or need help with your account, reach us through the Contact page.</p></section>

      </div>
    </article>
  );
}
