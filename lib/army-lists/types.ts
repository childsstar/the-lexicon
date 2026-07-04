import type { ParsedArmyList } from "./parser";

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
