import type { ArmyList } from "@/lib/army-lists/types";
import type { ArmyOverviewSnapshot, MatchupRow, MatchupStatus, MatchupView } from "./types";

/** Snapshot an army for a matchup — see ArmyOverviewSnapshot for why this copies rather than references. */
export function buildArmyOverviewSnapshot(army: ArmyList): ArmyOverviewSnapshot {
  return {
    army_id: army.id,
    name: army.name || "Untitled army",
    game_system: army.game_system,
    faction: army.faction,
    subfaction: army.subfaction,
    points_total: army.points_total,
    datasheet_count: army.datasheet_count ?? army.parsed_json?.units.length ?? null,
    detachment_names: army.detachment_names,
    playstyle_tags: army.playstyle_tags,
    tactical_summary: army.tactical_summary,
    visual_identity: army.visual_identity_json,
    units: (army.parsed_json?.units ?? []).map((unit) => ({
      name: unit.name,
      points: unit.points,
      quantity: unit.quantity,
      role: unit.role || unit.section || "Unspecified",
    })),
    snapshotted_at: new Date().toISOString(),
  };
}

export function computeMatchupStatus(
  matchup: Pick<MatchupRow, "creator_locked_at" | "opponent_locked_at" | "status">
): MatchupStatus {
  if (matchup.status === "cancelled") return "cancelled";
  if (matchup.creator_locked_at && matchup.opponent_locked_at) return "revealed";
  if (matchup.creator_locked_at || matchup.opponent_locked_at) return "one_locked";
  return "pending";
}

/**
 * The single seam that enforces fairness: an opponent snapshot is only
 * ever handed back once *both* sides have locked. Until then `opponent`
 * is null, regardless of what's sitting in the row's snapshot columns.
 */
export function buildMatchupView(
  matchup: MatchupRow,
  viewerUserId: string,
  liveSelfOverview: ArmyOverviewSnapshot | null
): MatchupView {
  const isCreator = matchup.creator_user_id === viewerUserId;
  const selfLockedAt = isCreator ? matchup.creator_locked_at : matchup.opponent_locked_at;
  const opponentLockedAt = isCreator ? matchup.opponent_locked_at : matchup.creator_locked_at;
  const status = computeMatchupStatus(matchup);
  const revealed = status === "revealed";
  const selfSnapshot = isCreator ? matchup.creator_snapshot : matchup.opponent_snapshot;
  const opponentSnapshot = isCreator ? matchup.opponent_snapshot : matchup.creator_snapshot;

  return {
    id: matchup.id,
    status,
    isCreator,
    selfLocked: Boolean(selfLockedAt),
    opponentLocked: Boolean(opponentLockedAt),
    revealed,
    hasOpponent: Boolean(matchup.opponent_user_id),
    inviteCode: matchup.opponent_user_id ? null : matchup.invite_code,
    // Once you've locked, you see the snapshot you agreed to — not a
    // live view that could drift if the source army is edited later.
    self: selfLockedAt ? selfSnapshot : liveSelfOverview,
    opponent: revealed ? opponentSnapshot : null,
  };
}
