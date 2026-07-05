"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_UNIVERSE_KEY,
  isUniverseKey,
  type UniverseKey,
} from "@/lib/universes";
import { isRealmKey, type RealmKey } from "@/lib/realms";
import { isGameKey, type GameKey } from "@/lib/games";

// The active Universe / Realm / Game selection — analogous to the
// light/dark theme selection (see theme-selector.tsx), but for "which
// corner of the hobby is this session about." The MVP only lets people
// change the realm; universe and game are carried in state and storage
// today so surfacing them later is wiring, not a rewrite.

const storageKey = "lexicon-active-universe";

export type ActiveUniverseState = {
  universeKey: UniverseKey;
  /** `null` means "the whole universe" — no realm filter applied. */
  realmKey: RealmKey | null;
  /** `null` means "no specific game" — not yet exposed in the UI. */
  gameKey: GameKey | null;
};

type ActiveUniverseContextValue = ActiveUniverseState & {
  setRealm: (realmKey: RealmKey | null) => void;
  setGame: (gameKey: GameKey | null) => void;
};

const DEFAULT_STATE: ActiveUniverseState = {
  universeKey: DEFAULT_UNIVERSE_KEY,
  realmKey: null,
  gameKey: null,
};

function readStoredState(): ActiveUniverseState {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return DEFAULT_STATE;
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
    return DEFAULT_STATE;
  }
}

const ActiveUniverseContext = createContext<ActiveUniverseContextValue | null>(
  null
);

export function ActiveUniverseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ActiveUniverseState>(DEFAULT_STATE);

  useEffect(() => {
    setState(readStoredState());
  }, []);

  const persist = useCallback((next: ActiveUniverseState) => {
    setState(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* localStorage unavailable — state still updates for this session */
    }
  }, []);

  const setRealm = useCallback(
    (realmKey: RealmKey | null) => {
      persist({ ...state, realmKey, gameKey: null });
    },
    [state, persist]
  );

  const setGame = useCallback(
    (gameKey: GameKey | null) => {
      persist({ ...state, gameKey });
    },
    [state, persist]
  );

  return (
    <ActiveUniverseContext.Provider value={{ ...state, setRealm, setGame }}>
      {children}
    </ActiveUniverseContext.Provider>
  );
}

export function useActiveUniverse(): ActiveUniverseContextValue {
  const ctx = useContext(ActiveUniverseContext);
  if (!ctx) {
    throw new Error(
      "useActiveUniverse must be used inside <ActiveUniverseProvider>"
    );
  }
  return ctx;
}
