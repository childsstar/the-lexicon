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
