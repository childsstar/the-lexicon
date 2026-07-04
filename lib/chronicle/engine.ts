import type {
  Banner,
  ChronicleQuiz,
  TraitId,
  TraitScores,
} from "./types";

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
  const scores: TraitScores = { ...EMPTY_SCORES };
  quiz.questions.forEach((question, i) => {
    const option = question.options[answers[i]];
    if (!option) return;
    for (const [trait, weight] of Object.entries(option.traits)) {
      scores[trait as TraitId] += weight ?? 0;
    }
  });
  return scores;
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

/** Answers <-> compact URL token (e.g. "03121230"), so results are
 * linkable, revisitable, and — later — shareable Chronicle Cards. */
export function encodeAnswers(answers: number[]): string {
  return answers.join("");
}

export function decodeAnswers(
  token: string | null,
  quiz: ChronicleQuiz
): number[] | null {
  if (!token || !/^\d+$/.test(token)) return null;
  if (token.length !== quiz.questions.length) return null;
  const answers = token.split("").map(Number);
  const valid = answers.every(
    (a, i) => a >= 0 && a < quiz.questions[i].options.length
  );
  return valid ? answers : null;
}
