import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import {
  MapPinIcon,
  UsersIcon,
  ChevronRightIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div>
      <PageHeader
        title="Community"
        description="The hobby is better together. Find players near you and keep track of the ones you'd gladly face again."
      />

      <div className="space-y-4">
        <Link
          href="/community/nearby"
          className="card card-interactive flex items-center gap-4 p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-gold-500">
            <MapPinIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-parchment-100">
              Nearby Players
            </h2>
            <p className="mt-1 text-sm text-parchment-500">
              Discover who&apos;s mustering in your area and what they play.
            </p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-parchment-700" />
        </Link>

        <Link
          href="/community/connections"
          className="card card-interactive flex items-center gap-4 p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-gold-500">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-parchment-100">
              Connections
            </h2>
            <p className="mt-1 text-sm text-parchment-500">
              Allies and rivals — the players in your circle.
            </p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-parchment-700" />
        </Link>
      </div>
    </div>
  );
}
