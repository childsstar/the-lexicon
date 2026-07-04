// Placeholder "artwork": layered gradients from the banner's palette plus a
// grain texture, standing in until AI-generated plates exist (see
// buildImagePrompt in lib/chronicle/generate.ts). Swapping in real art
// later means replacing this component's background with an <Image>.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export default function BannerArt({
  palette,
  className = "",
  children,
}: {
  palette: [string, string, string];
  className?: string;
  children?: React.ReactNode;
}) {
  const [deep, mid, glow] = palette;
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
