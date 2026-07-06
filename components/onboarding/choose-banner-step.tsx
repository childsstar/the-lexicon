"use client";

import { useMemo, useState } from "react";
import { BANNERS } from "@/lib/chronicle/banners";
import { filterBannersForActiveContext, type Banner } from "@/lib/chronicle/types";
import { useActiveUniverse } from "@/components/active-universe-provider";
import { isGameKey } from "@/lib/games";
import { GAME_SYSTEMS, type GameSystemKey } from "@/lib/game-systems";
import BannerArt from "@/components/chronicle/banner-art";
import { SectionRule } from "@/components/chronicle/frame";

export type BannerSelection = {
  /** First banner chosen — kept for the fields that only have room for one
   * (e.g. the `banner_id` column, the Traveler's Briefing headline). */
  bannerId: string | null;
  bannerName: string | null;
  gameSystem: string | null;
  primaryFaction: string | null;
  /** Every banner chosen, in pick order — the full multi-select. */
  bannerIds: string[];
  gameSystems: string[];
  primaryFactions: string[];
};

const PICKER_SIZE = 6;
const DEFAULT_SYSTEM: GameSystemKey = "warhammer-40k";

/**
 * "Every traveler carries a banner." A quick, real picker drawn from the
 * same Hall of Banners data as Find Your Banner — scoped to the active
 * realm when one is set. Travelers can march under more than one banner;
 * picking any of them updates the active universe/realm/game (same real
 * decision Find Your Banner makes), and the full set travels into the final
 * passport save. Skippable: no banner is required to enter The Lexicon.
 */
export default function ChooseBannerStep({
  onContinue,
  onSkip,
}: {
  onContinue: (selection: BannerSelection) => void;
  onSkip: () => void;
}) {
  const { realmKey, gameKey, setGame } = useActiveUniverse();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { banners: contextBanners } = useMemo(
    () => filterBannersForActiveContext(BANNERS, { realmKey, gameKey }),
    [realmKey, gameKey]
  );

  // Which game systems actually have banners in the active context — used
  // to offer "looking for more than 40K?" only when there's somewhere else
  // to send them. Defaults to Warhammer 40,000 when it's on offer; falls
  // back to whichever system appears first otherwise (e.g. a realm already
  // scoped to something else).
  const availableSystems = useMemo(() => {
    const seen = new Set<GameSystemKey>();
    const ordered: GameSystemKey[] = [];
    for (const banner of contextBanners) {
      if (!seen.has(banner.gameSystemKey)) {
        seen.add(banner.gameSystemKey);
        ordered.push(banner.gameSystemKey);
      }
    }
    return ordered;
  }, [contextBanners]);

  const [selectedSystem, setSelectedSystem] = useState<GameSystemKey | null>(
    null
  );
  const activeSystem =
    selectedSystem ??
    (availableSystems.includes(DEFAULT_SYSTEM)
      ? DEFAULT_SYSTEM
      : availableSystems[0] ?? DEFAULT_SYSTEM);

  const picks = useMemo(
    () =>
      contextBanners
        .filter((banner) => banner.gameSystemKey === activeSystem)
        .slice(0, PICKER_SIZE),
    [contextBanners, activeSystem]
  );

  const selected: Banner[] = useMemo(
    () =>
      selectedIds
        .map((id) => BANNERS.find((b) => b.id === id))
        .filter((b): b is Banner => Boolean(b)),
    [selectedIds]
  );

  function choose(banner: Banner) {
    setSelectedIds((current) =>
      current.includes(banner.id)
        ? current.filter((id) => id !== banner.id)
        : [...current, banner.id]
    );
    if (isGameKey(banner.gameSystemKey)) setGame(banner.gameSystemKey);
  }

  function continueOnward() {
    const first = selected[0];
    onContinue({
      bannerId: first?.id ?? null,
      bannerName: first?.name ?? null,
      gameSystem: first?.gameSystem ?? null,
      primaryFaction: first?.primaryFaction ?? null,
      bannerIds: selected.map((b) => b.id),
      gameSystems: [...new Set(selected.map((b) => b.gameSystem).filter((s): s is string => Boolean(s)))],
      primaryFactions: [...new Set(selected.map((b) => b.primaryFaction))],
    });
  }

  const continueLabel =
    selected.length === 0
      ? "Continue"
      : selected.length === 1
        ? `March under ${selected[0].name}`
        : `March under ${selected.length} banners`;

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
          Pick as many banners as call to you, or leave this for later.
        </p>

        <div className="mt-8">
          <SectionRule label={`A few callings — ${GAME_SYSTEMS[activeSystem].name}`} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {picks.map((banner) => {
              const isSelected = selectedIds.includes(banner.id);
              return (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => choose(banner)}
                  aria-pressed={isSelected}
                  className={`card relative overflow-hidden text-left transition-colors ${
                    isSelected ? "border-gold-400" : ""
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[0.65rem] font-bold text-ink-950">
                      ✓
                    </span>
                  )}
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

          {availableSystems.length > 1 && (
            <p className="mt-4 text-xs text-text-subtle">
              Looking for more than {GAME_SYSTEMS[activeSystem].name}?{" "}
              {availableSystems
                .filter((system) => system !== activeSystem)
                .map((system, i, arr) => (
                  <span key={system}>
                    <button
                      type="button"
                      onClick={() => setSelectedSystem(system)}
                      className="font-medium text-gold-300 underline-offset-2 transition-colors hover:text-gold-200 hover:underline"
                    >
                      Browse {GAME_SYSTEMS[system].name}
                    </button>
                    {i < arr.length - 1 ? " · " : ""}
                  </span>
                ))}
            </p>
          )}

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
            {continueLabel}
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
