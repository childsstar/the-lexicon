import Link from "next/link";
import type { Metadata } from "next";
import {
  UserIcon,
  ShieldIcon,
  UsersIcon,
  MapPinIcon,
  SwordsIcon,
  FlagIcon,
  ChevronRightIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "Dashboard" };

const sections = [
  {
    href: "/profile",
    icon: UserIcon,
    title: "Profile",
    body: "Your commander identity, availability, and play style.",
    stat: "Profile not yet forged",
  },
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

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          The Lexicon
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-parchment-100">
          Welcome back, Commander
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-parchment-500">
          Your chronicle is empty — for now. Muster a force, find an opponent,
          and start writing it.
        </p>
        <div className="gilded-rule mt-4" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
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
