"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { isProfileComplete } from "@/lib/profiles";
import { LexiconMark } from "@/components/icons";

function CenteredScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <CenteredScreen>
      <LexiconMark className="h-9 w-9 animate-pulse text-gold-500" />
      <p className="mt-4 text-sm text-parchment-700">Opening the Lexicon…</p>
    </CenteredScreen>
  );
}

/**
 * Client-side gate for the app shell:
 *  - not signed in            → /sign-in
 *  - signed in, no complete
 *    profile (username +
 *    availability)            → /profile/setup
 *  - otherwise                → render the page
 */
export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, configError } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const needsSetup = !isProfileComplete(profile);
  const onSetupPage = pathname === "/profile/setup";

  useEffect(() => {
    if (loading || configError) return;
    if (!user) {
      router.replace("/sign-in");
    } else if (needsSetup && !onSetupPage) {
      router.replace("/profile/setup");
    }
  }, [loading, configError, user, needsSetup, onSetupPage, router]);

  if (configError) {
    return (
      <CenteredScreen>
        <LexiconMark className="h-9 w-9 text-ember-400" />
        <h1 className="mt-4 font-display text-xl font-semibold text-parchment-100">
          The Lexicon isn&apos;t configured yet
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-parchment-500">
          {configError}
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-medium text-gold-300 hover:text-gold-200"
        >
          Back to the front page
        </Link>
      </CenteredScreen>
    );
  }

  if (loading || !user || (needsSetup && !onSetupPage)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
