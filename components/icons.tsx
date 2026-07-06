import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 5.5v6c0 4.5 3 7.7 7 9.5 4-1.8 7-5 7-9.5v-6L12 3Z" />
      <path d="M12 7v6" />
      <path d="M9.5 9.5h5" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20c.5-3.5 2.8-5.5 5.5-5.5s5 2 5.5 5.5" />
      <path d="M15.5 5.2a3.25 3.25 0 1 1 1 6.3" />
      <path d="M17.5 14.6c1.8.7 2.8 2.5 3 5.4" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function SwordsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4l7.5 7.5" />
      <path d="M4 4h3.5L18 14.5" />
      <path d="M20 4h-3.5L6 14.5" />
      <path d="M20 4v3.5L12.5 15" />
      <path d="M5.5 16 8 18.5" />
      <path d="M18.5 16 16 18.5" />
      <path d="M4 20l3-3" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 21V4" />
      <path d="M5 4c2.5-1.5 5-1.5 7 0s4.5 1.5 7 0v9c-2.5 1.5-5 1.5-7 0s-4.5-1.5-7 0" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21c-3.3 0-6-2.5-6-5.8 0-2.6 1.6-4.5 3.3-6.4C10.6 7.4 11.7 6 12 3c2.5 1.7 5.5 4.8 5.5 8.5" />
      <path d="M14.8 10.5c1.9 1.6 3.2 3.1 3.2 5.1 0 3-2.5 5.4-6 5.4" />
      <path d="M12 21c-1.8 0-3.2-1.3-3.2-3 0-1.4.9-2.4 1.9-3.5.7-.8 1.2-1.6 1.3-2.8 1.5 1 3.2 2.8 3.2 4.8 0 2-1.4 3.5-3.2 3.5Z" />
    </svg>
  );
}

export function ScrollIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h11a2 2 0 0 1 2 2v2h-4" />
      <path d="M16 5v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1" />
      <path d="M8 9h4" />
      <path d="M8 13h4" />
      <path d="M8 17h3" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20.5c.7-4 3.5-6 7-6s6.3 2 7 6" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
      <path d="M9 7.5h7" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function DiceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="0.5" fill="currentColor" />
      <circle cx="15" cy="9" r="0.5" fill="currentColor" />
      <circle cx="9" cy="15" r="0.5" fill="currentColor" />
      <circle cx="15" cy="15" r="0.5" fill="currentColor" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" />
      <path d="M8 9.5h8" />
      <path d="M8 12.5h5" />
    </svg>
  );
}

// --- Army sigil motif icons -------------------------------------------
// Small, original line-art glyphs used by components/army-sigil.tsx to
// give each mustered army a lightweight visual identity. Deliberately
// abstract/geometric rather than replicating any publisher's iconography.

export function BellIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5v2" />
      <path d="M7 15c0-3.5.5-6 5-6s5 2.5 5 6l1.5 3h-13L7 15Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function SkullIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5c-4 0-6.5 2.8-6.5 6.5 0 2.3 1 3.8 2 4.9V17h9v-2.1c1-1.1 2-2.6 2-4.9 0-3.7-2.5-6.5-6.5-6.5Z" />
      <circle cx="9.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M10 17v2.5M14 17v2.5" />
      <path d="M11 13.5h2" />
    </svg>
  );
}

export function HaloIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <ellipse cx="12" cy="8" rx="6.5" ry="2.6" />
      <path d="M6.5 12c0 4 2.5 8 5.5 8s5.5-4 5.5-8" />
    </svg>
  );
}

export function ChaliceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10l-1 5a4 4 0 0 1-8 0L7 4Z" />
      <path d="M12 13v4" />
      <path d="M8.5 20.5h7" />
      <path d="M3.5 5.5c0 2.5 1.5 4 3.8 4M20.5 5.5c0 2.5-1.5 4-3.8 4" />
    </svg>
  );
}

export function DropIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c3 4 6 7.8 6 11.2A6 6 0 0 1 6 14.2C6 10.8 9 7 12 3Z" />
    </svg>
  );
}

export function AquilaIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="M12 8 3 6.5 5 11l7 1" />
      <path d="M12 8l9-1.5L19 11l-7 1" />
      <path d="M9.5 19h5" />
    </svg>
  );
}

export function ClawIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4c-1.5 3-1.5 7 1 10" />
      <path d="M11 4c-1.2 3.2-1 7.4 1.5 10.3" />
      <path d="M16 4c-.7 3.4-.2 7.6 2.5 10.6" />
      <path d="M8.5 20.5 12 15l3.5 5.5" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12c2.5-4.5 6-6.5 9-6.5s6.5 2 9 6.5c-2.5 4.5-6 6.5-9 6.5S5.5 16.5 3 12Z" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CrestIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 14 8 5l4 4 4-4 4 9" />
      <path d="M4 14h16" />
      <path d="M6 14v5.5M12 14v5.5M18 14v5.5" />
    </svg>
  );
}

export function RuneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v18" />
      <path d="M12 8 6 5M12 8l6-3" />
      <path d="M12 15 6 19M12 15l6 4" />
    </svg>
  );
}

export function CrescentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 4a8.5 8.5 0 1 0 0 16 7 7 0 0 1 0-16Z" />
      <path d="M14 10.5 20.5 4" />
    </svg>
  );
}

export function GemIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10l4 5-11 11L2.5 9 7 4Z" />
      <path d="M2.5 9h19" />
      <path d="M9 4 12 9l3-5" />
      <path d="M12 9v11" />
    </svg>
  );
}

export function ScarabIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <ellipse cx="12" cy="13" rx="5.5" ry="6.5" />
      <path d="M12 6.5V3" />
      <path d="M8 5.5 6 3.5M16 5.5l2-2" />
      <path d="M12 8v11" />
      <path d="M4.5 12 7 13M19.5 12 17 13M5 17l2.5-1M19 17l-2.5-1" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.4M12 18.1v2.4M4.6 12H7M17 12h2.4" />
      <path d="M6.3 6.3l1.7 1.7M16 16l1.7 1.7M17.7 6.3 16 8M8 16l-1.7 1.7" />
    </svg>
  );
}

export function TuskIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 4c-3 2-4 6-2.5 10.5C7.5 18 9 20 9 20" />
      <path d="M15 4c3 2 4 6 2.5 10.5C16 18 15 20 15 20" />
      <path d="M9 9.5c1.5-1 4.5-1 6 0" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 14 9l5.7.2-4.5 3.7L16.7 19 12 15.8 7.3 19l1.5-6.1-4.5-3.7L10 9 12 3.5Z" />
    </svg>
  );
}

/** The Lexicon brand mark — an open tome with a starburst. Original artwork. */
export function LexiconMark(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <path
        d="M16 7c-2.6-2-6.4-2.6-10-1.6v18.2c3.6-1 7.4-.4 10 1.6 2.6-2 6.4-2.6 10-1.6V5.4C22.4 4.4 18.6 5 16 7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M16 7v18" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M11 12.5 12 15l2.5 1-2.5 1-1 2.5-1-2.5L7.5 16l2.5-1 1-2.5Z"
        fill="currentColor"
      />
      <path d="M19.5 12.5h3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.5 16h3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.5 19.5h2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
