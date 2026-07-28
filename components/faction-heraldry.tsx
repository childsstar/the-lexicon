import BannerArt from "@/components/chronicle/banner-art";
import { ShieldIcon } from "@/components/icons";
import { resolveFactionHeraldry } from "@/lib/chronicle/faction-heraldry";

// The single faction mark used everywhere armies appear — cards, matchup
// lists, pickers, overview panels. The artwork inside the diamond frame is
// the faction's Hall of Banners plate (via BannerArt, which already layers
// raster art → SVG plate → palette gradient), so faction identity is
// consistent with the Hall and future banner upgrades land everywhere at
// once. Factions without a banner get a neutral shield placeholder in the
// same frame.

const SIZE_CLASSES = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

const PLACEHOLDER_ICON_CLASSES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
} as const;

export default function FactionHeraldry({
  faction,
  size = "md",
  className = "",
}: {
  faction: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const banner = resolveFactionHeraldry(faction);

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]} ${className}`}
      title={banner ? `${banner.primaryFaction} — ${banner.name}` : undefined}
      role="img"
      aria-label={banner ? `${banner.primaryFaction} heraldry` : "Faction heraldry"}
    >
      {/* Diamond frame: a square rotated 45° and sized to 71% (1/√2) of the
          bounding box, so every mark keeps the exact footprint the old sigil
          had and rows/cards don't change height. */}
      <div
        className={`flex h-[71%] w-[71%] rotate-45 items-center justify-center overflow-hidden rounded-md border-2 ${
          banner ? "border-gold-500/50" : "border-border-strong bg-surface text-text-subtle"
        }`}
      >
        {banner ? (
          // Counter-rotate the plate and over-scale it (1.5 > √2) so the
          // artwork stays upright and covers the diamond corner to corner.
          <BannerArt
            palette={banner.palette}
            bannerId={banner.id}
            className="h-full w-full -rotate-45 scale-150"
          />
        ) : (
          <ShieldIcon className={`-rotate-45 ${PLACEHOLDER_ICON_CLASSES[size]}`} />
        )}
      </div>
    </div>
  );
}
