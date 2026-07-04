import type {
  Banner,
  ChronicleQuiz,
  ChronicleResult,
  ResultGenerator,
  TraitScores,
} from "./types";
import { TRAITS } from "./types";
import { topTraits } from "./engine";

// ---------------------------------------------------------------------------
// Result generation.
//
// The UI only ever talks to a ResultGenerator, so swapping the templated
// implementation below for an LLM-backed one is a one-line change in
// lib/chronicle/index.ts.
//
// TODO(ai): LLM-backed generator. Sketch:
//   1. Add a route handler (app/api/chronicle/route.ts) so the API key
//      stays server-side — never call a model directly from the browser.
//   2. POST { quizSlug, answers }. Server re-runs scoreAnswers/rankBanners
//      (never trust client scores), calls Anthropic
//      (claude-sonnet-5, temperature high-ish) with buildResultPrompt(),
//      and validates the JSON against ChronicleResult before returning.
//   3. Keep TemplateResultGenerator as the fallback for timeouts/errors —
//      the ceremony animation comfortably covers ~3s of latency.
//
// TODO(ai-images): same pattern for artwork — buildImagePrompt() already
// produces the prompt; generate once per banner (12 images), cache in
// Supabase Storage, and serve statically. Do not generate per-visitor.
// ---------------------------------------------------------------------------

const WHISPERS = [
  "It called to you too, though more quietly.",
  "In another telling of your story, this one answers instead.",
];

export class TemplateResultGenerator implements ResultGenerator {
  async generate({
    scores,
    ranked,
  }: {
    quiz: ChronicleQuiz;
    answers: number[];
    scores: TraitScores;
    ranked: Banner[];
  }): Promise<ChronicleResult> {
    const [primary, second, third] = ranked;
    const [t1, t2] = topTraits(scores);

    // Personalize the banner's summary with the reader's two dominant
    // traits so different paths to the same banner read differently.
    const traitLine = `The pages mark you for ${TRAITS[t1].name.toLowerCase()} and ${TRAITS[t2].name.toLowerCase()} — ${TRAITS[t1].epithet}, and ${TRAITS[t2].epithet}.`;

    return {
      gameSystem: primary.gameSystem,
      primaryFaction: primary.primaryFaction,
      alternateFactions: [second, third].map((banner, i) => ({
        bannerName: banner.name,
        gameSystem: banner.gameSystem,
        faction: banner.primaryFaction,
        whisper: WHISPERS[i],
      })),
      personalitySummary: `${traitLine} ${primary.personalitySummary}`,
      reasoning: primary.reasoning,
      chronicleIntro: primary.chronicleIntro,
      imagePrompt: primary.imagePrompt,
    };
  }
}

/** Prompt for a future LLM-backed generator. Unused in production today;
 * kept current so wiring the model in is mostly plumbing. */
export function buildResultPrompt(input: {
  quiz: ChronicleQuiz;
  answers: number[];
  scores: TraitScores;
  ranked: Banner[];
}): string {
  const { quiz, answers, scores, ranked } = input;
  const answerLines = quiz.questions
    .map((q, i) => `- "${q.prompt}" → "${q.options[answers[i]].label}"`)
    .join("\n");

  return [
    `You are the voice of The Lexicon, an old campaign journal that matches people to a tabletop wargaming banner. Tone: warm, mythic, a little playful. Never analytical or clinical.`,
    ``,
    `The reader answered:`,
    answerLines,
    ``,
    `Trait scores: ${JSON.stringify(scores)}`,
    `Chosen banner: ${ranked[0].name} → ${ranked[0].gameSystem}, ${ranked[0].primaryFaction}`,
    `Alternates: ${ranked
      .slice(1, 3)
      .map((b) => `${b.name} (${b.gameSystem}, ${b.primaryFaction})`)
      .join("; ")}`,
    ``,
    `Write JSON matching the ChronicleResult type: gameSystem, primaryFaction, alternateFactions (2, each with bannerName/gameSystem/faction/whisper), personalitySummary (2-3 sentences, second person, specific to their answers), reasoning (why this system and faction fit), chronicleIntro (3-4 sentences of narrative, opening their story), imagePrompt (environment and mood only — no characters, no publisher IP).`,
    `Do not mention the questions or the quiz. Reference no copyrighted lore beyond faction and system names.`,
  ].join("\n");
}

/** Art direction for future image generation — environments and mood only. */
export function buildImagePrompt(banner: Banner): string {
  return `${banner.imagePrompt}. Dark, elegant, atmospheric, premium fantasy illustration in muted tones with a single strong light source. Aged campaign-journal mood. No characters, no logos, no text.`;
}
