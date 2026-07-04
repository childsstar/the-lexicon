"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShieldIcon,
  UsersIcon,
  SwordsIcon,
  FlagIcon,
  UserIcon,
  LexiconMark,
} from "@/components/icons";

const shellContainerClass =
  "mx-auto w-full max-w-3xl px-4 md:max-w-5xl md:px-6 xl:max-w-7xl xl:px-8";

const tabs = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/armies", label: "Armies", icon: ShieldIcon },
  { href: "/community", label: "Community", icon: UsersIcon },
  { href: "/battles", label: "Battles", icon: SwordsIcon },
  { href: "/campaigns", label: "Campaigns", icon: FlagIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh w-full flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-ink-700 bg-ink-950/90 backdrop-blur">
        <div
          className={`${shellContainerClass} flex h-14 items-center justify-between`}
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <LexiconMark className="h-6 w-6 text-gold-400" />
            <span className="font-display text-lg font-semibold tracking-wide text-parchment-100">
              The Lexicon
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive(pathname, tab.href)
                    ? "bg-ink-800 text-gold-300"
                    : "text-parchment-500 hover:text-parchment-100"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/profile"
            aria-label="Profile"
            className={`rounded-full border p-1.5 transition-colors ${
              isActive(pathname, "/profile")
                ? "border-gold-500 text-gold-300"
                : "border-ink-600 text-parchment-500 hover:border-gold-600 hover:text-parchment-100"
            }`}
          >
            <UserIcon className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Page content — bottom padding clears the mobile tab bar */}
      <main className={`${shellContainerClass} flex-1 pb-24 pt-6 sm:pb-12`}>
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-950/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium transition-colors ${
                  active ? "text-gold-300" : "text-parchment-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
