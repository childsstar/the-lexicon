import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { MapPinIcon, UserIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Nearby Players" };

const examplePlayers = [
  {
    name: "Ash the Unbroken",
    detail: "Plays skirmish & 40K-scale · Weeknights",
    distance: "2 miles away",
  },
  {
    name: "Vex_Painter",
    detail: "Narrative campaigns · Weekends",
    distance: "5 miles away",
  },
  {
    name: "Old Grognard",
    detail: "Historicals & grimdark · Flexible",
    distance: "8 miles away",
  },
];

export default function NearbyPlayersPage() {
  return (
    <div>
      <PageHeader
        title="Nearby Players"
        description="Players mustering in your region, matched by game system, availability, and play style."
        backHref="/community"
        backLabel="Community"
      />

      <EmptyState
        icon={<MapPinIcon className="h-7 w-7" />}
        title="Location matching is coming soon"
        body="Set your home region on your profile and we'll surface players near you. Here's a preview of what that will look like."
      />

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-subtle">
          Preview
        </p>
        <div className="space-y-3">
          {examplePlayers.map((player) => (
            <div key={player.name} className="card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-gold-500">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-medium text-text">
                  {player.name}
                </h2>
                <p className="text-sm text-text-muted">{player.detail}</p>
              </div>
              <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-text-subtle">
                {player.distance}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
