import type { Metadata } from "next";
import OnboardingPath from "@/components/onboarding-path";
import {
  CompassIcon,
  BookIcon,
  ShieldIcon,
  DiceIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "New to the Hobby" };

export default function NewPlayerOnboardingPage() {
  return (
    <OnboardingPath
      eyebrow="New to the Hobby"
      title="Every legend has a first page."
      intro="Four steps from curious newcomer to your first game on the table. Take them at your own pace — the hobby is a long road, and it's a good one."
      steps={[
        {
          title: "Discover your faction",
          body: "Zealous crusaders, cunning raiders, ancient empires, endless swarms — explore the archetypes and find the force that feels like yours.",
          icon: <CompassIcon className="h-5 w-5" />,
          href: "/chronicles/find-your-banner",
          hrefLabel: "Find Your Banner",
        },
        {
          title: "Learn the lore",
          body: "Every army carries a history. Get the story behind your faction so your force fights for something.",
          icon: <BookIcon className="h-5 w-5" />,
        },
        {
          title: "Muster your first army",
          body: "Start small: a leader and a handful of units. Track what you own, what's built, and what's painted as your force grows.",
          icon: <ShieldIcon className="h-5 w-5" />,
        },
        {
          title: "Find your first game",
          body: "Discover welcoming venues and players near you who enjoy teaching. Your first battle is closer than you think.",
          icon: <DiceIcon className="h-5 w-5" />,
        },
      ]}
    />
  );
}
