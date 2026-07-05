"use client";

import { useActiveUniverse } from "@/components/active-universe-provider";
import { UNIVERSES } from "@/lib/universes";
import { REALM_LIST, isRealmKey } from "@/lib/realms";

// The first realm switcher — architecture and wiring, not visual polish.
// Mirrors theme-selector.tsx's plain-select pattern. Selecting the universe
// option clears the realm filter (browse everything); selecting a realm
// scopes the session to it.

export default function RealmSwitcher() {
  const { universeKey, realmKey, setRealm } = useActiveUniverse();
  const universe = UNIVERSES[universeKey];

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-text-muted">
      <span className="hidden md:inline">Realm</span>
      <select
        aria-label="Realm"
        className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-text transition-colors focus:border-gold-500 focus:outline-none"
        value={realmKey ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          setRealm(isRealmKey(value) ? value : null);
        }}
      >
        <option value="">
          {universe.emoji} {universe.name}
        </option>
        {REALM_LIST.map((realm) => (
          <option key={realm.key} value={realm.key}>
            {realm.emoji} {realm.name}
          </option>
        ))}
      </select>
    </label>
  );
}
