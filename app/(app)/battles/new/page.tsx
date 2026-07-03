import type { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = { title: "Log a Battle" };

const fields = [
  {
    label: "Battle name",
    placeholder: "e.g. The Siege of Emberfall",
    hint: "Give the engagement a name worth remembering.",
    type: "text" as const,
  },
  {
    label: "Date fought",
    placeholder: "",
    hint: "When the armies met.",
    type: "date" as const,
  },
  {
    label: "Your army",
    placeholder: "e.g. The Gilded Crusade",
    hint: "The force you fielded.",
    type: "text" as const,
  },
  {
    label: "Opponent",
    placeholder: "e.g. Brood of the Deep",
    hint: "Who — or what — you faced.",
    type: "text" as const,
  },
  {
    label: "Outcome",
    placeholder: "Victory, defeat, or a hard-fought draw",
    hint: "History is written by those who log it.",
    type: "text" as const,
  },
];

export default function LogBattlePage() {
  return (
    <div>
      <PageHeader
        title="Log a Battle"
        description="Record the engagement while the dice are still warm. The details you capture today become the stories you tell later."
        backHref="/battles"
        backLabel="Battles"
      />

      <div className="card p-6">
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="mb-1.5 block text-sm font-medium text-parchment-100">
                {field.label}
              </label>
              <input
                type={field.type}
                disabled
                placeholder={field.placeholder}
                className="w-full rounded-md border border-ink-700 bg-ink-850 px-4 py-3 text-sm text-parchment-100 placeholder:text-parchment-700"
              />
              <p className="mt-1.5 text-xs text-parchment-700">{field.hint}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-md bg-gold-600/50 px-6 py-3.5 text-sm font-semibold text-ink-950"
        >
          Record this battle
        </button>
        <p className="mt-3 text-center text-xs text-parchment-700">
          Battle logging unlocks once sign-in ships — this preview shows the
          flow.
        </p>
      </div>
    </div>
  );
}
