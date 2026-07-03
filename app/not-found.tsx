import Link from "next/link";
import { LexiconMark } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LexiconMark className="h-10 w-10 text-gold-500" />
      <h1 className="mt-6 font-display text-3xl font-semibold text-parchment-100">
        This page is lost to history
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-parchment-500">
        The chronicle you seek isn&apos;t in The Lexicon. Perhaps it was never
        written — or perhaps it&apos;s yet to be.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md border border-gold-600 px-6 py-3 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
      >
        Return to the front page
      </Link>
    </div>
  );
}
