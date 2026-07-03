import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { FlagIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Single battles are skirmishes; campaigns are sagas. Link battles into a running narrative and watch the map change."
      />

      <EmptyState
        icon={<FlagIcon className="h-7 w-7" />}
        title="No active campaigns"
        body="When campaign tracking ships, you'll link battles into long-running narratives — with territories, escalation, and consequences that carry from game to game."
        actionHref="/battles"
        actionLabel="Start with a battle"
      />

      <div className="card mt-8 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-parchment-700">
          Coming soon
        </p>
        <ul className="mt-3 space-y-2 text-sm text-parchment-500">
          <li className="flex gap-2">
            <span className="text-gold-500">✦</span> Campaign maps and
            territory control
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500">✦</span> Linked battle chains with
            escalating stakes
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500">✦</span> Shared campaign journals
            written by every player
          </li>
        </ul>
      </div>
    </div>
  );
}
