import type { Metadata, Viewport } from "next";
import ThemeScript from "@/components/theme-script";
import "./globals.css";

const siteDescription =
  "Discover your tabletop banner. Find your community. Explore game stores, clubs, and events around the world.";

const ogImage = {
  url: "https://thelexicon.games/og-card.png",
  width: 1200,
  height: 630,
  alt: "The Lexicon — Find Your Banner",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thelexicon.games"),
  title: {
    default: "The Lexicon",
    template: "%s · The Lexicon",
  },
  applicationName: "The Lexicon",
  description: siteDescription,
  openGraph: {
    title: "The Lexicon",
    description: siteDescription,
    url: "https://thelexicon.games",
    siteName: "The Lexicon",
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Lexicon",
    description: siteDescription,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0a08" },
    { media: "(prefers-color-scheme: light)", color: "#f3ebdd" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="atmosphere min-h-dvh">{children}</body>
    </html>
  );
}
