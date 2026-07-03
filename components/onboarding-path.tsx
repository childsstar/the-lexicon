import Link from "next/link";
import { ArrowLeftIcon, LexiconMark } from "@/components/icons";

export type OnboardingStep = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

export default function OnboardingPath({
  eyebrow,
  title,
  intro,
  steps,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  steps: OnboardingStep[];
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-16">
      <header className="flex h-16 items-center justify-between">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-parchment-700 transition-colors hover:text-gold-300"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Choose a path
        </Link>
        <LexiconMark className="h-6 w-6 text-gold-500" />
      </header>

      <div className="pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-parchment-100">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-parchment-500">
          {intro}
        </p>
      </div>

      <ol className="mt-8 space-y-3">
        {steps.map((step, i) => (
          <li key={step.title} className="card flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-600/50 bg-ink-850 text-gold-400">
              {step.icon}
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-parchment-700">
                Step {i + 1}
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-parchment-100">
                {step.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-parchment-500">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href="/dashboard"
        className="mt-8 rounded-md bg-gold-500 px-6 py-3.5 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
      >
        Enter your Lexicon
      </Link>
      <p className="mt-3 text-center text-xs text-parchment-700">
        Guided onboarding is coming soon — for now, step inside and look
        around.
      </p>
    </div>
  );
}
