import type { Metadata } from "next";
import ArmyListDetailClient from "./army-list-detail-client";

export const metadata: Metadata = { title: "Army List" };

export default async function ArmyListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArmyListDetailClient id={id} />;
}
