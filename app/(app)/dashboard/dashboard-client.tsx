"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { isProfileEnriched } from "@/lib/profiles";
import {
  UserIcon,
  ShieldIcon,
  UsersIcon,
  MapPinIcon,
  SwordsIcon,
  FlagIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { EXPERIENCE_LEVELS, PLAY_STYLES } from "@/lib/types";

const sections = [
  {
    href: "/armies",
    icon: ShieldIcon,
    title: "Armies",
    body: "The forces you field, from first recruit to full muster.",
    stat: "0 armies mustered",
  },
  {
    href: "/community",
    icon: UsersIcon,
    title: "Community",
    body: "Nearby players and the connections you've made.",
    stat: "0 connections",
  },
  {
    href: "/venues",
    icon: MapPinIcon,
    title: "Venues",
    body: "Game stores, clubs, and tables where battles happen.",
    stat: "No venues saved",
  },
  {
    href: "/battles",
    icon: SwordsIcon,
    title: "Battles",
    body: "Your battle record — every clash, every outcome.",
    stat: "0 battles logged",
  },
  {
    href: "/campaigns",
    icon: FlagIcon,
    title: "Campaigns",
    body: "Long-running narratives told across many battles.",
    stat: "No active campaigns",
  },
];

function shortLabel(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const label = options.find((o) => o.value === value)?.label ?? value;
  return label.split("—")[0].trim();
}

export default function DashboardClient() {
  const { profile } = useAuth();

  const name = profile?.display_name || profile?.username || "Commander";
  const enriched = isProfileEnriched(profile);
  const experience = shortLabel(
    EXPERIENCE_LEVELS,
    profile?.experience_level
  );
  const playStyle = shortLabel(PLAY_STYLES, profile?.preferred_play_style);
  const profileTraits = [experience, playStyle].filter(Boolean).join(" · ");

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          The Lexicon
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-parchment-100">
          Welcome back, {name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-parchment-500">
          Your chronicle is open. Muster a force, find an opponent, and keep
          writing it.
        </p>
        <div className="gilded-rule mt-4" />
      </div>

      {!enriched && (
        <Link
          href="/profile/setup"
          className="card card-interactive mb-4 block border-gold-600/50 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Complete your commander profile
          </p>
          <p className="mt-1 text-sm text-parchment-500">
            Add your experience level, play style, and factions — it powers
            matchmaking and Muster recommendations to come.
          </p>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Profile — the one card backed by real data */}
        <Link
          href="/profile"
          className="card card-interactive flex items-start gap-4 p-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-600/40 bg-ink-850 text-gold-400">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-parchment-100">
              Profile
            </h2>
            <p className="mt-0.5 truncate text-sm text-parchment-500">
              {profile ? `@${profile.username}` : "Your commander identity."}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-parchment-700">
              {profileTraits || "Identity forged — add your fighting style"}
            </p>
          </div>
          <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-parchment-700" />
        </Link>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="card card-interactive flex items-start gap-4 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-gold-500">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold text-parchment-100">
                  {section.title}
                </h2>
                <p className="mt-0.5 text-sm text-parchment-500">
                  {section.body}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-parchment-700">
                  {section.stat}
                </p>
              </div>
              <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-parchment-700" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
