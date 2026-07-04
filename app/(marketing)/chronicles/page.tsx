import Link from "next/link";
import type { Metadata } from "next";
import { listChronicles } from "@/lib/chronicle";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  LexiconMark,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Chronicles",
  description:
    "Interactive chronicles from The Lexicon — discover your banner, your command style, and the campaigns you were made for.",
};

// Planted flags for the family of chronicles to come.
const COMING_SOON = [
  "What Kind of Commander Are You?",
  "Which Campaign Should You Lead?",
  "Which Battlefield Fits Your Style?",
];

export default function ChroniclesPage() {
  const chronicles = listChronicles();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-16">
      <header className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-parchment-700 transition-colors hover:text-gold-300"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Home
        </Link>
        <LexiconMark className="h-6 w-6 text-gold-500" />
      </header>

      <div className="pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          The Lexicon
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-parchment-100">
          Chronicles
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-parchment-500">
          Short, story-shaped experiences from the Lexicon&apos;s pages. No
          account needed — just honest answers.
        </p>
        <div className="gilded-rule mt-4" />
      </div>

      <div className="mt-8 space-y-3">
        {chronicles.map((entry) => (
          <Link
            key={entry.quiz.slug}
            href={`/chronicles/${entry.quiz.slug}`}
            className="card card-interactive flex items-center gap-4 p-6"
          >
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold text-parchment-100">
                {entry.quiz.title}
              </h2>
              <p className="mt-1 text-sm text-parchment-500">
                {entry.quiz.tagline}
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-parchment-700" />
          </Link>
        ))}

        {COMING_SOON.map((title) => (
          <div key={title} className="card p-6 opacity-60">
            <h2 className="font-display text-lg font-semibold text-parchment-500">
              {title}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-parchment-700">
              A future chronicle
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
