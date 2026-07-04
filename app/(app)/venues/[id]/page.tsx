import type { Metadata } from "next";
import VenueDetail from "./venue-detail";

export const metadata: Metadata = { title: "Venue Detail" };

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VenueDetail id={decodeURIComponent(id)} />;
}
