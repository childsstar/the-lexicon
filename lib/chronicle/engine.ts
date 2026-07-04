import type {
  Banner,
  ChronicleQuiz,
  TraitId,
  TraitScores,
} from "./types";
import { accumulateScores } from "../quiz-engine";

// Answer-token codecs live in the shared quiz engine; re-exported here so
// chronicle consumers keep a single import site.
export { encodeAnswers, decodeAnswers } from "../quiz-engine";

export const EMPTY_SCORES: TraitScores = {
  valor: 0,
  discipline: 0,
  cunning: 0,
  wonder: 0,
  endurance: 0,
  wildness: 0,
};

/** Accumulate trait scores from a completed answer sheet. */
export function scoreAnswers(
  quiz: ChronicleQuiz,
  answers: number[]
): TraitScores {
  return accumulateScores(
    quiz.questions.map((question, i) => question.options[answers[i]]?.traits),
    EMPTY_SCORES
  );
}

/** Rank banners by affinity: normalized dot product between the player's
 * trait vector and each banner's profile. Deterministic — same answers,
 * same banner — with stable tie-breaking so results are shareable. */
export function rankBanners(
  scores: TraitScores,
  banners: Banner[]
): Banner[] {
  const scored = banners.map((banner, index) => {
    let dot = 0;
    let magnitude = 0;
    for (const [trait, weight] of Object.entries(banner.profile)) {
      dot += scores[trait as TraitId] * (weight ?? 0);
      magnitude += (weight ?? 0) ** 2;
    }
    return { banner, index, affinity: dot / Math.sqrt(magnitude || 1) };
  });
  return scored
    .sort((a, b) => b.affinity - a.affinity || a.index - b.index)
    .map((s) => s.banner);
}

/** Dominant traits, strongest first — used to personalize the summary. */
export function topTraits(scores: TraitScores, count = 2): TraitId[] {
  return (Object.entries(scores) as [TraitId, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([trait]) => trait);
}
