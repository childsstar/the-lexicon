import type { Metadata } from "next";
import ArmiesClient from "./armies-client";

export const metadata: Metadata = { title: "Armies" };

export default function ArmiesPage() {
  return <ArmiesClient />;
}
