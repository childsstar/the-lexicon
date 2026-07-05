"use client";

import { Children, type ReactNode } from "react";
import type { Banner } from "@/lib/chronicle/types";
import { filterBannersForActiveContext } from "@/lib/chronicle/types";
import { GAMES } from "@/lib/games";
import { REALMS } from "@/lib/realms";
import { useActiveUniverse } from "@/components/active-universe-provider";

// Scopes the (server-rendered) Hall of Banners cards to the active
// realm/game, via the same canonical matcher Find Your Banner and venues
// use (lib/active-context-matching.ts) — never hidden entirely, only
// re-scoped, with a graceful note when a realm has no banners mapped yet.
//
// `children` are the already-rendered banner cards from the server
// (app/(marketing)/chronicles/banners/page.tsx), passed straight through
// rather than rebuilt here. That keeps this component's own render tiny
// (just deciding which cards to keep) and avoids re-executing the cards'
// deterministic-but-engine-sensitive art (Math.sin-based star fields in
// components/chronicle/plates.tsx) on the client, which previously caused
// a hydration mismatch — see the PR discussion for details, and the
// "Server Components as children" pattern this follows: content rendered
// on the server and passed as children to a Client Component is not
// re-rendered/hydrated on the client.
export default function HallOfBannersFilter({
  banners,
  children,
}: {
  banners: Banner[];
  children: ReactNode;
}) {
  const { realmKey, gameKey } = useActiveUniverse();
  const { banners: visible, fellBack } = filterBannersForActiveContext(
    banners,
    { realmKey, gameKey }
  );
  const visibleIds = new Set(visible.map((b) => b.id));

  const contextLabel = gameKey
    ? GAMES[gameKey].name
    : realmKey
      ? REALMS[realmKey].name
      : "All Warhammer";

  const cards = Children.toArray(children).filter(
    (_, i) => visibleIds.has(banners[i]?.id)
  );

  return (
    <>
      <p className="mt-10 text-center text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
        Hall of Banners — {contextLabel}
      </p>
      {fellBack && (
        <p className="mt-2 text-center text-xs text-text-subtle">
          No {contextLabel} banners have been mapped yet — showing every
          Warhammer banner instead.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{cards}</div>
    </>
  );
}
