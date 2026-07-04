import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { SwordsIcon, PlusIcon, ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Battles" };

const exampleBattles = [
  {
    id: "example-siege-of-emberfall",
    name: "The Siege of Emberfall",
    detail: "Gilded Crusade vs. Brood of the Deep",
    result: "Victory",
    date: "A preview entry",
  },
  {
    id: "example-rout-at-blackmarsh",
    name: "The Rout at Blackmarsh",
    detail: "Gilded Crusade vs. Iron Reavers",
    result: "Defeat",
    date: "A preview entry",
  },
];

export default function BattlesPage() {
  return (
    <div>
      <PageHeader
        title="Battles"
        description="Your battle record. Every clash logged here becomes a page in your legend — victories and glorious defeats alike."
        action={
          <Link
            href="/battles/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            <PlusIcon className="h-4 w-4" />
            Log battle
          </Link>
        }
      />

      <EmptyState
        icon={<SwordsIcon className="h-7 w-7" />}
        title="No battles logged yet"
        body="Your chronicle awaits its first entry. Log a battle to start building your record."
        actionHref="/battles/new"
        actionLabel="Log your first battle"
      />

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-subtle">
          Example entries
        </p>
        <div className="space-y-3">
          {exampleBattles.map((battle) => (
            <Link
              key={battle.id}
              href={`/battles/${battle.id}`}
              className="card card-interactive flex items-center gap-4 p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-gold-500">
                <SwordsIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-lg font-semibold text-text">
                  {battle.name}
                </h2>
                <p className="text-sm text-text-muted">{battle.detail}</p>
                <p className="mt-1 text-xs text-text-subtle">{battle.date}</p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                  battle.result === "Victory"
                    ? "border-gold-600/60 text-gold-300"
                    : "border-ember-500/60 text-ember-400"
                }`}
              >
                {battle.result}
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-subtle" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
