import { Suspense } from "react";
import type { Metadata } from "next";
import NewMatchupClient from "./new-matchup-client";

export const metadata: Metadata = { title: "New Matchup" };

export default function NewMatchupPage() {
  return (
    <Suspense fallback={<div className="card p-5 text-sm text-text-muted">Loading…</div>}>
      <NewMatchupClient />
    </Suspense>
  );
}
