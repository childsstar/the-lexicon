import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { ShieldIcon, SwordsIcon, ScrollIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Army Detail" };

export default async function ArmyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const displayName = decodeURIComponent(id)
    .replace(/^example-/, "")
    .replace(/-/g, " ");

  return (
    <div>
      <PageHeader
        title="Army Detail"
        description="The full record of a single force — its units, its paint progress, and the battles it has fought."
        backHref="/armies"
        backLabel="Armies"
      />

      <div className="card mb-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gold-600/40 bg-ink-850 text-gold-500">
            <ShieldIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-parchment-700">
              Roster entry
            </p>
            <h2 className="font-display text-2xl font-semibold capitalize text-parchment-100">
              {displayName}
            </h2>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-800 pt-5 text-center">
          <div>
            <p className="font-display text-2xl font-semibold text-gold-300">
              —
            </p>
            <p className="text-xs text-parchment-700">Units</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-gold-300">
              —
            </p>
            <p className="text-xs text-parchment-700">Battles</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-gold-300">
              —
            </p>
            <p className="text-xs text-parchment-700">Painted</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="card flex items-start gap-4 p-5">
          <SwordsIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
          <div>
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              Battle history
            </h3>
            <p className="mt-1 text-sm text-parchment-500">
              No battles recorded for this force yet. Its saga is unwritten.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4 p-5">
          <ScrollIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
          <div>
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              Army lore
            </h3>
            <p className="mt-1 text-sm text-parchment-500">
              Every force deserves a founding legend. Lore entries arrive in a
              future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
