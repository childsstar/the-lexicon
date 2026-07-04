import type { Metadata } from "next";
import ProfileSetupClient from "./setup-client";

export const metadata: Metadata = { title: "Forge your profile" };

export default function ProfileSetupPage() {
  return <ProfileSetupClient />;
}
