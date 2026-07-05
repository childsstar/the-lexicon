"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FIND_YOUR_WORLD,
  recommendWorlds,
  type WorldRecommendation,
} from "@/lib/world-quiz";
import {
  GAME_SYSTEMS_PARAM,
  encodeGameSystemKeys,
} from "@/lib/game-systems";
import { isGameKey } from "@/lib/games";
import { REALMS } from "@/lib/realms";
import { useActiveUniverse } from "@/components/active-universe-provider";
import { decodeAnswers, encodeAnswers } from "@/lib/quiz-engine";
import { Frame, SectionRule } from "@/components/chronicle/frame";
import { LexiconMark } from "@/components/icons";

// Find Your World — the optional travel-guide stop before Find Your Banner.
// Fully deterministic and client-side: the recommendation is pure
// configuration + weighted scoring, and the whole result is recoverable
// from the ?a= answer token, so it can be shared, revisited, and consumed
// by future passport features.

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const CEREMONY_LINE_MS = 1100;

type Stage = "intro" | "questions" | "ceremony" | "results";

const quiz = FIND_YOUR_WORLD;

export default function WorldExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { realmKey: activeRealmKey, setGame } = useActiveUniverse();

  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [ceremonyLine, setCeremonyLine] = useState(0);
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  const question = quiz.questions[answers.length];

  // The active realm is a soft weighting signal here — it nudges ranking
  // toward systems already in that realm without ever excluding a
  // cross-realm (or non-Warhammer) recommendation. See lib/world-quiz.ts.
  const recommendation: WorldRecommendation | null = useMemo(
    () =>
      answers.length === quiz.questions.length
        ? recommendWorlds(answers, { preferredRealmKey: activeRealmKey })
        : null,
    [answers, activeRealmKey]
  );

  // A finished quiz is a real decision — update the active realm/game to
  // match the recommendation, same as Find Your Banner
  // (chronicle-experience.tsx). If the primary world isn't mapped to a
  // canonical game yet (most of the hobby isn't, by MVP design — see the
  // audit doc), the active context is left untouched, never silently reset.
  useEffect(() => {
    if (stage !== "results" || !recommendation) return;
    if (isGameKey(recommendation.primary.key)) {
      setGame(recommendation.primary.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, recommendation]);

  // A shared/revisited link (?a=…) skips straight to a short ceremony.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const fromUrl = decodeAnswers(searchParams.get("a"), quiz);
    if (fromUrl) {
      setAnswers(fromUrl);
      setStage("ceremony");
      setCeremonyLine(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance ceremony lines, then reveal.
  useEffect(() => {
    if (stage !== "ceremony") return;
    if (ceremonyLine >= quiz.ceremony.length) {
      const t = setTimeout(() => {
        setStage("results");
        router.replace(`?a=${encodeAnswers(answers)}`, { scroll: false });
        window.scrollTo({ top: 0 });
      }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCeremonyLine((l) => l + 1), CEREMONY_LINE_MS);
    return () => clearTimeout(t);
  }, [stage, ceremonyLine, answers, router]);

  function choose(optionIndex: number) {
    if (picked !== null) return;
    setPicked(optionIndex);
    setTimeout(() => {
      const next = [...answers, optionIndex];
      setPicked(null);
      setAnswers(next);
      if (next.length === quiz.questions.length) {
        setStage("ceremony");
        setCeremonyLine(0);
      }
    }, 260);
  }

  function goBack() {
    if (answers.length === 0) setStage("intro");
    else setAnswers(answers.slice(0, -1));
  }

  function retake() {
    setAnswers([]);
    setStage("intro");
    router.replace(`/chronicles/${quiz.slug}`, { scroll: false });
    window.scrollTo({ top: 0 });
  }

  async function share() {
    const url = `${window.location.origin}/chronicles/${quiz.slug}?a=${encodeAnswers(answers)}`;
    const primary = recommendation?.primary;
    try {
      if (navigator.share && primary) {
        await navigator.share({
          title: `${primary.name} — The Lexicon`,
          text: `${quiz.title} charted my course to ${primary.name}. Find yours:`,
          url,
        });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ------------------------------------------------------------ intro
  if (stage === "intro") {
    return (
      <Frame backHref="/" backLabel="The Lexicon">
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <LexiconMark className="h-12 w-12 animate-breathe text-gold-400" />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-gold-500 animate-rise">
            The Lexicon Travel Guide
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-text animate-rise sm:text-5xl">
            {quiz.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-text-muted">
            {quiz.tagline}
          </p>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-text-muted">
            {quiz.invocation}
          </p>
          {activeRealmKey && (
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-text-subtle">
              Currently exploring{" "}
              <span className="text-gold-400">
                {REALMS[activeRealmKey].name}
              </span>{" "}
              — your answers still range across every world.
            </p>
          )}
          <button
            onClick={() => setStage("questions")}
            className="mt-10 w-full max-w-xs rounded-md bg-gold-500 px-8 py-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            Discover My World
          </button>
          <Link
            href="/chronicles/find-your-banner"
            className="mt-3 w-full max-w-xs rounded-md border border-border-strong px-8 py-3.5 text-sm font-medium text-text-soft transition-colors hover:border-gold-600 hover:text-gold-300"
          >
            Skip — take me to Find Your Banner
          </Link>
          <p className="mt-4 text-xs text-text-subtle">
            No account needed · about two minutes
          </p>
        </div>
      </Frame>
    );
  }

  // -------------------------------------------------------- questions
  if (stage === "questions" && question) {
    const n = answers.length;
    return (
      <Frame onBack={goBack} backLabel={n === 0 ? "Begin again" : "Back"}>
        <div className="flex flex-1 flex-col justify-center py-10">
          {/* progress */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-sm tracking-[0.2em] text-gold-500">
                {ROMAN[n]}{" "}
                <span className="text-text-subtle">
                  of {ROMAN[quiz.questions.length - 1]}
                </span>
              </p>
            </div>
            <div className="mt-2 h-px w-full bg-border">
              <div
                className="h-px bg-gold-500 transition-all duration-500"
                style={{ width: `${(n / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div key={n} className="animate-rise">
            <h1 className="font-display text-2xl font-semibold leading-snug text-text sm:text-3xl">
              {question.prompt}
            </h1>
            {question.followUp && (
              <p className="mt-2 text-sm text-text-muted">
                {question.followUp}
              </p>
            )}

            <div className="mt-8 space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={option.label}
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  className={`card card-interactive w-full p-5 text-left text-sm leading-relaxed transition-colors ${
                    picked === i
                      ? "border-gold-400 bg-gold-500/10 text-gold-200"
                      : "text-text-soft"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  // --------------------------------------------------------- ceremony
  if (stage === "ceremony" || !recommendation) {
    const line =
      quiz.ceremony[Math.min(ceremonyLine, quiz.ceremony.length - 1)];
    return (
      <Frame>
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <LexiconMark className="h-14 w-14 animate-breathe text-gold-400" />
          <p
            key={line}
            className="mt-10 max-w-xs font-display text-xl leading-relaxed text-text-soft animate-fade-slow"
          >
            {line}
          </p>
        </div>
      </Frame>
    );
  }

  // ---------------------------------------------------------- results
  const { primary, confidence, alsoConsider, recommendedKeys } =
    recommendation;
  const continueHref = `/chronicles/find-your-banner?${GAME_SYSTEMS_PARAM}=${encodeGameSystemKeys(recommendedKeys)}`;

  return (
    <Frame backHref="/" backLabel="The Lexicon">
      <div className="pb-16 pt-4">
        <div className="animate-reveal card border-gold-600/50 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
            Your passport is stamped
          </p>
          <p className="mt-6 text-sm text-text-muted">
            We think you&apos;d enjoy:
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-text sm:text-5xl">
            {primary.name}
          </h1>
          <p className="mt-3 text-sm font-medium tracking-wide text-text-muted">
            {primary.tagline}
          </p>

          {/* confidence */}
          <div className="mx-auto mt-8 max-w-xs">
            <div className="flex items-baseline justify-between">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-text-subtle">
                Confidence
              </p>
              <p className="font-display text-lg font-semibold text-gold-300">
                {confidence}%
              </p>
            </div>
            <div className="mt-1.5 h-1 w-full rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-gold-500 transition-all duration-1000"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-md space-y-8">
          <div>
            <SectionRule label="Why this world" />
            <p className="text-sm leading-relaxed text-text-muted">
              {primary.blurb}
            </p>
            <p className="mt-2 text-xs text-text-subtle">
              Published by {primary.publisher}
            </p>
          </div>

          <div>
            <SectionRule label="Also consider" />
            <div className="space-y-3">
              {alsoConsider.map((system) => (
                <div key={system.key} className="card p-4">
                  <p className="font-display text-base font-semibold text-text">
                    {system.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    {system.tagline}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={continueHref}
              className="block rounded-md bg-gold-500 px-6 py-3.5 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
            >
              Continue to Banner Discovery
            </Link>
            <p className="text-center text-xs leading-relaxed text-text-subtle">
              Banner Discovery will favor banners from your recommended
              worlds. Prefer the full range?{" "}
              <Link
                href="/chronicles/find-your-banner"
                className="underline decoration-border-strong underline-offset-2 transition-colors hover:text-gold-300"
              >
                Take it unfiltered
              </Link>
              .
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={share}
                className="rounded-md border border-border-strong px-4 py-3 text-sm font-medium text-text-soft transition-colors hover:border-gold-600 hover:text-gold-300"
              >
                {copied ? "Link copied ✦" : "Share this world"}
              </button>
              <button
                onClick={retake}
                className="rounded-md border border-border-strong px-4 py-3 text-sm font-medium text-text-soft transition-colors hover:border-gold-600 hover:text-gold-300"
              >
                Retake the crossing
              </button>
            </div>
          </div>

          <p className="pt-4 text-center text-[0.65rem] tracking-widest text-text-subtle">
            THELEXICON.GAMES
          </p>
        </div>
      </div>
    </Frame>
  );
}
