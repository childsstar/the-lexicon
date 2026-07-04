"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  Banner,
  ChronicleQuiz,
  ChronicleResult,
} from "@/lib/chronicle/types";
import {
  decodeAnswers,
  encodeAnswers,
  rankBanners,
  scoreAnswers,
} from "@/lib/chronicle/engine";
import type { ChronicleEntry } from "@/lib/chronicle";
import BannerArt from "@/components/chronicle/banner-art";
import { ArrowLeftIcon, LexiconMark } from "@/components/icons";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const CEREMONY_LINE_MS = 1100;

type Stage = "intro" | "questions" | "ceremony" | "results";

export default function ChronicleExperience({
  entry,
}: {
  entry: Pick<ChronicleEntry, "quiz" | "banners">;
}) {
  const { quiz, banners } = entry;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [ceremonyLine, setCeremonyLine] = useState(0);
  const [result, setResult] = useState<ChronicleResult | null>(null);
  const [ranked, setRanked] = useState<Banner[]>([]);
  const [exploreIndex, setExploreIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  const question = quiz.questions[answers.length];

  // Ask the server for a Claude-personalized reading (the API key lives
  // behind /api/chronicle). The ceremony covers the latency, and any
  // failure falls back to the deterministic client-side template so the
  // reveal never breaks.
  const generateFor = useCallback(
    (finalAnswers: number[], rotation: number) => {
      const scores = scoreAnswers(quiz, finalAnswers);
      const baseRanked = rankBanners(scores, banners);
      setRanked(baseRanked);

      const fallback = () => {
        const rotated = [
          ...baseRanked.slice(rotation),
          ...baseRanked.slice(0, rotation),
        ];
        import("@/lib/chronicle/generate").then(({ TemplateResultGenerator }) =>
          new TemplateResultGenerator()
            .generate({ quiz, answers: finalAnswers, scores, ranked: rotated })
            .then(setResult)
        );
      };

      fetch("/api/chronicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: quiz.slug,
          answers: finalAnswers,
          rotation,
        }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => setResult(data.result))
        .catch(fallback);
    },
    [quiz, banners]
  );

  // A shared/revisited link (?a=…) skips straight to a short ceremony.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const fromUrl = decodeAnswers(searchParams.get("a"), quiz);
    if (fromUrl) {
      setAnswers(fromUrl);
      beginCeremony(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginCeremony(finalAnswers: number[]) {
    setStage("ceremony");
    setCeremonyLine(0);
    generateFor(finalAnswers, 0);
    setExploreIndex(0);
  }

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
  }, [stage, ceremonyLine, quiz.ceremony.length, answers, router]);

  function choose(optionIndex: number) {
    if (picked !== null) return;
    setPicked(optionIndex);
    setTimeout(() => {
      const next = [...answers, optionIndex];
      setPicked(null);
      setAnswers(next);
      if (next.length === quiz.questions.length) beginCeremony(next);
    }, 260);
  }

  function goBack() {
    if (answers.length === 0) setStage("intro");
    else setAnswers(answers.slice(0, -1));
  }

  function retake() {
    setAnswers([]);
    setResult(null);
    setExploreIndex(0);
    setStage("intro");
    router.replace(quiz.slug ? `/chronicles/${quiz.slug}` : "?", {
      scroll: false,
    });
    window.scrollTo({ top: 0 });
  }

  function exploreAnother() {
    const next = (exploreIndex + 1) % Math.min(3, ranked.length);
    setExploreIndex(next);
    setResult(null);
    generateFor(answers, next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function share() {
    const url = `${window.location.origin}/chronicles/${quiz.slug}?a=${encodeAnswers(answers)}`;
    const banner = ranked[exploreIndex];
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${banner.name} — The Lexicon`,
          text: `${quiz.title} called me to ${banner.primaryFaction}. Find yours:`,
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
            A Chronicle of the Lexicon
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-parchment-100 animate-rise sm:text-5xl">
            {quiz.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-parchment-500">
            {quiz.tagline}
          </p>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-parchment-500">
            {quiz.invocation}
          </p>
          <button
            onClick={() => setStage("questions")}
            className="mt-10 w-full max-w-xs rounded-md bg-gold-500 px-8 py-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            Begin
          </button>
          <p className="mt-4 text-xs text-parchment-700">
            No account needed · about three minutes
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
                <span className="text-parchment-700">
                  of {ROMAN[quiz.questions.length - 1]}
                </span>
              </p>
            </div>
            <div className="mt-2 h-px w-full bg-ink-700">
              <div
                className="h-px bg-gold-500 transition-all duration-500"
                style={{
                  width: `${(n / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div key={n} className="animate-rise">
            <h1 className="font-display text-2xl font-semibold leading-snug text-parchment-100 sm:text-3xl">
              {question.prompt}
            </h1>
            {question.followUp && (
              <p className="mt-2 text-sm text-parchment-500">
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
                      : "text-parchment-300"
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
  if (stage === "ceremony" || !result) {
    const line =
      quiz.ceremony[Math.min(ceremonyLine, quiz.ceremony.length - 1)];
    return (
      <Frame>
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <LexiconMark className="h-14 w-14 animate-breathe text-gold-400" />
          <p
            key={line}
            className="mt-10 max-w-xs font-display text-xl leading-relaxed text-parchment-300 animate-fade-slow"
          >
            {line}
          </p>
        </div>
      </Frame>
    );
  }

  // ---------------------------------------------------------- results
  const banner = ranked[exploreIndex];
  return (
    <Frame backHref="/" backLabel="The Lexicon">
      <div className="pb-16 pt-4">
        {/* Layout doubles as the future shareable Chronicle Card:
            artwork → recommendation → quote → thelexicon.games. */}
        <div className="animate-reveal">
          <BannerArt
            palette={banner.palette}
            className="flex min-h-[46vh] flex-col items-center justify-end rounded-xl border border-ink-700 p-8 text-center"
          >
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-parchment-300/90">
                A banner has answered your call
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-white drop-shadow-lg sm:text-5xl">
                {banner.name}
              </h1>
              <p className="mt-3 text-sm font-medium tracking-wide text-parchment-300/90">
                {result.primaryFaction} · {result.gameSystem}
              </p>
            </div>
          </BannerArt>
          <p className="mt-2 text-center text-[0.65rem] italic tracking-wide text-parchment-700">
            Plate {ROMAN[exploreIndex]} — “{result.imagePrompt.split(",")[0]}”
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md space-y-8">
          <p className="border-l-2 border-gold-600/60 pl-4 font-display text-lg italic leading-relaxed text-parchment-300">
            {result.chronicleIntro}
          </p>

          <div>
            <SectionRule label="What the pages saw" />
            <p className="text-sm leading-relaxed text-parchment-500">
              {result.personalitySummary}
            </p>
          </div>

          <div>
            <SectionRule label="Why this banner" />
            <p className="text-sm leading-relaxed text-parchment-500">
              {result.reasoning}
            </p>
          </div>

          <div className="card grid grid-cols-2 divide-x divide-ink-800">
            <div className="p-5 text-center">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-parchment-700">
                Game system
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold text-parchment-100">
                {result.gameSystem}
              </p>
            </div>
            <div className="p-5 text-center">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-parchment-700">
                Faction
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold text-gold-300">
                {result.primaryFaction}
              </p>
            </div>
          </div>

          <div>
            <SectionRule label="Two banners that also stirred" />
            <div className="space-y-3">
              {result.alternateFactions.map((alt) => (
                <div key={alt.bannerName} className="card p-4">
                  <p className="font-display text-base font-semibold text-parchment-100">
                    {alt.bannerName}
                  </p>
                  <p className="text-xs text-parchment-500">
                    {alt.faction} · {alt.gameSystem}
                  </p>
                  <p className="mt-1.5 text-xs italic text-parchment-700">
                    {alt.whisper}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/sign-up"
              className="block rounded-md bg-gold-500 px-6 py-3.5 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
            >
              Begin Your Chronicle
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={exploreAnother}
                className="rounded-md border border-gold-600 px-4 py-3 text-sm font-medium text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
              >
                Explore another banner
              </button>
              <button
                onClick={share}
                className="rounded-md border border-ink-600 px-4 py-3 text-sm font-medium text-parchment-300 transition-colors hover:border-gold-600 hover:text-gold-300"
              >
                {copied ? "Link copied ✦" : "Share this banner"}
              </button>
            </div>
            <button
              onClick={retake}
              className="w-full py-2 text-center text-xs font-medium uppercase tracking-widest text-parchment-700 transition-colors hover:text-parchment-300"
            >
              Retake the chronicle
            </button>
          </div>

          <p className="pt-4 text-center text-[0.65rem] tracking-widest text-parchment-700">
            THELEXICON.GAMES
          </p>
        </div>
      </div>
    </Frame>
  );
}

function Frame({
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
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-parchment-700 transition-colors hover:text-gold-300"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            {backLabel}
          </button>
        ) : backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-parchment-700 transition-colors hover:text-gold-300"
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

function SectionRule({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
        {label}
      </p>
      <div className="gilded-rule mt-2" />
    </div>
  );
}
