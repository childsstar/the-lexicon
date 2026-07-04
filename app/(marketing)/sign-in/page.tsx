import type { Metadata } from "next";
import AuthScreen from "@/components/auth-screen";
import SignInForm from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthScreen
      title="Welcome back, Commander"
      subtitle="Sign in to open your chronicle — your armies, battles, and campaigns await."
    >
      <SignInForm initialError={error} />
    </AuthScreen>
  );
}
