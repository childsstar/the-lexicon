"use client";

import Link from "next/link";
import type { Venue } from "@/lib/venues";
import type { BannerSelection } from "@/components/onboarding/choose-banner-step";
import { MapPinIcon, FlagIcon, ScrollIcon } from "@/components/icons";
import { SectionRule } from "@/components/chronicle/frame";

type Briefing = {
  icon: React.ReactNode;
  label: string;
  href: string;
  external?: boolean;
};

/**
 * The Traveler's Briefing — deliberately built so it can later become "Three
 * opportunities look interesting this week" without changing this component's
 * shape: swap `buildBriefing`'s static suggestions for a real recommendation
 * feed and the card stays the same. Every link here is real today; nothing
 * on this card is invented.
 */
function buildBriefing(venue: Venue | null, banner: BannerSelection): Briefing[] {
  const items: Briefing[] = [];

  items.push(
    venue
      ? {
          icon: <MapPinIcon className="h-4 w-4" />,
          label: `Say hello at ${venue.name}`,
          href: `/venues/${venue.id}`,
        }
      : {
          icon: <MapPinIcon className="h-4 w-4" />,
          label: "Explore venues near you",
          href: "/venues",
        }
  );

  items.push(
    banner.bannerName
      ? {
          icon: <ScrollIcon className="h-4 w-4" />,
          label: `Muster your first ${banner.primaryFaction ?? "force"}`,
          href: "/armies/muster",
        }
      : {
          icon: <ScrollIcon className="h-4 w-4" />,
          label: "Browse the Hall of Banners",
          href: "/chronicles/banners",
        }
  );

  items.push({
    icon: <FlagIcon className="h-4 w-4" />,
    label: "Finish your legend — factions, play style, and more",
    href: "/profile",
  });

  return items;
}

export default function TravelersBriefing({
  venue,
  banner,
  onEnter,
}: {
  venue: Venue | null;
  banner: BannerSelection;
  onEnter: () => void;
}) {
  const items = buildBriefing(venue, banner);

  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <div className="animate-rise text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          Your passport is stamped
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-snug text-text">
          Welcome to the road ahead.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
          The Lexicon is just getting to know you. Here&apos;s where your
          story could go next.
        </p>
      </div>

      <div className="card mt-8 p-5">
        <SectionRule label="Traveler's Briefing" />
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-text-soft transition-colors hover:bg-surface-raised hover:text-gold-200"
            >
              <span className="rounded-full border border-border bg-surface p-1.5 text-gold-500">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-center text-[0.65rem] uppercase tracking-widest text-text-subtle">
          Recommended for you — this list grows smarter over time
        </p>
      </div>

      <button
        type="button"
        onClick={onEnter}
        className="mt-8 w-full rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
      >
        Enter The Lexicon
      </button>
    </div>
  );
}
