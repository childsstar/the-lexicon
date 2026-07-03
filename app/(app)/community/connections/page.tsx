import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { UsersIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Connections" };

export default function ConnectionsPage() {
  return (
    <div>
      <PageHeader
        title="Connections"
        description="The players in your circle — regular opponents, campaign allies, and rivals whose defeats you savor."
        backHref="/community"
        backLabel="Community"
      />

      <EmptyState
        icon={<UsersIcon className="h-7 w-7" />}
        title="No connections yet"
        body="When you connect with other players, they'll appear here — making it easy to arrange games, share lists, and settle old scores."
        actionHref="/community/nearby"
        actionLabel="Find nearby players"
      />
    </div>
  );
}
