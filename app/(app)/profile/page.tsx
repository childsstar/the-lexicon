import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { UserIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Profile" };

const fields = [
  { label: "Username", value: "Not set", hint: "Your name on the battlefield" },
  { label: "Availability", value: "Not set", hint: "When you can play" },
  { label: "Play style", value: "Not set", hint: "Narrative, casual, competitive" },
  { label: "Home region", value: "Not set", hint: "Where you muster" },
];

export default function ProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your commander identity — who you are, when you play, and how you like your battles fought."
      />

      <div className="card mb-4 flex items-center gap-4 p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold-600/40 bg-ink-850 text-gold-500">
          <UserIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-parchment-100">
            Unnamed Commander
          </h2>
          <p className="mt-0.5 text-sm text-parchment-500">
            Sign-in and profile editing arrive in the next muster.
          </p>
        </div>
      </div>

      <div className="card divide-y divide-ink-800">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="text-sm font-medium text-parchment-100">
                {field.label}
              </p>
              <p className="text-xs text-parchment-700">{field.hint}</p>
            </div>
            <span className="rounded-full border border-ink-700 px-3 py-1 text-xs text-parchment-700">
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
