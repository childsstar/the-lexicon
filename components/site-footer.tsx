import Link from "next/link";
import ThemeSelector from "@/components/theme-selector";

const footerLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/contact", label: "Contact" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border-muted px-5 py-8 text-center text-xs text-text-subtle">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4">
        <nav
          aria-label="Legal and support"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-text-muted transition-colors hover:text-gold-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeSelector />
        <div className="space-y-2 leading-relaxed">
          <p className="font-medium text-text-muted">
            The Lexicon is currently in public beta.
          </p>
          <p>
            The Lexicon · thelexicon.games — an independent community platform
            for tabletop wargamers.
          </p>
          <p>
            Not affiliated with or endorsed by Games Workshop or any game
            publisher. All game names belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
