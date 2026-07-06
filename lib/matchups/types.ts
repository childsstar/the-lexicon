import type { TacticalSummary } from "@/lib/army-lists/tactical-overview";
import type { VisualIdentity } from "@/lib/armies/visual-identity";

export type MatchupStatus = "pending" | "one_locked" | "revealed" | "cancelled";

export type ArmyOverviewUnit = {
  name: string;
  points: number | null;
  quantity: number | null;
  role: string;
};

/**
 * A readable, opponent-safe snapshot of an army at the moment a side
 * locks a matchup. Taken (not referenced live) so a later edit to the
 * source army can never change an already-agreed matchup.
 */
export type ArmyOverviewSnapshot = {
  army_id: string;
  name: string;
  game_system: string | null;
  faction: string | null;
  subfaction: string | null;
  points_total: number | null;
  datasheet_count: number | null;
  detachment_names: string[];
  playstyle_tags: string[];
  tactical_summary: TacticalSummary | null;
  visual_identity: VisualIdentity | null;
  units: ArmyOverviewUnit[];
  snapshotted_at: string;
};

export type MatchupRow = {
  id: string;
  creator_user_id: string;
  opponent_user_id: string | null;
  creator_army_id: string;
  opponent_army_id: string | null;
  creator_locked_at: string | null;
  opponent_locked_at: string | null;
  creator_snapshot: ArmyOverviewSnapshot | null;
  opponent_snapshot: ArmyOverviewSnapshot | null;
  revealed_at: string | null;
  status: MatchupStatus;
  invite_code: string;
  created_at: string;
  updated_at: string;
};

/** The redacted, viewer-specific read of a matchup — the only shape the API ever returns. */
export type MatchupView = {
  id: string;
  status: MatchupStatus;
  isCreator: boolean;
  selfLocked: boolean;
  opponentLocked: boolean;
  revealed: boolean;
  hasOpponent: boolean;
  inviteCode: string | null;
  self: ArmyOverviewSnapshot | null;
  opponent: ArmyOverviewSnapshot | null;
};
