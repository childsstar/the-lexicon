import type { Metadata } from "next";
import MatchupDetailClient from "./matchup-detail-client";

export const metadata: Metadata = { title: "Matchup" };

export default async function MatchupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchupDetailClient id={id} />;
}
