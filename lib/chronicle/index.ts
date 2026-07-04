import type { Banner, ChronicleQuiz, ResultGenerator } from "./types";
import { BANNERS } from "./banners";
import { FIND_YOUR_BANNER } from "./quizzes/find-your-banner";
import { TemplateResultGenerator } from "./generate";

// The Chronicle registry. Every entry becomes a public experience at
// /chronicles/<slug> — adding a new chronicle is: write a quiz file (and an
// outcome set if it has one), register it here, done.
//
// Planned family: What Kind of Commander Are You?, Which Campaign Should
// You Lead?, Which Battlefield Fits Your Style?, The Veteran's Chronicle…

export type ChronicleEntry = {
  quiz: ChronicleQuiz;
  banners: Banner[];
  // TODO(ai): swap per-chronicle for an LLM-backed ResultGenerator.
  generator: ResultGenerator;
};

const REGISTRY = new Map<string, ChronicleEntry>([
  [
    FIND_YOUR_BANNER.slug,
    {
      quiz: FIND_YOUR_BANNER,
      banners: BANNERS,
      generator: new TemplateResultGenerator(),
    },
  ],
]);

export function getChronicle(slug: string): ChronicleEntry | undefined {
  return REGISTRY.get(slug);
}

export function listChronicles(): ChronicleEntry[] {
  return [...REGISTRY.values()];
}
