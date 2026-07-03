import type { Metadata } from "next";
import OnboardingPath from "@/components/onboarding-path";
import {
  ShieldIcon,
  CalendarIcon,
  MapPinIcon,
  SwordsIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "Experienced Player" };

export default function ExperiencedOnboardingPage() {
  return (
    <OnboardingPath
      eyebrow="Experienced Player"
      title="Your armies deserve a chronicle."
      intro="You've fought the battles — now give them a record. Four steps to bring your existing forces into The Lexicon and find your next opponent."
      steps={[
        {
          title: "Import or add armies",
          body: "Bring every force you field into one roster — faction, game system, and the state of the paint queue.",
          icon: <ShieldIcon className="h-5 w-5" />,
        },
        {
          title: "Set availability and play style",
          body: "Weeknight skirmishes or weekend campaigns? Casual narrative or hard-fought competitive? Say how you play so the right opponents find you.",
          icon: <CalendarIcon className="h-5 w-5" />,
        },
        {
          title: "Find nearby players",
          body: "See who's mustering in your area, what they play, and when they're free to throw dice.",
          icon: <MapPinIcon className="h-5 w-5" />,
        },
        {
          title: "Log your next battle",
          body: "Record the matchup, the outcome, and the moment worth retelling. Every battle adds a page to your legend.",
          icon: <SwordsIcon className="h-5 w-5" />,
        },
      ]}
    />
  );
}
