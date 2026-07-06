import type { Metadata } from "next";
import MatchupsClient from "./matchups-client";

export const metadata: Metadata = { title: "Matchups" };

export default function MatchupsPage() {
  return <MatchupsClient />;
}
