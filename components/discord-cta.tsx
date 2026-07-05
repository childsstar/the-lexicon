import { ChatIcon } from "@/components/icons";

export default function DiscordCta({
  url,
  communityLabel,
}: {
  url: string | null | undefined;
  /** e.g. "Warhammer 40,000" — when known (and unambiguous), personalizes
   * the CTA copy instead of the generic "Join Discord". A venue with
   * multiple mapped realms and no single one active falls back to the
   * generic copy rather than guessing. */
  communityLabel?: string | null;
}) {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  const label = communityLabel?.trim();

  return (
    <div className="card flex items-start gap-4 p-5">
      <ChatIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-semibold text-text">
          Community Discord
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Join the local Discord to find games, events, leagues, and pickup
          nights.
        </p>
        <a
          href={trimmed}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
        >
          {label ? `Join this venue's ${label} community` : "Join Discord"}
        </a>
      </div>
    </div>
  );
}
