import type { TacticalSummary } from "./tactical-overview";
import type { VisualIdentity } from "@/lib/armies/visual-identity";

export type ParsedArmyUnit = {
  name: string;
  /** Exact input line. Unknown entries are deliberately preserved. */
  raw_text?: string;
  unverified?: boolean;
  quantity: number | null;
  points: number | null;
  role: string | null;
  enhancements: string[];
  upgrades: string[];
  wargear: string[];
  section?: string | null;
  category?: string | null;
};

export type ParsedArmyList = {
  roster_name?: string | null;
  game_system: string | null;
  faction: string | null;
  subfaction: string | null;
  points_total: number | null;
  units: ParsedArmyUnit[];
  unit_count?: number | null;
  model_count?: number | null;
  detachment_names?: string[];
  detachment_points?: number | null;
  inferred_playstyle_tags: string[];
  confidence: number;
  warnings: string[];
};

export type ArmyListParserInput = {
  rawText: string;
  gameSystem?: string | null;
  faction?: string | null;
  name?: string | null;
};

export type ArmyListParser = {
  parse(input: ArmyListParserInput): Promise<ParsedArmyList>;
};



export type ArmyVisibility = "private" | "shareable" | "matched_only";

export type ArmyList = {
  id: string;
  user_id: string;
  profile_id: string | null;
  name: string | null;
  game_system: string | null;
  game_key: import("@/lib/games").GameKey | null;
  description?: string | null;
  faction: string | null;
  subfaction: string | null;
  points_total: number | null;
  datasheet_count: number | null;
  model_count: number | null;
  detachment_names: string[];
  detachment_points: number | null;
  raw_text: string;
  parsed_json: ParsedArmyList | null;
  playstyle_tags: string[];
  tactical_summary: TacticalSummary | null;
  parser_status: "pending" | "succeeded" | "failed";
  parser_error: string | null;
  visibility: ArmyVisibility;
  locked_at: string | null;
  visual_identity_json: VisualIdentity | null;
  created_at: string;
  updated_at: string;
};

// Re-exported here so callers importing the DB row type also get the
// nested identity/tactical shapes without a second import.
export type { TacticalSummary, UnitTacticalNote } from "./tactical-overview";
export type { VisualIdentity, SigilAccent, SigilFrame, SigilTexture, SigilIconKey } from "@/lib/armies/visual-identity";
