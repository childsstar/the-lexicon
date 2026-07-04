import Anthropic from "@anthropic-ai/sdk";

export type ParsedArmyUnit = {
  name: string;
  quantity: number | null;
  points: number | null;
  role: string | null;
  enhancements: string[];
  upgrades: string[];
  wargear: string[];
};

export type ParsedArmyList = {
  game_system: string | null;
  faction: string | null;
  subfaction: string | null;
  points_total: number | null;
  units: ParsedArmyUnit[];
  inferred_playstyle_tags: string[];
  confidence: number;
  warnings: string[];
};

export const EMPTY_PARSED_ARMY_LIST: ParsedArmyList = {
  game_system: null,
  faction: null,
  subfaction: null,
  points_total: null,
  units: [],
  inferred_playstyle_tags: [],
  confidence: 0,
  warnings: [],
};

export const ARMY_LIST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "game_system",
    "faction",
    "subfaction",
    "points_total",
    "units",
    "inferred_playstyle_tags",
    "confidence",
    "warnings",
  ],
  properties: {
    game_system: { type: ["string", "null"] },
    faction: { type: ["string", "null"] },
    subfaction: { type: ["string", "null"] },
    points_total: { type: ["number", "null"] },
    units: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "quantity",
          "points",
          "role",
          "enhancements",
          "upgrades",
          "wargear",
        ],
        properties: {
          name: { type: "string" },
          quantity: { type: ["number", "null"] },
          points: { type: ["number", "null"] },
          role: { type: ["string", "null"] },
          enhancements: { type: "array", items: { type: "string" } },
          upgrades: { type: "array", items: { type: "string" } },
          wargear: { type: "array", items: { type: "string" } },
        },
      },
    },
    inferred_playstyle_tags: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    warnings: { type: "array", items: { type: "string" } },
  },
} as const;

const MODEL = process.env.ARMY_LIST_MODEL || process.env.CHRONICLE_MODEL || "claude-opus-4-8";
const TIMEOUT_MS = 12_000;

export function isParsedArmyList(value: unknown): value is ParsedArmyList {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ParsedArmyList>;
  return (
    (typeof v.game_system === "string" || v.game_system === null) &&
    (typeof v.faction === "string" || v.faction === null) &&
    (typeof v.subfaction === "string" || v.subfaction === null) &&
    (typeof v.points_total === "number" || v.points_total === null) &&
    Array.isArray(v.units) &&
    v.units.every(isParsedArmyUnit) &&
    Array.isArray(v.inferred_playstyle_tags) &&
    v.inferred_playstyle_tags.every((tag) => typeof tag === "string") &&
    typeof v.confidence === "number" &&
    v.confidence >= 0 &&
    v.confidence <= 1 &&
    Array.isArray(v.warnings) &&
    v.warnings.every((warning) => typeof warning === "string")
  );
}

function isParsedArmyUnit(value: unknown): value is ParsedArmyUnit {
  if (!value || typeof value !== "object") return false;
  const unit = value as Partial<ParsedArmyUnit>;
  return (
    typeof unit.name === "string" &&
    (typeof unit.quantity === "number" || unit.quantity === null) &&
    (typeof unit.points === "number" || unit.points === null) &&
    (typeof unit.role === "string" || unit.role === null) &&
    Array.isArray(unit.enhancements) &&
    unit.enhancements.every((item) => typeof item === "string") &&
    Array.isArray(unit.upgrades) &&
    unit.upgrades.every((item) => typeof item === "string") &&
    Array.isArray(unit.wargear) &&
    unit.wargear.every((item) => typeof item === "string")
  );
}

export function buildArmyListPrompt(input: {
  rawText: string;
  gameSystem?: string | null;
  name?: string | null;
}): string {
  return `Parse this tabletop wargaming army roster into structured JSON. Infer only when the text supports it. If a field is ambiguous, use null and add a warning. Normalize quantities and point values as numbers. Keep unit names recognizable to a recommendation engine.\n\nList name: ${input.name || "not provided"}\nGame system hint: ${input.gameSystem || "not provided"}\n\nRoster text:\n${input.rawText}`;
}

export async function parseArmyListWithAi(input: {
  rawText: string;
  gameSystem?: string | null;
  name?: string | null;
}): Promise<ParsedArmyList> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Army list parsing is not configured. Set ANTHROPIC_API_KEY.");
  }

  const client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 0 });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: ARMY_LIST_SCHEMA },
    },
    system:
      "You convert pasted tabletop army lists into strict JSON for The Lexicon. Do not invent units. Return only the schema fields.",
    messages: [{ role: "user", content: buildArmyListPrompt(input) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The parser refused this roster text.");
  }

  const text = response.content.find((block) => block.type === "text")?.text;
  const parsed: unknown = text ? JSON.parse(text) : null;
  if (!isParsedArmyList(parsed)) {
    throw new Error("The parser returned malformed roster JSON.");
  }
  return parsed;
}
