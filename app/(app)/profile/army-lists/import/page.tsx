import { redirect } from "next/navigation";

// "Import Army List" was folded into the "Muster an Army" flow — this
// route is kept so old links/bookmarks still land somewhere useful.
export default function ImportArmyListRedirectPage() {
  redirect("/armies/muster");
}
