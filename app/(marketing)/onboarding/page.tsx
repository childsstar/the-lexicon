import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  SwordsIcon,
  LexiconMark,
} from "@/components/icons";

export const metadata: Metadata = { title: "Choose your path" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-16">
      <header className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-text-subtle transition-colors hover:text-gold-300"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Home
        </Link>
        <LexiconMark className="h-6 w-6 text-gold-500" />
      </header>

      <div className="pt-10 text-center">
        <h1 className="font-display text-3xl font-semibold text-text">
          Choose your path
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
          Every legend begins somewhere. Tell us where you are in the hobby and
          we&apos;ll chart the road ahead.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <Link
          href="/onboarding/new"
          className="card card-interactive flex items-center gap-4 p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-600/50 bg-surface text-gold-400">
            <CompassIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-text">
              New to the Hobby
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Find your faction, learn the lore, and muster your first army.
            </p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-text-subtle" />
        </Link>

        <Link
          href="/onboarding/experienced"
          className="card card-interactive flex items-center gap-4 p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-600/50 bg-surface text-gold-400">
            <SwordsIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-text">
              Experienced Player
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Bring your armies, find opponents, and start logging battles.
            </p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-text-subtle" />
        </Link>
      </div>
    </div>
  );
}
