import { Suspense } from "react";
import type { Metadata } from "next";
import { FIND_YOUR_WORLD } from "@/lib/world-quiz";
import WorldExperience from "@/components/world/world-experience";
import { LexiconMark } from "@/components/icons";

// Static sibling of /chronicles/[slug]: Find Your World recommends game
// systems rather than banners, so it has its own experience instead of a
// registry entry. Its result hands off to Find Your Banner via ?systems=.

export const metadata: Metadata = {
  title: FIND_YOUR_WORLD.title,
  description: `${FIND_YOUR_WORLD.tagline} Discover which tabletop game systems match how you like to play — before you find your banner. No account needed.`,
  openGraph: {
    title: `${FIND_YOUR_WORLD.title} · The Lexicon`,
    description: FIND_YOUR_WORLD.invocation,
  },
};

export default function FindYourWorldPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <LexiconMark className="h-10 w-10 animate-breathe text-gold-500" />
        </div>
      }
    >
      <WorldExperience />
    </Suspense>
  );
}
