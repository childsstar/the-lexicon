"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const destinations = [
  { href: "/armies", label: "My Armies", exact: true },
  { href: "/armies/matchups", label: "Matchups", exact: false },
] as const;

export default function ArmiesSectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Armies sections" className="mb-6">
      <div className="inline-flex w-full rounded-lg border border-border bg-surface p-1 sm:w-auto">
        {destinations.map((destination) => {
          const active = destination.exact
            ? pathname === destination.href
            : pathname === destination.href || pathname.startsWith(`${destination.href}/`);

          return (
            <Link
              key={destination.href}
              href={destination.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-none ${
                active
                  ? "border border-gold-600/50 bg-surface-raised text-gold-300 shadow-sm"
                  : "border border-transparent text-text-muted hover:bg-surface-raised/60 hover:text-text"
              }`}
            >
              {destination.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
