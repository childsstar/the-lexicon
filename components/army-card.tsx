import Link from "next/link";
import ArmySigil from "@/components/army-sigil";
import { ChevronRightIcon } from "@/components/icons";
import type { ArmyList } from "@/lib/army-lists/types";

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 30) return `Updated ${diffDays} days ago`;
  return `Updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function statusLabel(army: ArmyList): string {
  if (army.locked_at) return "Locked";
  return army.visibility.replace("_", " ");
}

export default function ArmyCard({ army }: { army: ArmyList }) {
  return (
    <Link href={`/armies/${army.id}`} className="card card-interactive flex items-center gap-4 p-5">
      <ArmySigil identity={army.visual_identity_json} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-display text-lg font-semibold text-text">{army.name || "Untitled army"}</h2>
          <span className="shrink-0 rounded-full border border-border-strong px-2 py-0.5 text-[0.65rem] font-medium capitalize text-text-subtle">
            {statusLabel(army)}
          </span>
        </div>
        <p className="truncate text-sm text-text-muted">
          {[army.faction, army.game_system].filter(Boolean).join(" · ") || "Faction unknown"}
        </p>
        <p className="mt-1 text-xs text-text-subtle">
          {army.points_total ? `${army.points_total} pts` : "Points unknown"} · {army.datasheet_count ?? 0} datasheets ·{" "}
          {relativeTime(army.updated_at)}
        </p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-subtle" />
    </Link>
  );
}
