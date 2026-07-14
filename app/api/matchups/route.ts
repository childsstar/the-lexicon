import { NextResponse } from "next/server";
import { computeMatchupStatus } from "@/lib/matchups/reveal";
import { getRequestUser } from "@/lib/supabase-server";
import type { MatchupRow } from "@/lib/matchups/types";
import type { VisualIdentity } from "@/lib/armies/visual-identity";

export async function POST(request: Request) {
  let body: { armyId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const armyId = typeof body.armyId === "string" ? body.armyId : "";
  if (!armyId) {
    return NextResponse.json({ error: "Choose an army to bring to this matchup." }, { status: 400 });
  }

  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to start a matchup." }, { status: 401 });
  }

  const { data: army, error: armyError } = await supabase
    .from("army_lists")
    .select("id")
    .eq("id", armyId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (armyError || !army) {
    return NextResponse.json({ error: "That army couldn't be found in your muster roll." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("army_matchups")
    .insert({ creator_user_id: user.id, creator_army_id: armyId })
    .select("id, invite_code")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matchupId: data.id, inviteCode: data.invite_code }, { status: 201 });
}

export async function GET(request: Request) {
  let supabase;
  let user;
  try {
    ({ supabase, user } = await getRequestUser(request));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Sign in to see your matchups." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("army_matchups")
    .select(
      "id, creator_user_id, opponent_user_id, creator_army_id, opponent_army_id, creator_locked_at, opponent_locked_at, status, invite_code, created_at, " +
        "creatorSnapshotName:creator_snapshot->>name, creatorSnapshotIdentity:creator_snapshot->visual_identity, " +
        "opponentSnapshotName:opponent_snapshot->>name, opponentSnapshotIdentity:opponent_snapshot->visual_identity"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type ListRow = Pick<
    MatchupRow,
    "id" | "creator_user_id" | "opponent_user_id" | "creator_army_id" | "opponent_army_id" | "creator_locked_at" | "opponent_locked_at" | "status" | "invite_code" | "created_at"
  > & {
    creatorSnapshotName: string | null;
    creatorSnapshotIdentity: VisualIdentity | null;
    opponentSnapshotName: string | null;
    opponentSnapshotIdentity: VisualIdentity | null;
  };
  const rows = (data ?? []) as unknown as ListRow[];

  // A side that hasn't locked has no snapshot yet — name that army from
  // the viewer's own muster roll instead (it's always their own army).
  const userId = user.id;
  const unnamedSelfArmyIds = rows
    .filter((row) => (row.creator_user_id === userId ? !row.creatorSnapshotName : !row.opponentSnapshotName))
    .map((row) => (row.creator_user_id === userId ? row.creator_army_id : row.opponent_army_id))
    .filter((armyId): armyId is string => Boolean(armyId));

  const armyInfo = new Map<string, { name: string | null; identity: VisualIdentity | null }>();
  if (unnamedSelfArmyIds.length > 0) {
    const { data: armies } = await supabase
      .from("army_lists")
      .select("id, name, visual_identity_json")
      .in("id", unnamedSelfArmyIds);
    for (const army of (armies ?? []) as { id: string; name: string | null; visual_identity_json: VisualIdentity | null }[]) {
      armyInfo.set(army.id, { name: army.name, identity: army.visual_identity_json });
    }
  }

  const matchups = rows.map((row) => {
    const isCreator = row.creator_user_id === userId;
    const status = computeMatchupStatus(row);
    const selfArmyId = isCreator ? row.creator_army_id : row.opponent_army_id;
    const selfFallback = selfArmyId ? armyInfo.get(selfArmyId) : undefined;
    return {
      id: row.id,
      status,
      isCreator,
      hasOpponent: Boolean(row.opponent_user_id),
      selfLocked: Boolean(isCreator ? row.creator_locked_at : row.opponent_locked_at),
      opponentLocked: Boolean(isCreator ? row.opponent_locked_at : row.creator_locked_at),
      inviteCode: row.opponent_user_id ? null : row.invite_code,
      createdAt: row.created_at,
      selfArmyName: (isCreator ? row.creatorSnapshotName : row.opponentSnapshotName) ?? selfFallback?.name ?? null,
      selfArmyIdentity: (isCreator ? row.creatorSnapshotIdentity : row.opponentSnapshotIdentity) ?? selfFallback?.identity ?? null,
      // The opponent's army name stays sealed until reveal, same as the list itself.
      opponentArmyName: status === "revealed" ? (isCreator ? row.opponentSnapshotName : row.creatorSnapshotName) : null,
    };
  });

  return NextResponse.json({ matchups });
}
