import Link from "next/link";
import type { Metadata } from "next";
import { BANNERS } from "@/lib/chronicle/banners";
import BannerArt from "@/components/chronicle/banner-art";
import { ArrowLeftIcon, LexiconMark } from "@/components/icons";

export const metadata: Metadata = {
  title: "The Hall of Banners",
  description:
    "Every banner in The Lexicon — twelve callings across the tabletop, each with its own chronicle. Which one answers yours?",
};

export default function HallOfBannersPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 pb-16">
      <header className="flex h-16 items-center justify-between">
        <Link
          href="/chronicles"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-parchment-700 transition-colors hover:text-gold-300"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Chronicles
        </Link>
        <LexiconMark className="h-6 w-6 text-gold-500" />
      </header>

      <div className="pt-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          The Lexicon
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-parchment-100">
          The Hall of Banners
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-parchment-500">
          Twelve callings, each with its own plate in the Lexicon&apos;s
          pages. The hall grows as new banners are chronicled.
        </p>
        <div className="gilded-rule mx-auto mt-5 max-w-xs" />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {BANNERS.map((banner, i) => (
          <div key={banner.id} className="card overflow-hidden">
            <BannerArt
              palette={banner.palette}
              bannerId={banner.id}
              className="flex aspect-[4/3] items-end p-4"
            >
              <p className="relative font-display text-xl font-semibold text-white drop-shadow">
                {banner.name}
              </p>
            </BannerArt>
            <div className="p-4">
              <p className="text-xs font-medium text-gold-300">
                {banner.primaryFaction}{" "}
                <span className="text-parchment-700">
                  · {banner.gameSystem}
                </span>
              </p>
              <p className="mt-2 text-sm italic leading-relaxed text-parchment-500">
                “{banner.cardQuote}”
              </p>
              <p className="mt-2 text-[0.65rem] uppercase tracking-widest text-parchment-700">
                Plate {i + 1} of {BANNERS.length}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="font-display text-xl text-parchment-300">
          Which banner answers your call?
        </p>
        <Link
          href="/chronicles/find-your-banner"
          className="mt-5 inline-block rounded-md bg-gold-500 px-8 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
        >
          Find Your Banner
        </Link>
        <p className="mt-3 text-xs text-parchment-700">
          Eight choices. No account needed.
        </p>
      </div>
    </div>
  );
}
