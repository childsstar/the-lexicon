import type { Metadata } from "next";
import MusterArmyClient from "./muster-army-client";

export const metadata: Metadata = { title: "Muster an Army" };

export default function MusterPage() {
  return <MusterArmyClient />;
}
