import type { TacticalSummary, UnitTacticalNote } from "@/lib/army-lists/tactical-overview";

export default function TacticalOverviewPanel({ tactical }: { tactical: TacticalSummary }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">What this army can field</p>
      <p className="mt-2 text-sm leading-relaxed text-text-soft">{tactical.broad_role}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextList title="Likely strengths" items={tactical.strengths} tone="gold" />
        <TextList title="Likely weaknesses" items={tactical.weaknesses} tone="ember" />
      </div>

      {tactical.watch_out_for.length > 0 && (
        <div className="mt-5 rounded-md border border-gold-700/40 bg-gold-950/20 p-4">
          <p className="text-sm font-semibold text-gold-200">Watch out for</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
            {tactical.watch_out_for.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ThreatGroup title="Fast threats" notes={tactical.fast_threats} />
        <ThreatGroup title="Durable anchors" notes={tactical.durable_anchors} />
        <ThreatGroup title="Ranged threats" notes={tactical.ranged_threats} />
        <ThreatGroup title="Melee threats" notes={tactical.melee_threats} />
        <ThreatGroup title="Scoring/objective units" notes={tactical.scoring_units} />
        <ThreatGroup title="Key characters" notes={tactical.key_characters} />
        <ThreatGroup title="Cavalry & chariots" notes={tactical.cavalry_and_chariots ?? []} />
        <ThreatGroup title="War machines" notes={tactical.war_machines ?? []} />
        <ThreatGroup title="Monsters" notes={tactical.monsters ?? []} />
        <ThreatGroup title="Magic users" notes={tactical.magic_users ?? []} />
      </div>
    </div>
  );
}

function TextList({ title, items, tone }: { title: string; items: string[]; tone: "gold" | "ember" }) {
  const dotClass = tone === "gold" ? "bg-gold-500" : "bg-ember-500";
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThreatGroup({ title, notes }: { title: string; notes: UnitTacticalNote[] }) {
  if (!notes.length) return null;
  return (
    <div className="rounded-md border border-border-muted bg-surface/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-text-soft">
        {notes.map((note) => (
          <li key={note.name}>
            {note.name}
            {note.points ? <span className="text-text-subtle"> · {note.points} pts</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
