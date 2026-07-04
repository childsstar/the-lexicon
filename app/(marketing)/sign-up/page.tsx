import type { Metadata } from "next";
import AuthScreen from "@/components/auth-screen";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthScreen
      title="Begin your chronicle"
      subtitle="Create your account, forge your commander identity, and start recording the battles that become your legend."
    >
      <SignUpForm />
    </AuthScreen>
  );
}
