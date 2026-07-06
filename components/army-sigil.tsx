import type { VisualIdentity } from "@/lib/armies/visual-identity";
import {
  BellIcon,
  SkullIcon,
  HaloIcon,
  ChaliceIcon,
  DropIcon,
  AquilaIcon,
  ClawIcon,
  EyeIcon,
  CrestIcon,
  RuneIcon,
  CrescentIcon,
  GemIcon,
  ScarabIcon,
  GearIcon,
  TuskIcon,
  StarIcon,
  ShieldIcon,
  FlagIcon,
} from "@/components/icons";

const ICONS = {
  bell: BellIcon,
  skull: SkullIcon,
  halo: HaloIcon,
  chalice: ChaliceIcon,
  drop: DropIcon,
  aquila: AquilaIcon,
  claw: ClawIcon,
  eye: EyeIcon,
  crest: CrestIcon,
  rune: RuneIcon,
  crescent: CrescentIcon,
  gem: GemIcon,
  scarab: ScarabIcon,
  gear: GearIcon,
  tusk: TuskIcon,
  star: StarIcon,
  shield: ShieldIcon,
  flag: FlagIcon,
} as const;

const ACCENT_CLASSES = {
  gold: "text-gold-400 border-gold-500/50",
  ember: "text-ember-400 border-ember-500/50",
  parchment: "text-parchment-300 border-parchment-500/60",
  bone: "text-text-muted border-border-strong",
} as const;

const TEXTURE_CLASSES = {
  "gilded-grain": "bg-gradient-to-br from-gold-500/25 via-transparent to-gold-900/10",
  "corroded-metal": "bg-gradient-to-br from-ember-900/25 via-transparent to-ink-700/30",
  "chitin-plate": "bg-gradient-to-br from-ink-700/40 via-transparent to-ember-900/10",
  "crystalline-facet": "bg-gradient-to-br from-parchment-300/20 via-transparent to-gold-500/10",
  "parchment-weave": "bg-gradient-to-br from-parchment-500/20 via-transparent to-parchment-700/10",
} as const;

const FRAME_CLASSES = {
  engraved: "rounded-xl border-2",
  aquila: "rounded-full border-2",
  crystal: "rounded-md border-2 rotate-45",
  corroded: "rounded-md border-2 border-dashed",
} as const;

const SIZE_CLASSES = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

const ICON_SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
} as const;

export default function ArmySigil({
  identity,
  size = "md",
  className = "",
}: {
  identity: VisualIdentity | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!identity) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-subtle ${SIZE_CLASSES[size]} ${className}`}
        aria-hidden
      >
        <ShieldIcon className={ICON_SIZE_CLASSES[size]} />
      </div>
    );
  }

  const Icon = ICONS[identity.icon] ?? ShieldIcon;
  const frameClass = FRAME_CLASSES[identity.frame];
  const isRotatedFrame = identity.frame === "crystal";

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]} ${className}`}
      title={identity.motif}
      role="img"
      aria-label={`${identity.motif} sigil`}
    >
      <div
        className={`flex h-full w-full items-center justify-center ${frameClass} ${ACCENT_CLASSES[identity.accent]} ${TEXTURE_CLASSES[identity.texture]}`}
      >
        <Icon className={`${ICON_SIZE_CLASSES[size]} ${isRotatedFrame ? "-rotate-45" : ""}`} />
      </div>
    </div>
  );
}
