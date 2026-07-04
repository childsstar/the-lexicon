import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "Community expectations for respectful tabletop gaming discussion, hobby discovery, venue listings, and events on The Lexicon.",
};

export default function Page() {
  return (
    <article className="mx-auto w-full max-w-[800px] px-5 py-14 sm:py-20">
      <Link href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-parchment-700 transition-colors hover:text-gold-300">
        The Lexicon
      </Link>
      <header className="mt-8 border-b border-ink-800 pb-8">
        <h1 className="font-display text-4xl font-semibold text-parchment-100 sm:text-5xl">Community Guidelines</h1>
        <p className="mt-4 text-base leading-relaxed text-parchment-500">Community expectations for respectful tabletop gaming discussion, hobby discovery, venue listings, and events on The Lexicon.</p>
      </header>
      <div className="legal-content mt-8 space-y-8">
      <section><h2>Build the table you want to play at</h2><p>The Lexicon is for tabletop players, hobbyists, organizers, stores, and curious newcomers. Help make it welcoming: be respectful, assume good faith, and remember there is room for many games, factions, play styles, and skill levels.</p></section>
      <section><h2>Be accurate and helpful</h2><p>Share venue, event, and hobby information in good faith. Because The Lexicon is evolving and community information may not always be current, avoid presenting uncertain details as guaranteed and update or flag outdated listings when you can.</p></section>
      <section><h2>Respect people and property</h2><p>Do not harass, threaten, dox, spam, impersonate, or discriminate against others. Do not upload content you do not have the right to share, and respect the rules of local stores, clubs, conventions, and event organizers.</p></section>
      <section><h2>Keep it appropriate for the community</h2><p>Avoid illegal content, explicit sexual content, graphic real-world violence, scams, malicious links, and content designed primarily to provoke or derail. Tabletop conflict belongs on the battlefield, not in personal attacks.</p></section>
      <section><h2>Moderation</h2><p>We may remove content, limit features, or suspend accounts that harm the service or community. During beta, moderation processes may evolve as we learn what keeps the platform safe and useful.</p></section>

      </div>
    </article>
  );
}
