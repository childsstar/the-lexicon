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

type ViewMode = "list" | "map" | "both";

type VenueCardProps = {
  venue: Venue;
  nearby: boolean;
  selected: boolean;
  onSelect: (venue: Venue) => void;
};

function isMappableVenue(venue: Venue): venue is Venue & { latitude: number; longitude: number } {
  return (
    typeof venue.latitude === "number" &&
    Number.isFinite(venue.latitude) &&
    venue.latitude >= -90 &&
    venue.latitude <= 90 &&
    typeof venue.longitude === "number" &&
    Number.isFinite(venue.longitude) &&
    venue.longitude >= -180 &&
    venue.longitude <= 180
  );
}

function VenueCard({ venue, nearby, selected, onSelect }: VenueCardProps) {
  return (
    <article
      className={`card flex items-center gap-4 p-5 transition-colors ${
        selected ? "border-gold-500/70 bg-gold-500/10" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(venue)}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
        aria-pressed={selected}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-gold-500">
          <MapPinIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-semibold text-text">
            {venue.name}
          </h2>
          <p className="truncate text-sm text-text-muted">
            {venueTypeLabel(venue.venue_type)}
            {venue.region ? ` · ${venue.region}` : ""}
          </p>
        </div>
        {nearby && (
          <span className="hidden shrink-0 rounded-full border border-gold-600/60 px-3 py-1 text-xs font-medium text-gold-300 sm:inline-flex">
            Near you
          </span>
        )}
      </button>
      <Link
        href={`/venues/${venue.id}`}
        className="rounded-md p-2 text-text-subtle transition-colors hover:bg-surface hover:text-gold-300"
        aria-label={`Open ${venue.name}`}
      >
        <ChevronRightIcon className="h-4 w-4 shrink-0" />
      </Link>
    </article>
  );
}

function VenueDetailCard({ venue }: { venue: Venue }) {
  const tags = [...(venue.supported_game_systems ?? []), ...(venue.venue_categories ?? [])];
  const place = [venue.city, venue.region_code ?? venue.region].filter(Boolean).join(", ");

  return (
    <div className="rounded-xl border border-border bg-background/95 p-4 shadow-xl shadow-ink-950/30 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
        Selected venue
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold text-text">{venue.name}</h3>
      <p className="mt-1 text-sm text-text-muted">
        {venueTypeLabel(venue.venue_type)}{place ? ` · ${place}` : ""}
      </p>
      <div className="mt-3 space-y-1 text-sm">
        {venue.website && (
          <a href={venue.website} target="_blank" rel="noopener noreferrer" className="block truncate text-gold-300 hover:text-gold-200">
            {venue.website.replace(/^https?:\/\//, "")}
          </a>
        )}
        {venue.phone && <p className="text-text-muted">{venue.phone}</p>}
      </div>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border-muted px-2.5 py-1 text-xs text-text-muted">
              {tag.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      )}
      <Link href={`/venues/${venue.id}`} className="mt-4 inline-flex text-sm font-semibold text-gold-300 hover:text-gold-200">
        View venue details →
      </Link>
    </div>
  );
}

function VenuesMap({ venues, selectedVenue, onSelect }: { venues: Venue[]; selectedVenue: Venue | null; onSelect: (venue: Venue) => void; }) {
  const mappableVenues = venues.filter(isMappableVenue);
  const selectedMappable = selectedVenue && isMappableVenue(selectedVenue) ? selectedVenue : null;
  const bounds = useMemo(() => {
    if (mappableVenues.length === 0) return null;
    const lats = mappableVenues.map((v) => v.latitude);
    const lngs = mappableVenues.map((v) => v.longitude);
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);
    const latPad = Math.max((maxLat - minLat) * 0.15, 0.03);
    const lngPad = Math.max((maxLng - minLng) * 0.15, 0.03);
    minLat -= latPad;
    maxLat += latPad;
    minLng -= lngPad;
    maxLng += lngPad;
    if (selectedMappable) {
      const latSpan = maxLat - minLat;
      const lngSpan = maxLng - minLng;
      minLat = selectedMappable.latitude - latSpan / 2;
      maxLat = selectedMappable.latitude + latSpan / 2;
      minLng = selectedMappable.longitude - lngSpan / 2;
      maxLng = selectedMappable.longitude + lngSpan / 2;
    }
    return { minLat, maxLat, minLng, maxLng };
  }, [mappableVenues, selectedMappable]);

  if (mappableVenues.length === 0 || !bounds) {
    return (
      <div className="card flex min-h-80 items-center justify-center p-6 text-center text-sm text-text-muted">
        No venue coordinates are available yet. The list still includes every venue.
      </div>
    );
  }

  const positionFor = (venue: Venue & { latitude: number; longitude: number }) => ({
    left: `${((venue.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100}%`,
    top: `${(1 - (venue.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100}%`,
  });

  return (
    <section className="card overflow-hidden p-0">
      <div className="relative min-h-[28rem] bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.20),transparent_25%),linear-gradient(135deg,rgba(83,59,32,0.35),rgba(9,11,17,0.95))]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(212,175,55,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,.18)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-4 top-4 rounded-full border border-gold-600/50 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-300">
          {mappableVenues.length} mapped
        </div>
        {mappableVenues.map((venue) => {
          const selected = venue.id === selectedVenue?.id;
          return (
            <button
              key={venue.id}
              type="button"
              onClick={() => onSelect(venue)}
              className={`absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 ${selected ? "z-20 scale-125" : "z-10"}`}
              style={positionFor(venue)}
              aria-label={`Select ${venue.name}`}
            >
              <MapPinIcon className={`h-8 w-8 drop-shadow-lg ${selected ? "text-gold-300" : "text-ember-400"}`} />
            </button>
          );
        })}
        {selectedVenue && (
          <div className="absolute bottom-4 left-4 right-4 z-30 md:left-auto md:w-80">
            <VenueDetailCard venue={selectedVenue} />
          </div>
        )}
      </div>
    </section>
  );
}


export default function VenuesClient() {
  const { profile } = useAuth();
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

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
  const selectedVenue = (venues ?? []).find((v) => v.id === selectedVenueId) ?? null;
  const showList = viewMode === "list" || viewMode === "both";
  const showMap = viewMode === "map" || viewMode === "both";

  function handleSelectVenue(venue: Venue) {
    setSelectedVenueId(venue.id);
    if (viewMode === "list" && isMappableVenue(venue)) setViewMode("both");
  }

  const listContent = (
    <div>
      {nearby.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Near your home locations
          </p>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 [.venues-both_&]:lg:block [.venues-both_&]:lg:space-y-3">
            {nearby.map((v) => (
              <VenueCard key={v.id} venue={v} nearby selected={v.id === selectedVenueId} onSelect={handleSelectVenue} />
            ))}
          </div>
        </div>
      )}

      {elsewhere.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-subtle">
            {nearby.length > 0 ? "Further afield" : "All venues"}
          </p>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 [.venues-both_&]:lg:block [.venues-both_&]:lg:space-y-3">
            {elsewhere.map((v) => (
              <VenueCard key={v.id} venue={v} nearby={false} selected={v.id === selectedVenueId} onSelect={handleSelectVenue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
        <p className="py-12 text-center text-sm text-text-subtle">
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

      {venues !== null && venues.length > 0 && (
        <>
          <div className="mb-5 inline-flex rounded-lg border border-border bg-surface p-1">
            {(["list", "map", "both"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-gold-500 text-ink-950"
                    : "text-text-muted hover:bg-background hover:text-text"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className={viewMode === "both" ? "venues-both grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(26rem,1.05fr)]" : ""}>
            {showList && <div className={viewMode === "both" ? "min-w-0 lg:max-h-[42rem] lg:overflow-y-auto lg:pr-2" : ""}>{listContent}</div>}
            {showMap && <div className={viewMode === "both" ? "lg:sticky lg:top-6 lg:self-start" : ""}><VenuesMap venues={venues} selectedVenue={selectedVenue} onSelect={handleSelectVenue} /></div>}
          </div>
        </>
      )}

      {venues !== null && venues.length > 0 && tokens.length === 0 && (
        <p className="mt-6 text-center text-xs text-text-subtle">
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
