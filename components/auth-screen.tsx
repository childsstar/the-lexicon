import Link from "next/link";
import { LexiconMark } from "@/components/icons";

/** Shared centered frame for the sign-in / sign-up pages. */
export default function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-16">
      <header className="flex h-16 items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text transition-colors hover:text-gold-300"
        >
          <LexiconMark className="h-6 w-6 text-gold-400" />
          <span className="font-display text-lg font-semibold tracking-wide">
            The Lexicon
          </span>
        </Link>
      </header>

      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="font-display text-3xl font-semibold text-text">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {subtitle}
        </p>
        <div className="gilded-rule mt-5 mb-7" />
        {children}
      </div>
    </div>
  );
}
