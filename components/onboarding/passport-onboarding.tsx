"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Frame } from "@/components/chronicle/frame";
import { LexiconMark } from "@/components/icons";
import DiscoverWorldStep from "@/components/onboarding/discover-world-step";
import ChooseBannerStep, {
  type BannerSelection,
} from "@/components/onboarding/choose-banner-step";
import CompletePassportStep from "@/components/onboarding/complete-passport-step";
import TravelersBriefing from "@/components/onboarding/travelers-briefing";
import type { ProfileFormDefaults } from "@/components/profile-form";
import type { Venue } from "@/lib/venues";

type Step = "arrival" | "identity" | "discover" | "banner" | "passport" | "briefing";

const EMPTY_BANNER: BannerSelection = {
  bannerId: null,
  bannerName: null,
  gameSystem: null,
  primaryFaction: null,
  bannerIds: [],
  gameSystems: [],
  primaryFactions: [],
};

function ArrivalStep({ hasDiscord, onDone }: { hasDiscord: boolean; onDone: () => void }) {
  const [visible, setVisible] = useState(1);

  const items = hasDiscord
    ? ["Discord identity connected", "Profile recovered", "Preparing your Tabletop Passport"]
    : ["Account created", "Starting with a clean slate", "Preparing your Tabletop Passport"];

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(2), 550),
      setTimeout(() => setVisible(3), 1150),
      setTimeout(onDone, 2500),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <LexiconMark className="h-12 w-12 animate-breathe text-gold-400" />
      <p className="mt-8 font-display text-2xl font-semibold text-text animate-rise">
        Welcome to The Lexicon.
      </p>
      <p className="mt-2 text-sm text-text-muted animate-rise">
        The Archivists are preparing your Tabletop Passport…
      </p>
      <div className="mt-8 space-y-3 text-left">
        {items.slice(0, visible).map((item) => (
          <p
            key={item}
            className="animate-rise flex items-center gap-2 text-sm text-text-soft"
          >
            <span className="text-gold-400">✓</span>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function IdentityStep({
  displayName,
  discordUsername,
  avatarUrl,
  onContinue,
}: {
  displayName: string;
  discordUsername: string | null;
  avatarUrl: string | null;
  onContinue: () => void;
}) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-20 w-20 rounded-full border-2 border-gold-500/60 object-cover animate-rise"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-500/60 bg-surface font-display text-3xl font-semibold text-gold-300 animate-rise">
          {initial}
        </div>
      )}
      <p className="mt-6 font-display text-3xl font-semibold text-text animate-rise">
        Welcome, {displayName}.
      </p>
      <p className="mt-2 text-sm text-text-muted animate-rise">
        Your Tabletop Passport has been created.
      </p>
      {discordUsername && (
        <p className="mt-3 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-subtle animate-rise">
          @{discordUsername}
        </p>
      )}
      <button
        onClick={onContinue}
        className="mt-10 w-full max-w-xs rounded-md bg-gold-500 px-8 py-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
      >
        Open your Tabletop Passport
      </button>
    </div>
  );
}

export default function PassportOnboarding({
  userId,
  importedDefaults,
  onSaved,
}: {
  userId: string;
  importedDefaults?: ProfileFormDefaults;
  /** Called once the passport form saves successfully — should refresh the
   * cached profile so AuthGuard sees the completed profile once onboarding
   * finishes. */
  onSaved: () => Promise<void> | void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("arrival");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bannerSelection, setBannerSelection] = useState<BannerSelection>(EMPTY_BANNER);

  const displayName =
    importedDefaults?.display_name?.split(" ")[0] ??
    importedDefaults?.discord_username ??
    "traveler";

  const backForStep = (target: Step) => () => setStep(target);

  switch (step) {
    case "arrival":
      return (
        <Frame>
          <ArrivalStep
            hasDiscord={Boolean(importedDefaults)}
            onDone={() => setStep("identity")}
          />
        </Frame>
      );

    case "identity":
      return (
        <Frame>
          <IdentityStep
            displayName={displayName}
            discordUsername={importedDefaults?.discord_username ?? null}
            avatarUrl={importedDefaults?.avatar_url ?? null}
            onContinue={() => setStep("discover")}
          />
        </Frame>
      );

    case "discover":
      return (
        <Frame onBack={backForStep("identity")} backLabel="Back">
          <DiscoverWorldStep
            onContinue={(venue) => {
              setSelectedVenue(venue);
              setStep("banner");
            }}
            onSkip={() => {
              setSelectedVenue(null);
              setStep("banner");
            }}
          />
        </Frame>
      );

    case "banner":
      return (
        <Frame onBack={backForStep("discover")} backLabel="Back">
          <ChooseBannerStep
            onContinue={(selection) => {
              setBannerSelection(selection);
              setStep("passport");
            }}
            onSkip={() => {
              setBannerSelection(EMPTY_BANNER);
              setStep("passport");
            }}
          />
        </Frame>
      );

    case "passport":
      return (
        <Frame onBack={backForStep("banner")} backLabel="Back">
          <CompletePassportStep
            userId={userId}
            importedDefaults={importedDefaults}
            bannerSelection={bannerSelection}
            venueId={selectedVenue?.id ?? null}
            onSaved={() => {
              void Promise.resolve(onSaved()).then(() => setStep("briefing"));
            }}
          />
        </Frame>
      );

    case "briefing":
      return (
        <Frame>
          <TravelersBriefing
            venue={selectedVenue}
            banner={bannerSelection}
            onEnter={() => router.replace("/dashboard")}
          />
        </Frame>
      );
  }
}
