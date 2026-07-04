"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import { friendlyVenueError, VENUE_TYPES } from "@/lib/venues";

export default function VenueForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [venueType, setVenueType] = useState("");
  const [region, setRegion] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null; // AuthGuard redirects

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!venueType) {
      setError("Pick what kind of venue this is.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await getSupabaseClient().from("venues").insert({
        created_by: user!.id,
        name: name.trim(),
        venue_type: venueType,
        region: region.trim(),
        website: website.trim() || null,
        description: description.trim() || null,
      });
      if (error) {
        setError(friendlyVenueError(error));
        setSaving(false);
        return;
      }
      router.push("/venues");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Add a Venue"
        description="Chronicle a place where battles happen. Commanders whose home locations match its region will see it flagged as near them."
        backHref="/venues"
        backLabel="Venues"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="v-name"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Venue name <span className="text-gold-400">*</span>
          </label>
          <input
            id="v-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Dragon's Hoard"
            className="field"
          />
        </div>

        <div>
          <label
            htmlFor="v-type"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Venue type <span className="text-gold-400">*</span>
          </label>
          <select
            id="v-type"
            required
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            className="field"
          >
            <option value="" disabled>
              What kind of place is it?
            </option>
            {VENUE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="v-region"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            City &amp; region <span className="text-gold-400">*</span>
          </label>
          <input
            id="v-region"
            type="text"
            required
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. Brooklyn, NY 11201"
            className="field"
          />
          <p className="mt-1.5 text-xs text-text-subtle">
            City, state, and ZIP if you know it — this is how nearby
            commanders find it.
          </p>
        </div>

        <div>
          <label
            htmlFor="v-website"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Website
          </label>
          <input
            id="v-website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
            className="field"
          />
        </div>

        <div>
          <label
            htmlFor="v-desc"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Description
          </label>
          <textarea
            id="v-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tables, terrain, event nights, the crowd…"
            className="field resize-y"
          />
        </div>

        {error && (
          <p className="rounded-md border border-ember-500/50 bg-ember-500/10 px-4 py-3 text-sm text-ember-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Adding to the gazetteer…" : "Add this venue"}
        </button>
      </form>
    </div>
  );
}
