// Banner artwork with a three-tier fallback:
//   1. AI-rendered raster plate (public/plates/<id>.webp) when one has been
//      generated — see scripts/generate-plates.mjs and raster-plates.ts
//   2. Hand-crafted animated SVG plate (components/chronicle/plates.tsx)
//   3. Layered gradient from the banner's palette (new banners ship art-less)
// Grain and vignette overlays sit on top of all three so the plates read as
// one series.

import { PLATES } from "@/components/chronicle/plates";
import { RASTER_EXT, RASTER_PLATES } from "@/lib/chronicle/raster-plates";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export default function BannerArt({
  palette,
  bannerId,
  className = "",
  children,
}: {
  palette: [string, string, string];
  bannerId?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [deep, mid, glow] = palette;
  const raster = bannerId && RASTER_PLATES.has(bannerId);
  const Plate = !raster && bannerId ? PLATES[bannerId] : undefined;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: deep,
        backgroundImage: [
          `radial-gradient(ellipse 90% 60% at 50% 110%, ${glow}33, transparent 60%)`,
          `radial-gradient(ellipse 70% 55% at 78% -8%, ${mid}cc, transparent 65%)`,
          `radial-gradient(ellipse 110% 80% at 18% 30%, ${mid}55, transparent 70%)`,
          `linear-gradient(180deg, ${deep} 0%, ${mid}44 55%, ${deep} 100%)`,
        ].join(", "),
      }}
    >
      {raster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/plates/${bannerId}.${RASTER_EXT[bannerId] ?? "webp"}`}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        Plate && <Plate className="absolute inset-0 h-full w-full" />
      )}
      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      {/* horizon glow line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-2/3 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${glow}99, transparent)`,
        }}
      />
      {/* vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 95% 85% at 50% 45%, transparent 55%, rgba(0,0,0,0.55))",
        }}
      />
      {children}
    </div>
  );
}
