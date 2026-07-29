"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const destinations = [
  { href: "/armies", label: "My Armies", matches: (path: string) => path === "/armies" },
  { href: "/armies/matchups", label: "Matchups", matches: (path: string) => path.startsWith("/armies/matchups") },
] as const;

/** Route navigation shared by the two destinations within the Armies section. */
export default function ArmiesSectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Armies sections" className="mb-5">
      <div className="inline-flex w-full rounded-lg border border-border bg-surface/60 p-1 sm:w-auto">
        {destinations.map((destination) => {
          const active = destination.matches(pathname);
          return (
            <Link
              key={destination.href}
              href={destination.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 sm:min-w-32 ${
                active
                  ? "bg-gold-500 text-ink-950 shadow-sm"
                  : "text-text-muted hover:bg-surface-raised hover:text-text"
              }`}
            >
              {destination.label}
              {active && <span className="sr-only"> (current)</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
