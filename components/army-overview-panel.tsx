import Link from "next/link";
import ArmySigil from "@/components/army-sigil";
import TacticalOverviewPanel from "@/components/tactical-overview-panel";
import type { ArmyOverviewSnapshot } from "@/lib/matchups/types";

/** A shareable, opponent-safe reading of an army — used for both the "your list"
 * and "revealed opponent overview" panels in a matchup. Pass `armyHref` only for
 * armies the viewer owns; an opponent's source army stays private under RLS. */
export default function ArmyOverviewPanel({
  overview,
  eyebrow,
  armyHref,
}: {
  overview: ArmyOverviewSnapshot;
  eyebrow: string;
  armyHref?: string;
}) {
  return (
    <div className="card space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <ArmySigil identity={overview.visual_identity} size="lg" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">{eyebrow}</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-text">{overview.name}</h3>
            <p className="mt-0.5 text-sm text-text-muted">
              {[overview.faction, overview.game_system].filter(Boolean).join(" · ") || "Faction unknown"}
            </p>
          </div>
        </div>
        {armyHref && (
          <Link href={armyHref} className="shrink-0 text-xs font-semibold text-gold-400 transition-colors hover:text-gold-300">
            View army page →
          </Link>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Points" value={String(overview.points_total ?? "Unknown")} />
        <MiniStat label="Datasheets" value={String(overview.datasheet_count ?? overview.units.length)} />
        <MiniStat label="Detachments" value={overview.detachment_names.join(" / ") || "Unknown"} />
        <MiniStat label="Playstyle" value={overview.playstyle_tags[0] || "Balanced"} />
      </dl>

      {overview.tactical_summary && <TacticalOverviewPanel tactical={overview.tactical_summary} />}

      {overview.units.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-text">Full unit list</summary>
          <ul className="mt-3 divide-y divide-border-muted rounded-md border border-border-muted">
            {overview.units.map((unit, index) => (
              <li key={`${unit.name}-${index}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="text-text">{unit.quantity ? `${unit.quantity}× ` : ""}{unit.name}</span>
                <span className="text-text-subtle">{unit.points ?? "—"} pts · {unit.role}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-muted bg-surface/60 p-2.5 text-center">
      <dt className="text-[0.65rem] uppercase tracking-widest text-text-subtle">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-text">{value}</dd>
    </div>
  );
}
