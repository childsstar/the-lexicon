import type { Metadata } from "next";
import VenueForm from "./venue-form";

export const metadata: Metadata = { title: "Add a Venue" };

export default function NewVenuePage() {
  return <VenueForm />;
}
