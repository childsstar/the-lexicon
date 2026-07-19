import Anthropic from "@anthropic-ai/sdk";
import { parseArmyListDeterministically } from "./fallback-parser";
import type { ArmyListParser, ArmyListParserInput, ParsedArmyList, ParsedArmyUnit } from "./types";

export const EMPTY_PARSED_ARMY_LIST: ParsedArmyList = {
  roster_name: null,
  game_system: null,
  faction: null,
  subfaction: null,
  points_total: null,
  units: [],
  inferred_playstyle_tags: [],
  confidence: 0,
  warnings: [],
  unit_count: 0,
  model_count: null,
  detachment_names: [],
  detachment_points: null,
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
    "unit_count",
    "model_count",
    "detachment_names",
    "detachment_points",
  ],
  properties: {
    roster_name: { type: ["string", "null"] },
    game_system: { type: ["string", "null"] },
    faction: { type: ["string", "null"] },
    subfaction: { type: ["string", "null"] },
    points_total: { type: ["number", "null"] },
    units: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "quantity", "points", "role", "enhancements", "upgrades", "wargear"],
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
    unit_count: { type: ["number", "null"] },
    model_count: { type: ["number", "null"] },
    detachment_names: { type: "array", items: { type: "string" } },
    detachment_points: { type: ["number", "null"] },
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

export function buildArmyListPrompt(input: ArmyListParserInput): string {
  return `Parse this tabletop wargaming army roster into structured JSON. Infer only when the text supports it. If a field is ambiguous, use null and add a warning. Normalize quantities and point values as numbers. Keep unit names recognizable to a recommendation engine.\n\nList name: ${input.name || "not provided"}\nGame system hint: ${input.gameSystem || "not provided"}\nFaction hint: ${input.faction || "not provided"}\n\nRoster text:\n${input.rawText}`;
}

export async function parseArmyListWithAi(input: ArmyListParserInput): Promise<ParsedArmyList> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Army list AI parsing is not configured. Set ANTHROPIC_API_KEY.");
  }

  const client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 0 });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You convert pasted tabletop army lists into strict JSON for The Lexicon. Return only JSON matching this schema: ${JSON.stringify(ARMY_LIST_SCHEMA)}`,
    messages: [{ role: "user", content: buildArmyListPrompt(input) }],
  });

  if (response.stop_reason === "refusal") throw new Error("The parser refused this roster text.");
  const text = response.content.find((block) => block.type === "text")?.text;
  const parsed: unknown = text ? JSON.parse(text) : null;
  if (!isParsedArmyList(parsed)) throw new Error("The parser returned malformed roster JSON.");
  return parsed;
}

export const defaultArmyListParser: ArmyListParser = {
  parse: parseArmyList,
};

export async function parseArmyList(input: ArmyListParserInput): Promise<ParsedArmyList> {
  const deterministic = parseArmyListDeterministically(input);
  if (deterministic.game_system === "Warhammer 40,000" && deterministic.faction && deterministic.points_total && deterministic.units.length) return deterministic;

  try {
    return await parseArmyListWithAi(input);
  } catch (error) {
    const fallback = deterministic;
    fallback.warnings = [
      ...fallback.warnings,
      `AI parser unavailable or failed: ${error instanceof Error ? error.message : "Unknown parser error."}`,
    ];
    return fallback;
  }
}
