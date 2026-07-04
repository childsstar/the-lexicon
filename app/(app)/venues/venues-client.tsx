"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  friendlyVenueError,
  locationTokens,
  venueIsNearby,
  venueTypeLabel,
  type Venue,
} from "@/lib/venues";
import { MapPinIcon, PlusIcon, ChevronRightIcon } from "@/components/icons";

function VenueCard({ venue, nearby }: { venue: Venue; nearby: boolean }) {
  return (
    <Link
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
        <p className="truncate text-sm text-parchment-500">
          {venueTypeLabel(venue.venue_type)}
          {venue.region ? ` · ${venue.region}` : ""}
        </p>
      </div>
      {nearby && (
        <span className="shrink-0 rounded-full border border-gold-600/60 px-3 py-1 text-xs font-medium text-gold-300">
          Near you
        </span>
      )}
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-parchment-700" />
    </Link>
  );
}

export default function VenuesClient() {
  const { profile } = useAuth();
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabaseClient()
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(friendlyVenueError(error));
        else setVenues((data as Venue[]) ?? []);
      });
  }, []);

  const tokens = useMemo(
    () => locationTokens(profile?.home_locations),
    [profile]
  );
  const nearby = (venues ?? []).filter((v) => venueIsNearby(v, tokens));
  const elsewhere = (venues ?? []).filter((v) => !venueIsNearby(v, tokens));

  return (
    <div>
      <PageHeader
        title="Venues"
        description="Game stores, clubs, and kitchen tables — the places where battles actually happen. Chronicled by the community, matched to your home locations."
        action={
          <Link
            href="/venues/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add venue
          </Link>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-ember-500/50 bg-ember-500/10 px-4 py-3 text-sm text-ember-400">
          {error}
        </p>
      )}

      {venues === null && !error && (
        <p className="py-12 text-center text-sm text-parchment-700">
          Consulting the gazetteer…
        </p>
      )}

      {venues !== null && venues.length === 0 && (
        <EmptyState
          icon={<MapPinIcon className="h-7 w-7" />}
          title="No venues chronicled yet"
          body="Be the first: add the store, club, or table where your battles happen, and every commander nearby will find it."
          actionHref="/venues/new"
          actionLabel="Add the first venue"
        />
      )}

      {nearby.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Near your home locations
          </p>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {nearby.map((v) => (
              <VenueCard key={v.id} venue={v} nearby />
            ))}
          </div>
        </div>
      )}

      {elsewhere.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-parchment-700">
            {nearby.length > 0 ? "Further afield" : "All venues"}
          </p>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {elsewhere.map((v) => (
              <VenueCard key={v.id} venue={v} nearby={false} />
            ))}
          </div>
        </div>
      )}

      {venues !== null && venues.length > 0 && tokens.length === 0 && (
        <p className="mt-6 text-center text-xs text-parchment-700">
          Add home locations to{" "}
          <Link href="/profile" className="text-gold-300 hover:text-gold-200">
            your profile
          </Link>{" "}
          to see which venues are near you.
        </p>
      )}
    </div>
  );
}
