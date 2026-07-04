import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChronicle, listChronicles } from "@/lib/chronicle";
import ChronicleExperience from "@/components/chronicle/chronicle-experience";
import { LexiconMark } from "@/components/icons";

export function generateStaticParams() {
  return listChronicles().map((entry) => ({ slug: entry.quiz.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getChronicle(slug);
  if (!entry) return {};
  return {
    title: entry.quiz.title,
    description: `${entry.quiz.tagline} A Chronicle of The Lexicon — discover which tabletop banner answers your call. No account needed.`,
    openGraph: {
      title: `${entry.quiz.title} · The Lexicon`,
      description: entry.quiz.invocation,
    },
  };
}

export default async function ChroniclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getChronicle(slug);
  if (!entry) notFound();

  // Only plain data crosses to the client; the generator stays a
  // client-side import until the LLM route handler replaces it.
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <LexiconMark className="h-10 w-10 animate-breathe text-gold-500" />
        </div>
      }
    >
      <ChronicleExperience
        entry={{ quiz: entry.quiz, banners: entry.banners }}
      />
    </Suspense>
  );
}
