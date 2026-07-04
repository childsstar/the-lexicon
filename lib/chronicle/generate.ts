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
// Two implementations share the ResultGenerator seam:
//   * TemplateResultGenerator (below) — deterministic, runs anywhere,
//     zero-latency. Used when no ANTHROPIC_API_KEY is configured and as the
//     fallback whenever the model call fails or times out.
//   * The Claude-backed path in app/api/chronicle/route.ts — the API key
//     stays server-side; the client only ever talks to our own route.
//
// TODO(ai-images): artwork generation is still placeholder gradients —
// buildImagePrompt() below produces the art direction; generate once per
// banner (12 images), cache in Supabase Storage, and serve statically.
// Do not generate per-visitor.
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

// ---------------------------------------------------------------------------
// Claude prompt + schema (used by app/api/chronicle/route.ts)
// ---------------------------------------------------------------------------

export const CHRONICLE_SYSTEM = [
  "You are the voice of The Lexicon, an old campaign journal that matches people to a tabletop wargaming banner based on how they answered a short, imagination-first questionnaire.",
  "Tone: warm, mythic, a little playful — like an ancient book that is quietly delighted by its reader. Never clinical or analytical. Never mention the questionnaire, quiz, scores, or traits by name.",
  "Write in second person. Be specific: weave concrete details from the reader's actual choices into the prose so it feels uncannily personal.",
  "Reference no copyrighted lore, characters, or events — faction and game system names only. Image prompts must describe environments, architecture, and mood, with no characters, logos, or text.",
].join(" ");

/** Structured-outputs schema matching ChronicleResult. */
export const CHRONICLE_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "gameSystem",
    "primaryFaction",
    "alternateFactions",
    "personalitySummary",
    "reasoning",
    "chronicleIntro",
    "imagePrompt",
  ],
  properties: {
    gameSystem: { type: "string" },
    primaryFaction: { type: "string" },
    alternateFactions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["bannerName", "gameSystem", "faction", "whisper"],
        properties: {
          bannerName: { type: "string" },
          gameSystem: { type: "string" },
          faction: { type: "string" },
          whisper: { type: "string" },
        },
      },
    },
    personalitySummary: { type: "string" },
    reasoning: { type: "string" },
    chronicleIntro: { type: "string" },
    imagePrompt: { type: "string" },
  },
} as const;

export function buildResultPrompt(input: {
  quiz: ChronicleQuiz;
  answers: number[];
  scores: TraitScores;
  ranked: Banner[];
}): string {
  const { quiz, answers, scores, ranked } = input;
  const [primary, second, third] = ranked;
  const answerLines = quiz.questions
    .map((q, i) => `- "${q.prompt}" → "${q.options[answers[i]].label}"`)
    .join("\n");
  const [t1, t2] = topTraits(scores);

  return [
    `The reader answered:`,
    answerLines,
    ``,
    `Their two strongest currents: ${TRAITS[t1].name} (${TRAITS[t1].epithet}) and ${TRAITS[t2].name} (${TRAITS[t2].epithet}).`,
    ``,
    `The banner that answered: "${primary.name}" → faction "${primary.primaryFaction}" in the game system "${primary.gameSystem}".`,
    `Canonical notes on this banner, for inspiration (rewrite, don't copy):`,
    `- Personality: ${primary.personalitySummary}`,
    `- Why it fits: ${primary.reasoning}`,
    `- Chronicle opening: ${primary.chronicleIntro}`,
    `- Art direction: ${primary.imagePrompt}`,
    ``,
    `Two banners that also stirred:`,
    `1. "${second.name}" → ${second.primaryFaction} (${second.gameSystem})`,
    `2. "${third.name}" → ${third.primaryFaction} (${third.gameSystem})`,
    ``,
    `Produce the reading:`,
    `- gameSystem and primaryFaction: exactly as given above for the answering banner.`,
    `- personalitySummary: 2–3 sentences, second person, grounded in their specific answers (e.g. the path they chose, what they'd do with the artifact). This is the "how did it know?" moment — make it land.`,
    `- reasoning: 2–3 sentences on why this game system and faction fit this specific person.`,
    `- chronicleIntro: 3–4 sentences of narrative opening their story. Mythic, present tense, no analysis.`,
    `- alternateFactions: both banners above, each with a one-sentence "whisper" hinting why it also called to them.`,
    `- imagePrompt: environment and mood only, no characters, no publisher IP.`,
  ].join("\n");
}

/** Guard the model output before it reaches the UI. */
export function isValidChronicleResult(
  value: unknown
): value is ChronicleResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const strings = [
    "gameSystem",
    "primaryFaction",
    "personalitySummary",
    "reasoning",
    "chronicleIntro",
    "imagePrompt",
  ];
  if (
    !strings.every(
      (k) => typeof v[k] === "string" && (v[k] as string).trim().length > 0
    )
  ) {
    return false;
  }
  if (!Array.isArray(v.alternateFactions) || v.alternateFactions.length < 2) {
    return false;
  }
  return v.alternateFactions.every(
    (alt) =>
      typeof alt === "object" &&
      alt !== null &&
      ["bannerName", "gameSystem", "faction", "whisper"].every(
        (k) => typeof (alt as Record<string, unknown>)[k] === "string"
      )
  );
}

/** Art direction for future image generation — environments and mood only. */
export function buildImagePrompt(banner: Banner): string {
  return `${banner.imagePrompt}. Dark, elegant, atmospheric, premium fantasy illustration in muted tones with a single strong light source. Aged campaign-journal mood. No characters, no logos, no text.`;
}
