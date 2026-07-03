import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { MapPinIcon, CalendarIcon, UsersIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Venue Detail" };

export default async function VenueDetailPage({
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
        title="Venue Detail"
        description="Everything a visiting commander needs to know — tables, terrain, event nights, and who plays here."
        backHref="/venues"
        backLabel="Venues"
      />

      <div className="card mb-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gold-600/40 bg-ink-850 text-gold-500">
            <MapPinIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-parchment-700">
              Venue record
            </p>
            <h2 className="font-display text-2xl font-semibold capitalize text-parchment-100">
              {displayName}
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="card flex items-start gap-4 p-5">
          <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
          <div>
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              Event nights
            </h3>
            <p className="mt-1 text-sm text-parchment-500">
              League nights, open play, and campaign sessions will be listed
              here once venue owners can claim their pages.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4 p-5">
          <UsersIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
          <div>
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              Regulars
            </h3>
            <p className="mt-1 text-sm text-parchment-500">
              See which commanders call this venue home and what they play.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
