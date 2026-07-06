import type { Metadata } from "next";
import ArmyDetailClient from "./army-detail-client";

export const metadata: Metadata = { title: "Army Detail" };

export default async function ArmyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArmyDetailClient id={id} />;
}
