"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_ACTIVE_UNIVERSE_STATE,
  applyGameSelection,
  applyRealmSelection,
  parseActiveUniverseState,
  type ActiveUniverseState,
} from "@/lib/active-universe-state";
import type { RealmKey } from "@/lib/realms";
import type { GameKey } from "@/lib/games";

export type { ActiveUniverseState };

// The active Universe / Realm / Game selection — analogous to the
// light/dark theme selection (see theme-selector.tsx), but for "which
// corner of the hobby is this session about." The MVP only lets people
// change the realm; universe and game are carried in state and storage
// today so surfacing them later is wiring, not a rewrite. State
// transitions live in lib/active-universe-state.ts (pure, unit-tested);
// this component only owns React state and localStorage.

const storageKey = "lexicon-active-universe";

type ActiveUniverseContextValue = ActiveUniverseState & {
  setRealm: (realmKey: RealmKey | null) => void;
  setGame: (gameKey: GameKey | null) => void;
  /** Back to "All Warhammer" with no game selected. Called on sign-out
   * (see components/auth-provider.tsx) so a stale realm from a previous
   * session never lingers for whoever uses the browser next. */
  reset: () => void;
};

const ActiveUniverseContext = createContext<ActiveUniverseContextValue | null>(
  null
);

export function ActiveUniverseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ActiveUniverseState>(
    DEFAULT_ACTIVE_UNIVERSE_STATE
  );

  useEffect(() => {
    try {
      setState(parseActiveUniverseState(localStorage.getItem(storageKey)));
    } catch {
      /* localStorage unavailable — keep the default state */
    }
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
      persist(applyRealmSelection(state, realmKey));
    },
    [state, persist]
  );

  const setGame = useCallback(
    (gameKey: GameKey | null) => {
      persist(applyGameSelection(state, gameKey));
    },
    [state, persist]
  );

  const reset = useCallback(() => {
    persist(DEFAULT_ACTIVE_UNIVERSE_STATE);
  }, [persist]);

  return (
    <ActiveUniverseContext.Provider value={{ ...state, setRealm, setGame, reset }}>
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
