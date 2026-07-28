import FactionHeraldry from "@/components/faction-heraldry";
import { GAME_SYSTEMS } from "@/lib/game-data";
import { resolveFactionHeraldry } from "@/lib/chronicle/faction-heraldry";

// Visual QA gallery for the shared faction heraldry — every curated faction
// of every game system, rendered through the same component the army cards,
// matchups, and pickers use. Factions without a banner show the placeholder.

const SHOWCASE_SYSTEMS = new Set([
  "Warhammer 40,000",
  "Warhammer: Age of Sigmar",
  "Warhammer: The Old World",
]);

export default function DebugHeraldryPage() {
  const systems = GAME_SYSTEMS.filter(
    (system) => SHOWCASE_SYSTEMS.has(system.name) && system.factions.length > 0
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-5 py-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Faction heraldry gallery</h1>
        <p className="mt-1 text-sm text-text-muted">
          Every curated faction rendered through the shared FactionHeraldry component, at all three sizes.
        </p>
        <div className="mt-4 flex items-center gap-6">
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} className="flex items-center gap-2">
              <FactionHeraldry faction="Tyranids" size={size} />
              <span className="text-xs text-text-subtle">{size}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <FactionHeraldry faction="Completely Unknown Faction" size="md" />
            <span className="text-xs text-text-subtle">placeholder</span>
          </div>
        </div>
      </div>

      {systems.map((system) => (
        <section key={system.name}>
          <h2 className="font-display text-lg font-semibold text-text">{system.name}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {system.factions.map((faction) => {
              const banner = resolveFactionHeraldry(faction);
              return (
                <div key={faction} className="card flex items-center gap-3 p-3">
                  <FactionHeraldry faction={faction} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{faction}</p>
                    <p className="truncate text-xs text-text-subtle">
                      {banner ? banner.name : "No banner yet — placeholder"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
