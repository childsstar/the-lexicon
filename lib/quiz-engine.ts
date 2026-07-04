// Generic weighted-quiz primitives, shared by every Lexicon quiz.
//
// A quiz is a list of questions whose options carry weight maps over some
// key space — personality traits for Find Your Banner, game systems for
// Find Your World, whatever a future quiz needs. Scoring is always the
// same: sum the chosen options' weights. Keeping that in one place means a
// new quiz is pure configuration, never new scoring code.

/** Accumulate the chosen options' weight maps onto a zeroed score record. */
export function accumulateScores<K extends string>(
  chosen: (Partial<Record<K, number>> | undefined)[],
  empty: Record<K, number>
): Record<K, number> {
  const scores = { ...empty };
  for (const weights of chosen) {
    if (!weights) continue;
    for (const [key, weight] of Object.entries(weights)) {
      scores[key as K] += (weight as number | undefined) ?? 0;
    }
  }
  return scores;
}

/** The minimum shape needed to validate an answer token against a quiz. */
export type DecodableQuiz = {
  questions: { options: readonly { label: string }[] }[];
};

/** Answers <-> compact URL token (e.g. "03121230"), so results are
 * linkable, revisitable, and — later — shareable cards. */
export function encodeAnswers(answers: number[]): string {
  return answers.join("");
}

export function decodeAnswers(
  token: string | null,
  quiz: DecodableQuiz
): number[] | null {
  if (!token || !/^\d+$/.test(token)) return null;
  if (token.length !== quiz.questions.length) return null;
  const answers = token.split("").map(Number);
  const valid = answers.every(
    (a, i) => a >= 0 && a < quiz.questions[i].options.length
  );
  return valid ? answers : null;
}
