import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const nav = read("components/armies-section-nav.tsx");
const armies = read("app/(app)/armies/armies-client.tsx");
const matchups = read("app/(app)/armies/matchups/matchups-client.tsx");
const newMatchup = read("app/(app)/armies/matchups/new/new-matchup-client.tsx");
const armyDetail = read("app/(app)/armies/[id]/army-detail-client.tsx");
const dashboard = read("app/(app)/dashboard/dashboard-client.tsx");

assert.match(nav, /aria-label="Armies sections"/, "section navigation should have an accessible name");
assert.match(nav, /label: "My Armies"/);
assert.match(nav, /label: "Matchups"/);
assert.match(nav, /path === "\/armies"/, "My Armies should be active only on its index");
assert.match(nav, /path\.startsWith\("\/armies\/matchups"\)/, "Matchups should remain active on child routes");
assert.match(nav, /aria-current=\{active \? "page"/, "active destination should be announced");
assert.match(nav, /w-full[^"]*sm:w-auto/, "the same navigation should adapt across mobile and desktop");
assert.match(armies, /<ArmiesSectionNav \/>/);
assert.match(matchups, /<ArmiesSectionNav \/>/);
assert.doesNotMatch(armies, /Prep a sealed matchup/, "the old duplicate discovery link should be removed");
assert.match(dashboard, /href="\/armies\/matchups"[\s\S]*Prepare a matchup/);
assert.match(newMatchup, /href="\/armies\/muster"[\s\S]*Muster an army/);
assert.match(armyDetail, /href=\{`\/armies\/matchups\/new\?armyId=\$\{army\.id\}`\}/);
assert.match(newMatchup, /searchParams\.get\("armyId"\)/);
assert.match(newMatchup, /army\.id === presetArmyId/, "a valid preset army should be recognized without reselection");

console.log("Matchups navigation validation passed.");
