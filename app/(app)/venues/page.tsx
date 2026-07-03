import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { MapPinIcon, ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Venues" };

const exampleVenues = [
  {
    id: "example-dragons-hoard",
    name: "The Dragon's Hoard",
    type: "Game store",
    detail: "8 tables · terrain library · weekly league night",
  },
  {
    id: "example-basement-bunker",
    name: "Basement Bunker Club",
    type: "Private club",
    detail: "4 tables · campaign nights on Thursdays",
  },
];

export default function VenuesPage() {
  return (
    <div>
      <PageHeader
        title="Venues"
        description="Game stores, clubs, and kitchen tables — the places where battles actually happen."
      />

      <EmptyState
        icon={<MapPinIcon className="h-7 w-7" />}
        title="No venues saved yet"
        body="Save the places you play so opponents know where to meet you. Venue submissions open soon — here's a preview."
      />

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-parchment-700">
          Preview
        </p>
        <div className="space-y-3">
          {exampleVenues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="card card-interactive flex items-center gap-4 p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-gold-500">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-lg font-semibold text-parchment-100">
                  {venue.name}
                </h2>
                <p className="text-sm text-parchment-500">
                  {venue.type} · {venue.detail}
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
