import { redirect } from "next/navigation";

// Army list detail pages now live at /armies/[id] as part of the
// "Muster an Army" overhaul — this route is kept so old links/bookmarks
// still land on the right army.
export default async function ArmyListDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/armies/${id}`);
}
