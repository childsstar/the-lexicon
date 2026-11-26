import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChronicle, listChronicles } from "@/lib/chronicle";
import {
  GAME_SYSTEMS,
  isGameSystemKey,
  type GameSystemKey,
} from "@/lib/game-systems";
import ChronicleExperience from "@/components/chronicle/chronicle-experience";
import { LexiconMark } from "@/components/icons";

// A chronicle scoped to one game system by path, e.g.
// /chronicles/find-your-banner/age-of-sigmar — a clean, shareable link that
// drops a reader straight into that world's banners. Same experience as
// ?systems=<key>, but the system lives in the path so the link reads well
// and gets its own preview title. Only systems with at least one charted
// banner get a page; anything else 404s rather than silently showing every
// banner.

export const dynamicParams = false;

function systemsWithBanners(slug: string): GameSystemKey[] {
  const entry = getChronicle(slug);
  if (!entry) return [];
  return [...new Set(entry.banners.map((banner) => banner.gameSystemKey))];
}

export function generateStaticParams() {
  return listChronicles().flatMap((entry) =>
    systemsWithBanners(entry.quiz.slug).map((system) => ({
      slug: entry.quiz.slug,
      system,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; system: string }>;
}): Promise<Metadata> {
  const { slug, system } = await params;
  const entry = getChronicle(slug);
  if (!entry || !isGameSystemKey(system)) return {};
  const systemName = GAME_SYSTEMS[system].name;
  return {
    title: `${entry.quiz.title} — ${systemName}`,
    description: `${entry.quiz.tagline} Discover which ${systemName} banner answers your call. A Chronicle of The Lexicon — no account needed.`,
    openGraph: {
      title: `${entry.quiz.title}: ${systemName} · The Lexicon`,
      description: entry.quiz.invocation,
    },
  };
}

export default async function ScopedChroniclePage({
  params,
}: {
  params: Promise<{ slug: string; system: string }>;
}) {
  const { slug, system } = await params;
  const entry = getChronicle(slug);
  if (!entry || !isGameSystemKey(system)) notFound();
  if (!systemsWithBanners(slug).includes(system)) notFound();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <LexiconMark className="h-10 w-10 animate-breathe text-gold-500" />
        </div>
      }
    >
      <ChronicleExperience
        entry={{ quiz: entry.quiz, banners: entry.banners }}
        system={system}
      />
    </Suspense>
  );
}
