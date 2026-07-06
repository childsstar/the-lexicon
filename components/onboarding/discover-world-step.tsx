"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import {
  distanceInMiles,
  formatDistanceMiles,
  venueTypeLabel,
  type Venue,
} from "@/lib/venues";
import { MapPinIcon } from "@/components/icons";
import { SectionRule } from "@/components/chronicle/frame";

type NearbyVenue = { venue: Venue; distanceMiles: number | null };

/**
 * "Where will your story begin?" — the first real-world signal in
 * onboarding. Discord server/guild data doesn't exist yet (see
 * docs/discord_sso_inspection.md), so this reads from the one source of
 * real local data The Lexicon already has: the venues table. Geolocation is
 * best-effort and optional; every path is clearly labeled as a
 * recommendation, never presented as a discovery.
 */
export default function DiscoverWorldStep({
  onContinue,
  onSkip,
}: {
  onContinue: (venue: Venue | null) => void;
  onSkip: () => void;
}) {
  const [venues, setVenues] = useState<NearbyVenue[] | null>(null);
  const [label, setLabel] = useState("Recommended for you");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch {
      setVenues([]);
      return;
    }

    async function loadFeatured() {
      const { data } = await supabase
        .from("venues")
        .select("*")
        .order("confidence", { ascending: false, nullsFirst: false })
        .order("verified_at", { ascending: false, nullsFirst: false })
        .limit(6);
      if (cancelled) return;
      setLabel("Featured communities");
      setVenues(
        ((data as Venue[]) ?? []).map((venue) => ({ venue, distanceMiles: null }))
      );
    }

    async function loadNearby(latitude: number, longitude: number) {
      const { data } = await supabase
        .from("venues")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(100);
      if (cancelled) return;
      const withDistance = ((data as Venue[]) ?? [])
        .map((venue) => ({
          venue,
          distanceMiles: distanceInMiles(
            { latitude, longitude },
            { latitude: venue.latitude!, longitude: venue.longitude! }
          ),
        }))
        .sort((a, b) => a.distanceMiles - b.distanceMiles)
        .slice(0, 6);
      if (withDistance.length > 0) {
        setLabel("Recommended near you");
        setVenues(withDistance);
      } else {
        void loadFeatured();
      }
    }

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocating(false);
          void loadNearby(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocating(false);
          void loadFeatured();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    } else {
      void loadFeatured();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const selected = venues?.find((v) => v.venue.id === selectedId) ?? null;

  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <div className="animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          Where will your story begin?
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-snug text-text">
          Every chronicle starts somewhere.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          The Lexicon doesn&apos;t know your local scene yet — but here are
          some places worth a look.
        </p>

        <div className="mt-8">
          <SectionRule label={locating ? "Finding your world…" : label} />

          {venues === null ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-20 animate-pulse" />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <p className="rounded-md border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
              No venues charted yet — you&apos;ll be one of the first to add
              one.
            </p>
          ) : (
            <div className="space-y-3">
              {venues.map(({ venue, distanceMiles }) => {
                const isSelected = selectedId === venue.id;
                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() =>
                      setSelectedId(isSelected ? null : venue.id)
                    }
                    className={`card card-interactive flex w-full items-center gap-3 p-4 text-left transition-colors ${
                      isSelected ? "border-gold-400 bg-gold-500/10" : ""
                    }`}
                  >
                    <div className="rounded-full border border-border bg-surface p-2 text-gold-500">
                      <MapPinIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold text-text">
                        {venue.name}
                      </p>
                      <p className="truncate text-xs text-text-subtle">
                        {venueTypeLabel(venue.venue_type)}
                        {venue.city ? ` · ${venue.city}` : ""}
                        {distanceMiles !== null
                          ? ` · ${formatDistanceMiles(distanceMiles)}`
                          : ""}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-gold-400">
                        Chosen
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => onContinue(selected?.venue ?? null)}
            className="w-full rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            {selected ? `Begin near ${selected.venue.name}` : "Continue"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 text-center text-xs font-medium uppercase tracking-widest text-text-subtle transition-colors hover:text-text-soft"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
