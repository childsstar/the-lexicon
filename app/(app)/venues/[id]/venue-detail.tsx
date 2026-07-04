"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/page-header";
import { getSupabaseClient } from "@/lib/supabase";
import { venueTypeLabel, type Venue } from "@/lib/venues";
import { MapPinIcon, CalendarIcon, UsersIcon } from "@/components/icons";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function VenueDetail({ id }: { id: string }) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [state, setState] = useState<"loading" | "found" | "missing">(
    "loading"
  );

  useEffect(() => {
    if (!UUID.test(id)) {
      setState("missing");
      return;
    }
    getSupabaseClient()
      .from("venues")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setVenue(data as Venue);
          setState("found");
        } else {
          setState("missing");
        }
      });
  }, [id]);

  return (
    <div>
      <PageHeader
        title={venue?.name ?? "Venue Detail"}
        description={
          venue
            ? `${venueTypeLabel(venue.venue_type)}${venue.region ? ` · ${venue.region}` : ""}`
            : "Everything a visiting commander needs to know — tables, terrain, event nights, and who plays here."
        }
        backHref="/venues"
        backLabel="Venues"
      />

      {state === "loading" && (
        <p className="py-12 text-center text-sm text-text-subtle">
          Consulting the gazetteer…
        </p>
      )}

      {state === "missing" && (
        <div className="card p-6 text-center">
          <MapPinIcon className="mx-auto h-7 w-7 text-gold-500" />
          <p className="mt-3 text-sm text-text-muted">
            This venue isn&apos;t in the gazetteer. It may have been removed —
            or never chronicled at all.
          </p>
        </div>
      )}

      {state === "found" && venue && (
        <>
          <div className="card mb-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gold-600/40 bg-surface text-gold-500">
                <MapPinIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">
                  Venue record
                </p>
                <h2 className="truncate font-display text-2xl font-semibold text-text">
                  {venue.name}
                </h2>
                {venue.website && (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gold-300 hover:text-gold-200"
                  >
                    {venue.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
            {venue.description && (
              <p className="mt-4 border-t border-border-muted pt-4 text-sm leading-relaxed text-text-muted">
                {venue.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="card flex items-start gap-4 p-5">
              <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
              <div>
                <h3 className="font-display text-lg font-semibold text-text">
                  Event nights
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  League nights, open play, and campaign sessions will be
                  listed here once venue owners can claim their pages.
                </p>
              </div>
            </div>
            <div className="card flex items-start gap-4 p-5">
              <UsersIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
              <div>
                <h3 className="font-display text-lg font-semibold text-text">
                  Regulars
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  See which commanders call this venue home and what they
                  play.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
