import type { Metadata } from "next";
import OnboardingPath from "@/components/onboarding-path";
import {
  CompassIcon,
  BookIcon,
  MapPinIcon,
  ShieldIcon,
  DiceIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "New to the Hobby" };

export default function NewPlayerOnboardingPage() {
  return (
    <OnboardingPath
      eyebrow="New to the Hobby"
      title="Every legend has a first page."
      intro="Five steps from curious newcomer to your first game on the table. Take them at your own pace — the hobby is a long road, and it's a good one."
      steps={[
        {
          title: "Find your world",
          body: "Fantasy or the far future? Elite warbands or grand armies? Seven quick choices recommend the game systems that match how you like to play — no prior knowledge needed, and entirely optional.",
          icon: <MapPinIcon className="h-5 w-5" />,
          href: "/chronicles/find-your-world",
          hrefLabel: "Find Your World",
        },
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
          href: "/chronicles/banners",
          hrefLabel: "Visit the Hall of Banners",
        },
        {
          title: "Muster your first army",
          body: "Start small: a leader and a handful of units. Track what you own, what's built, and what's painted as your force grows.",
          icon: <ShieldIcon className="h-5 w-5" />,
          href: "/armies/muster",
          hrefLabel: "Open the muster",
        },
        {
          title: "Find your first game",
          body: "Discover welcoming venues and players near you who enjoy teaching. Your first battle is closer than you think.",
          icon: <DiceIcon className="h-5 w-5" />,
          href: "/venues",
          hrefLabel: "Browse venues",
        },
      ]}
    />
  );
}
