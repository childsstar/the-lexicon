import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { ShieldIcon, PlusIcon, ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Armies" };

// Example rosters shown until real data arrives — they link to the detail
// page so the full flow can be clicked through.
const exampleArmies = [
  {
    id: "example-crusaders",
    name: "The Gilded Crusade",
    faction: "Zealous Crusaders",
    system: "Grimdark 40K-scale",
    progress: "12 of 30 models painted",
  },
  {
    id: "example-swarm",
    name: "Brood of the Deep",
    faction: "Endless Swarm",
    system: "Skirmish scale",
    progress: "Fully painted",
  },
];

export default function ArmiesPage() {
  return (
    <div>
      <PageHeader
        title="Armies"
        description="Every force you field, in one roster. Track factions, game systems, and the long march of the paint queue."
        action={
          <Link
            href="/armies/muster"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            <PlusIcon className="h-4 w-4" />
            Muster
          </Link>
        }
      />

      <EmptyState
        icon={<ShieldIcon className="h-7 w-7" />}
        title="No armies mustered yet"
        body="Your roster is empty. Muster your first army to start tracking your forces — and give them a story worth fighting for."
        actionHref="/armies/muster"
        actionLabel="Muster your first army"
      />

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-parchment-700">
          Example rosters
        </p>
        <div className="space-y-3">
          {exampleArmies.map((army) => (
            <Link
              key={army.id}
              href={`/armies/${army.id}`}
              className="card card-interactive flex items-center gap-4 p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-gold-500">
                <ShieldIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-lg font-semibold text-parchment-100">
                  {army.name}
                </h2>
                <p className="text-sm text-parchment-500">
                  {army.faction} · {army.system}
                </p>
                <p className="mt-1 text-xs text-parchment-700">
                  {army.progress}
                </p>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-parchment-700" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
