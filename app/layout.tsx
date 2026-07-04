import type { Metadata, Viewport } from "next";
import ThemeScript from "@/components/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thelexicon.games"),
  title: {
    default: "The Lexicon — Your tabletop story starts here",
    template: "%s · The Lexicon",
  },
  description:
    "The Lexicon is a community platform for tabletop wargamers. Discover your faction, muster your army, find your community, and record the battles that become your legend.",
  openGraph: {
    title: "The Lexicon",
    description:
      "Discover your faction, muster your army, find your community, and record the battles that become your legend.",
    url: "https://thelexicon.games",
    siteName: "The Lexicon",
    type: "website",
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
