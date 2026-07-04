import type { Metadata } from "next";
import ImportArmyListClient from "./import-army-list-client";

export const metadata: Metadata = { title: "Import Army List" };

export default function ImportArmyListPage() {
  return <ImportArmyListClient />;
}
