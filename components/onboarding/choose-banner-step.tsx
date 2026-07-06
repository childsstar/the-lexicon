"use client";

import { useMemo, useState } from "react";
import { BANNERS } from "@/lib/chronicle/banners";
import { filterBannersForActiveContext, type Banner } from "@/lib/chronicle/types";
import { useActiveUniverse } from "@/components/active-universe-provider";
import { isGameKey } from "@/lib/games";
import BannerArt from "@/components/chronicle/banner-art";
import { SectionRule } from "@/components/chronicle/frame";

export type BannerSelection = {
  bannerId: string | null;
  bannerName: string | null;
  gameSystem: string | null;
  primaryFaction: string | null;
};

const PICKER_SIZE = 6;

/**
 * "Every traveler carries a banner." A quick, real picker drawn from the
 * same Hall of Banners data as Find Your Banner — scoped to the active
 * realm when one is set. Picking one here updates the active
 * universe/realm/game (same real decision Find Your Banner makes), and the
 * choice travels into the final passport save. Skippable: no banner is
 * required to enter The Lexicon.
 */
export default function ChooseBannerStep({
  onContinue,
  onSkip,
}: {
  onContinue: (selection: BannerSelection) => void;
  onSkip: () => void;
}) {
  const { realmKey, gameKey, setGame } = useActiveUniverse();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const picks = useMemo(() => {
    const { banners } = filterBannersForActiveContext(BANNERS, {
      realmKey,
      gameKey,
    });
    return banners.slice(0, PICKER_SIZE);
  }, [realmKey, gameKey]);

  const selected: Banner | undefined = picks.find((b) => b.id === selectedId);

  function choose(banner: Banner) {
    setSelectedId((current) => (current === banner.id ? null : banner.id));
    if (isGameKey(banner.gameSystemKey)) setGame(banner.gameSystemKey);
  }

  function continueOnward() {
    onContinue({
      bannerId: selected?.id ?? null,
      bannerName: selected?.name ?? null,
      gameSystem: selected?.gameSystem ?? null,
      primaryFaction: selected?.primaryFaction ?? null,
    });
  }

  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <div className="animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          Every traveler carries a banner
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-snug text-text">
          Which worlds call to you?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Pick a banner to march under, or leave this for later.
        </p>

        <div className="mt-8">
          <SectionRule label="A few callings" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {picks.map((banner) => {
              const isSelected = banner.id === selectedId;
              return (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => choose(banner)}
                  className={`card overflow-hidden text-left transition-colors ${
                    isSelected ? "border-gold-400" : ""
                  }`}
                >
                  <BannerArt
                    palette={banner.palette}
                    bannerId={banner.id}
                    className="flex aspect-square items-end p-3"
                  >
                    <p className="relative font-display text-sm font-semibold leading-tight text-white drop-shadow">
                      {banner.name}
                    </p>
                  </BannerArt>
                  <div className="p-2.5">
                    <p className="truncate text-[0.7rem] font-medium text-gold-300">
                      {banner.primaryFaction}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <a
            href="/chronicles/find-your-banner"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-gold-300 transition-colors hover:text-gold-200"
          >
            Prefer the full chronicle? Take Find Your Banner ↗
          </a>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={continueOnward}
            className="w-full rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            {selected ? `March under ${selected.name}` : "Continue"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 text-center text-xs font-medium uppercase tracking-widest text-text-subtle transition-colors hover:text-text-soft"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
