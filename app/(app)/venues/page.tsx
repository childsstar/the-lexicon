import type { Metadata } from "next";
import VenuesClient from "./venues-client";

export const metadata: Metadata = { title: "Venues" };

export default function VenuesPage() {
  return <VenuesClient />;
}
