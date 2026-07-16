import Link from "next/link";
import { OLD_WORLD_FACTIONS } from "@/lib/game-data";

const actions = [
  ["Choose a banner", "/chronicles/banners", "Mark the faction you play with project-owned heraldry or a generated sigil."],
  ["Muster an army", "/armies/muster", "Name a force and paste a list. Unfamiliar entries remain visible for review."],
  ["Open sealed matchups", "/armies/matchups", "Exchange immutable list snapshots without an early reveal."],
] as const;

export default function OldWorldLandingPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8">
      <section className="card overflow-hidden p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[.28em] text-gold-400">Warhammer · The Old World</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-text sm:text-5xl">Raise your banner. Seal your muster.</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-text-muted">
          Ancient crowns, ambitious cities, mountain holds and wild hosts contest a storied world of uneasy alliances.
          This event-ready Lexicon space helps players identify a faction, preserve a user-authored roster and reveal it
          fairly across the table—without reproducing rules, profiles or publication text.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {actions.map(([title, href, copy]) => <Link key={href} href={href} className="rounded-lg border border-gold-700/40 bg-gold-950/20 p-4 transition hover:border-gold-500"><strong className="text-gold-200">{title}</strong><span className="mt-2 block text-sm leading-6 text-text-muted">{copy}</span></Link>)}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-text-subtle">Faction directory</p><h2 className="mt-1 font-display text-2xl font-semibold text-text">Sixteen banners answer the call</h2></div><span className="text-xs text-text-subtle">Core and legacy welcome</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OLD_WORLD_FACTIONS.map((faction) => <article key={faction.key} className="card p-4"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gold-600/50 bg-gold-950/30 font-display text-lg text-gold-300">{faction.name.charAt(0)}</div><h3 className="font-semibold text-text">{faction.name}</h3><p className="mt-1 text-xs capitalize text-text-subtle">{faction.supportStatus} support · selectable</p></article>)}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["Locations", "Campaigns", "Publications", "Community lore"].map((name) => <div key={name} className="rounded-lg border border-dashed border-border p-5"><p className="font-semibold text-text">{name}</p><p className="mt-2 text-sm text-text-subtle">Coming soon</p></div>)}</section>
      <aside className="rounded-md border border-border bg-surface/60 p-4 text-xs leading-5 text-text-subtle"><strong className="text-text-muted">Unofficial community tool.</strong> The Lexicon is not affiliated with or endorsed by Games Workshop. Warhammer and associated names are used only to identify the game and player-selected factions. Imported lists are user-authored and are not rules-validated.</aside>
    </main>
  );
}
