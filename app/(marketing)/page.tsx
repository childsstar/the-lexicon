import Link from "next/link";
import { RotatingHeroPhrase } from "@/components/rotating-hero-phrase";
import {
  ShieldIcon,
  UsersIcon,
  SwordsIcon,
  FlagIcon,
  LexiconMark,
} from "@/components/icons";

const features = [
  {
    icon: ShieldIcon,
    title: "Muster armies",
    body: "Keep a living roster of every force you field — faction, game system, paint progress, and the story behind each banner.",
    href: "/armies",
  },
  {
    icon: UsersIcon,
    title: "Find community",
    body: "Connect with players near you, find your local game store or club, and never struggle to get a game on the table.",
    href: "/community",
  },
  {
    icon: SwordsIcon,
    title: "Log battles",
    body: "Record every engagement — opponents, outcomes, and the moments worth retelling. Your battle history becomes your saga.",
    href: "/battles",
  },
  {
    icon: FlagIcon,
    title: "Track campaigns",
    body: "Follow long-running narratives across multiple battles. Watch territories shift and legends grow, session by session.",
    href: "/campaigns",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5">
      {/* Header */}
      <header className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LexiconMark className="h-7 w-7 text-gold-400" />
          <span className="font-display text-xl font-semibold tracking-wide">
            The Lexicon
          </span>
        </div>
        <Link
          href="/sign-in"
          className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-text-soft transition-colors hover:border-gold-600 hover:text-gold-300"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center pb-20 pt-16 text-center sm:pt-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          The tabletop gaming community platform
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-text sm:text-6xl">
          Your <RotatingHeroPhrase /> starts here.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
          Discover your faction, muster your army, find your community, and
          record the battles that become your legend.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Link
            href="/onboarding/new"
            className="flex-1 rounded-md bg-gold-500 px-6 py-3.5 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            New to the Hobby
          </Link>
          <Link
            href="/onboarding/experienced"
            className="flex-1 rounded-md border border-gold-600 px-6 py-3.5 text-center text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
          >
            Experienced Player
          </Link>
        </div>

        {/* Two shareable front doors, side by side. Find Your World is the
            optional travel-guide stop; Find Your Banner beside it is the
            skip — so no separate skip control is needed. */}
        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {/* Find Your World — recommend game systems first */}
          <Link
            href="/chronicles/find-your-world"
            className="card card-interactive flex flex-col border-gold-600/50 p-6 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              ✦ New to tabletop gaming?
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-text">
              Find Your World
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Let us help you find your world before we help you find your
              banner. Seven quick choices chart the game systems made for you.
            </p>
          </Link>

          {/* Find Your Banner — the shareable front door */}
          <Link
            href="/chronicles/find-your-banner"
            className="card card-interactive flex flex-col border-gold-600/50 p-6 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              ✦ Begin your chronicle
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-text">
              Find Your Banner
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Eight choices. One calling. Discover which banner — and which
              game — answers. No account needed.
            </p>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="pb-24">
        <div className="gilded-rule mb-10" />
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="card card-interactive block p-6"
              >
                <Icon className="mb-4 h-7 w-7 text-gold-500" />
                <h2 className="font-display text-xl font-semibold text-text">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {feature.body}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
