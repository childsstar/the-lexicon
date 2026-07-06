export type ParsedArmyUnit = {
  name: string;
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



export type ArmyList = {
  id: string;
  user_id: string;
  profile_id: string | null;
  name: string | null;
  game_system: string | null;
  faction: string | null;
  points_total: number | null;
  raw_text: string;
  parsed_json: ParsedArmyList | null;
  parser_status: "pending" | "succeeded" | "failed";
  parser_error: string | null;
  created_at: string;
  updated_at: string;
};
