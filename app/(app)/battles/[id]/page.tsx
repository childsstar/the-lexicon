import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { SwordsIcon, ScrollIcon, MapPinIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Battle Detail" };

export default async function BattleDetailPage({
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
        title="Battle Detail"
        description="The full account of a single engagement — forces, outcome, and the moments worth retelling."
        backHref="/battles"
        backLabel="Battles"
      />

      <div className="card mb-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gold-600/40 bg-surface text-gold-500">
            <SwordsIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">
              Battle record
            </p>
            <h2 className="font-display text-2xl font-semibold capitalize text-text">
              {displayName}
            </h2>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border-muted pt-5 text-center">
          <div>
            <p className="font-display text-lg font-semibold text-gold-300">
              —
            </p>
            <p className="text-xs text-text-subtle">Date</p>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-gold-300">
              —
            </p>
            <p className="text-xs text-text-subtle">Outcome</p>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-gold-300">
              —
            </p>
            <p className="text-xs text-text-subtle">Opponent</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="card flex items-start gap-4 p-5">
          <ScrollIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
          <div>
            <h3 className="font-display text-lg font-semibold text-text">
              Battle report
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              The turn-by-turn account, key moments, and photos will live here
              once battle logging ships.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4 p-5">
          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
          <div>
            <h3 className="font-display text-lg font-semibold text-text">
              Where it was fought
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              Battles link to venues, so every table earns its own history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
