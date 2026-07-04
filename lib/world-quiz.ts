import {
  GAME_SYSTEM_KEYS,
  GAME_SYSTEMS,
  type GameSystem,
  type GameSystemKey,
} from "./game-systems";
import { accumulateScores } from "./quiz-engine";

// Find Your World — the optional stop before Find Your Banner.
//
// A short travel-guide quiz that matches a newcomer to game systems by
// playstyle and theme, never by prior game knowledge. Every option carries
// weighted scores toward one or more systems; scoring is the shared
// accumulate-and-rank used by every Lexicon quiz. Tuning a system's pull
// is a configuration change here, nothing more.

export type WorldOption = {
  label: string;
  /** Weighted pull toward game systems (typically 1–3 per system). */
  systems: Partial<Record<GameSystemKey, number>>;
};

export type WorldQuestion = {
  prompt: string;
  followUp?: string;
  options: WorldOption[];
};

export type WorldQuiz = {
  slug: string;
  title: string;
  tagline: string;
  invocation: string;
  questions: WorldQuestion[];
  /** Lines shown during the reveal, in order. */
  ceremony: string[];
};

export const FIND_YOUR_WORLD: WorldQuiz = {
  slug: "find-your-world",
  title: "Find Your World",
  tagline: "Seven crossings. One horizon.",
  invocation:
    "New to tabletop gaming? Let us help you find your world before we help you find your banner. Answer for the games you'd love, not the games you know.",
  ceremony: [
    "The Lexicon unfolds its oldest maps…",
    "Compass needles swing toward a far horizon…",
    "A world rises to meet you.",
  ],
  questions: [
    {
      prompt: "Every world begins somewhere.",
      followUp: "Where does your imagination go first?",
      options: [
        {
          label: "Ancient realms — myth, magic, and kingdoms older than memory",
          systems: {
            "age-of-sigmar": 2,
            "the-old-world": 2,
            conquest: 2,
            "kings-of-war": 2,
            "middle-earth-sbg": 2,
            frostgrave: 2,
            warcry: 2,
          },
        },
        {
          label: "The far future — starships, empires, and war between the stars",
          systems: {
            "warhammer-40k": 2,
            "horus-heresy": 2,
            "kill-team": 2,
            infinity: 2,
            battletech: 2,
            "star-wars-legion": 2,
            "marvel-crisis-protocol": 1,
          },
        },
        {
          label: "The dark between — where wonder and horror share a border",
          systems: {
            "trench-crusade": 3,
            malifaux: 2,
            "warhammer-40k": 1,
            warcry: 1,
          },
        },
        {
          label: "The past as it truly was — real history, real grit",
          systems: { "bolt-action": 3, battletech: 1, "kings-of-war": 1 },
        },
      ],
    },
    {
      prompt: "Your forces gather.",
      followUp: "Who marches with you?",
      options: [
        {
          label: "A small band where every fighter has a name and a story",
          systems: {
            "kill-team": 2,
            warcry: 2,
            infinity: 2,
            malifaux: 2,
            frostgrave: 2,
            "marvel-crisis-protocol": 2,
            "trench-crusade": 2,
            battletech: 2,
          },
        },
        {
          label: "A grand army stretching from one table edge to the other",
          systems: {
            "warhammer-40k": 2,
            "age-of-sigmar": 2,
            "the-old-world": 2,
            conquest: 2,
            "kings-of-war": 2,
            "horus-heresy": 2,
            "star-wars-legion": 1,
            "bolt-action": 1,
          },
        },
        {
          label: "A hero and their steadfast companions",
          systems: {
            "middle-earth-sbg": 2,
            "star-wars-legion": 2,
            "marvel-crisis-protocol": 1,
            frostgrave: 1,
            warcry: 1,
          },
        },
      ],
    },
    {
      prompt: "Why do you take the field?",
      options: [
        {
          label: "For the story — campaigns, consequences, and legends that grow",
          systems: {
            "middle-earth-sbg": 2,
            frostgrave: 2,
            "trench-crusade": 2,
            "horus-heresy": 2,
            "warhammer-40k": 1,
            "star-wars-legion": 1,
            malifaux: 1,
          },
        },
        {
          label: "For the contest — clean rules, sharp play, a worthy opponent",
          systems: {
            infinity: 2,
            "kings-of-war": 2,
            "marvel-crisis-protocol": 2,
            "kill-team": 2,
            malifaux: 2,
            warcry: 1,
            conquest: 1,
          },
        },
        {
          label: "For both — a good game and a good tale, ideally at once",
          systems: {
            "age-of-sigmar": 1,
            "warhammer-40k": 1,
            "the-old-world": 1,
            "bolt-action": 1,
            "star-wars-legion": 1,
            conquest: 1,
            "kings-of-war": 1,
            "middle-earth-sbg": 1,
            battletech: 1,
          },
        },
      ],
    },
    {
      prompt: "The horizon darkens with the enemy.",
      followUp: "What do you see?",
      options: [
        {
          label: "Champions — a few mighty figures who decide everything",
          systems: {
            "middle-earth-sbg": 2,
            "marvel-crisis-protocol": 2,
            "star-wars-legion": 2,
            infinity: 1,
            malifaux: 1,
            frostgrave: 1,
            warcry: 1,
          },
        },
        {
          label: "Hordes — endless, hungry, unstoppable",
          systems: {
            "warhammer-40k": 2,
            "age-of-sigmar": 2,
            "trench-crusade": 1,
            "kings-of-war": 1,
            "horus-heresy": 1,
          },
        },
        {
          label: "Ranks — disciplined regiments moving as one",
          systems: {
            "the-old-world": 2,
            conquest: 2,
            "bolt-action": 2,
            "kings-of-war": 2,
            "horus-heresy": 2,
            battletech: 1,
          },
        },
      ],
    },
    {
      prompt: "Power flows through your world.",
      followUp: "What shape does it take?",
      options: [
        {
          label: "Magic — spells, rituals, and things best left unnamed",
          systems: {
            "age-of-sigmar": 2,
            frostgrave: 2,
            "middle-earth-sbg": 1,
            "the-old-world": 1,
            "kings-of-war": 1,
            conquest: 1,
            malifaux: 1,
          },
        },
        {
          label: "Technology — engines, armor, and the edge of invention",
          systems: {
            battletech: 2,
            infinity: 2,
            "bolt-action": 1,
            "kill-team": 1,
            "star-wars-legion": 1,
            "warhammer-40k": 1,
            "marvel-crisis-protocol": 1,
          },
        },
        {
          label: "Both, colliding — sorcery welded to machinery",
          systems: {
            "warhammer-40k": 2,
            "horus-heresy": 1,
            "trench-crusade": 1,
            warcry: 1,
            malifaux: 1,
            "marvel-crisis-protocol": 1,
          },
        },
      ],
    },
    {
      prompt: "An evening of battle awaits.",
      followUp: "How does it unfold?",
      options: [
        {
          label: "Fast and lethal — an hour of lightning decisions",
          systems: {
            "kill-team": 2,
            warcry: 2,
            infinity: 2,
            malifaux: 2,
            "marvel-crisis-protocol": 2,
            frostgrave: 2,
            "trench-crusade": 1,
          },
        },
        {
          label: "Epic and sweeping — a saga that fills the whole evening",
          systems: {
            "horus-heresy": 2,
            "the-old-world": 2,
            "kings-of-war": 2,
            conquest: 2,
            "age-of-sigmar": 1,
            "warhammer-40k": 1,
            battletech: 1,
          },
        },
        {
          label: "Somewhere between — room for drama without losing the plot",
          systems: {
            "star-wars-legion": 2,
            "bolt-action": 2,
            "middle-earth-sbg": 2,
            battletech: 1,
            "age-of-sigmar": 1,
            "warhammer-40k": 1,
          },
        },
      ],
    },
    {
      prompt: "Every world has a mood.",
      followUp: "Which one calls to you?",
      options: [
        {
          label: "Grim — the night is long and victory costs everything",
          systems: {
            "trench-crusade": 3,
            "warhammer-40k": 2,
            "horus-heresy": 2,
            "kill-team": 2,
            malifaux: 1,
            warcry: 1,
          },
        },
        {
          label: "Hopeful — heroes rise, and the light is worth defending",
          systems: {
            "middle-earth-sbg": 2,
            "star-wars-legion": 2,
            "marvel-crisis-protocol": 2,
            "age-of-sigmar": 1,
            "kings-of-war": 1,
            frostgrave: 1,
          },
        },
        {
          label: "Defiant — dark odds met with courage and dry humor",
          systems: {
            "bolt-action": 2,
            "kill-team": 1,
            infinity: 1,
            conquest: 1,
            "the-old-world": 1,
            "age-of-sigmar": 1,
            frostgrave: 1,
            battletech: 1,
            warcry: 1,
          },
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Scoring & recommendation
// ---------------------------------------------------------------------------

export type SystemScores = Record<GameSystemKey, number>;

export const EMPTY_SYSTEM_SCORES: SystemScores = Object.fromEntries(
  GAME_SYSTEM_KEYS.map((key) => [key, 0])
) as SystemScores;

export function scoreWorldAnswers(answers: number[]): SystemScores {
  return accumulateScores(
    FIND_YOUR_WORLD.questions.map(
      (question, i) => question.options[answers[i]]?.systems
    ),
    EMPTY_SYSTEM_SCORES
  );
}

export type RankedGameSystem = {
  system: GameSystem;
  score: number;
  /** 0–100: how much of this system's possible pull the answers realized. */
  confidence: number;
};

/** The most a system could score given one answer per question — the
 * denominator that turns a raw score into a confidence percentage. */
function maxAchievableScore(key: GameSystemKey): number {
  return FIND_YOUR_WORLD.questions.reduce(
    (sum, question) =>
      sum +
      Math.max(0, ...question.options.map((o) => o.systems[key] ?? 0)),
    0
  );
}

/** Deterministic ranking with stable tie-breaking (declaration order),
 * mirroring rankBanners so results are shareable and repeatable. */
export function rankGameSystems(scores: SystemScores): RankedGameSystem[] {
  return GAME_SYSTEM_KEYS.map((key, index) => {
    const max = maxAchievableScore(key);
    const score = scores[key];
    return {
      system: GAME_SYSTEMS[key],
      score,
      confidence:
        max > 0 ? Math.min(99, Math.max(1, Math.round((100 * score) / max))) : 0,
      index,
    };
  })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ system, score, confidence }) => ({ system, score, confidence }));
}

/** The reusable profile attribute: a primary world, runners-up, and the
 * key list downstream features consume (Banner Discovery today; factions,
 * starter boxes, articles, clubs, and events tomorrow). */
export type WorldRecommendation = {
  primary: GameSystem;
  confidence: number;
  alsoConsider: GameSystem[];
  /** Primary + alsoConsider keys, in rank order. */
  recommendedKeys: GameSystemKey[];
};

export function recommendWorlds(answers: number[]): WorldRecommendation {
  const ranked = rankGameSystems(scoreWorldAnswers(answers));
  const [primary, ...rest] = ranked;
  const alsoConsider = rest.slice(0, 3).map((r) => r.system);
  return {
    primary: primary.system,
    confidence: primary.confidence,
    alsoConsider,
    recommendedKeys: [primary.system, ...alsoConsider].map((s) => s.key),
  };
}
