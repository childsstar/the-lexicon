import type { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = { title: "Muster an Army" };

const fields = [
  {
    label: "Army name",
    placeholder: "e.g. The Gilded Crusade",
    hint: "The name your force marches under.",
  },
  {
    label: "Faction",
    placeholder: "e.g. Zealous Crusaders",
    hint: "The banner it fights beneath.",
  },
  {
    label: "Game system",
    placeholder: "e.g. Grimdark 40K-scale",
    hint: "Which tabletop it takes the field on.",
  },
];

export default function MusterPage() {
  return (
    <div>
      <PageHeader
        title="Muster an Army"
        description="Raise a new force and add it to your roster. Three details are all it takes to begin."
        backHref="/armies"
        backLabel="Armies"
      />

      <div className="card p-6">
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="mb-1.5 block text-sm font-medium text-text">
                {field.label}
              </label>
              <input
                type="text"
                disabled
                placeholder={field.placeholder}
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-subtle"
              />
              <p className="mt-1.5 text-xs text-text-subtle">{field.hint}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-md bg-gold-600/50 px-6 py-3.5 text-sm font-semibold text-ink-950"
        >
          Muster this army
        </button>
        <p className="mt-3 text-center text-xs text-text-subtle">
          Saving armies unlocks once sign-in ships — this preview shows the
          flow.
        </p>
      </div>
    </div>
  );
}
