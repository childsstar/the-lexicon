import { DEFAULT_UNIVERSE_KEY, isUniverseKey, type UniverseKey } from "./universes";
import { isRealmKey, type RealmKey } from "./realms";
import { GAMES, isGameKey, type GameKey } from "./games";

// The pure state shape/transitions behind ActiveUniverseContext, kept free
// of React and localStorage so it can be unit-tested directly (see
// scripts/validate-active-context.mjs). components/active-universe-provider.tsx
// is the thin client-side shell: it owns the useState/useEffect/localStorage
// plumbing and calls these functions for every transition.

export type ActiveUniverseState = {
  universeKey: UniverseKey;
  /** `null` means "the whole universe" — no realm filter applied. */
  realmKey: RealmKey | null;
  /** `null` means "no specific game" — not yet exposed in the UI. */
  gameKey: GameKey | null;
};

export const DEFAULT_ACTIVE_UNIVERSE_STATE: ActiveUniverseState = {
  universeKey: DEFAULT_UNIVERSE_KEY,
  realmKey: null,
  gameKey: null,
};

/** Parses a persisted (localStorage) snapshot, silently discarding anything
 * unrecognized so a stale or hand-edited value can never crash the app. */
export function parseActiveUniverseState(
  raw: string | null | undefined
): ActiveUniverseState {
  if (!raw) return DEFAULT_ACTIVE_UNIVERSE_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<
      Record<keyof ActiveUniverseState, unknown>
    >;
    return {
      universeKey:
        typeof parsed.universeKey === "string" &&
        isUniverseKey(parsed.universeKey)
          ? parsed.universeKey
          : DEFAULT_UNIVERSE_KEY,
      realmKey:
        typeof parsed.realmKey === "string" && isRealmKey(parsed.realmKey)
          ? parsed.realmKey
          : null,
      gameKey:
        typeof parsed.gameKey === "string" && isGameKey(parsed.gameKey)
          ? parsed.gameKey
          : null,
    };
  } catch {
    return DEFAULT_ACTIVE_UNIVERSE_STATE;
  }
}

/** Selecting a realm (including "All Warhammer", represented as `null`)
 * clears any specific game — a realm is the broader choice. Never called
 * automatically; only in response to an explicit user selection, so the
 * realm never resets silently. */
export function applyRealmSelection(
  state: ActiveUniverseState,
  realmKey: RealmKey | null
): ActiveUniverseState {
  return { ...state, realmKey, gameKey: null };
}

/** Selecting a game also pins its realm — a game determines its realm
 * unambiguously, so this is the one transition that updates both fields at
 * once (e.g. a quiz result landing on a specific game). Clearing the game
 * (`null`) leaves whatever realm was already active untouched. */
export function applyGameSelection(
  state: ActiveUniverseState,
  gameKey: GameKey | null
): ActiveUniverseState {
  return {
    ...state,
    gameKey,
    realmKey: gameKey ? GAMES[gameKey].realmKey : state.realmKey,
  };
}
