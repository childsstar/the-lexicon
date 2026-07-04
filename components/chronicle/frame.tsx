"use client";

import Link from "next/link";
import { ArrowLeftIcon, LexiconMark } from "@/components/icons";

// Shared chrome for full-screen Lexicon experiences (Find Your Banner,
// Find Your World, and the chronicles to come).

export function Frame({
  children,
  backHref,
  backLabel,
  onBack,
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5">
      <header className="flex h-14 items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-text-subtle transition-colors hover:text-gold-300"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            {backLabel}
          </button>
        ) : backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-text-subtle transition-colors hover:text-gold-300"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        ) : (
          <span />
        )}
        <LexiconMark className="h-5 w-5 text-gold-600" />
      </header>
      {children}
    </div>
  );
}

export function SectionRule({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
        {label}
      </p>
      <div className="gilded-rule mt-2" />
    </div>
  );
}
