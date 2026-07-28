import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const sectionNav = read("components/armies-section-nav.tsx");
const armies = read("app/(app)/armies/armies-client.tsx");
const matchups = read("app/(app)/armies/matchups/matchups-client.tsx");
const newMatchup = read("app/(app)/armies/matchups/new/new-matchup-client.tsx");
const matchupDetail = read("app/(app)/armies/matchups/[id]/matchup-detail-client.tsx");
const dashboard = read("app/(app)/dashboard/dashboard-client.tsx");
const armyDetail = read("app/(app)/armies/[id]/army-detail-client.tsx");

assert.match(sectionNav, /aria-label="Armies sections"/, "section links should have an accessible navigation label");
assert.match(sectionNav, /href: "\/armies", label: "My Armies"/, "section navigation should link to My Armies");
assert.match(sectionNav, /href: "\/armies\/matchups", label: "Matchups"/, "section navigation should link to Matchups");
assert.match(sectionNav, /pathname === destination\.href/, "My Armies should use exact route matching");
assert.match(sectionNav, /pathname\.startsWith\(`\$\{destination\.href\}\/`\)/, "Matchups children should keep Matchups active");
assert.match(sectionNav, /aria-current=\{active \? "page" : undefined\}/, "the active section should be announced independently of color");
assert.match(sectionNav, /w-full[\s\S]*sm:w-auto/, "one responsive control should expose the same destinations on mobile and desktop");
assert.match(sectionNav, /focus-visible:ring-2/, "section links should have a visible keyboard focus treatment");

assert.match(armies, /<ArmiesSectionNav \/>/, "the armies index should render section navigation");
assert.match(matchups, /<ArmiesSectionNav \/>/, "the Matchups index should render section navigation");
assert.match(newMatchup, /<ArmiesSectionNav \/>/, "new Matchup should retain section navigation");
assert.match(matchupDetail, /<ArmiesSectionNav \/>/, "Matchup detail should retain section navigation");
assert.doesNotMatch(armies, /Prep a sealed matchup/, "the old duplicate discovery link should be removed");

assert.match(dashboard, /href="\/armies\/matchups"[\s\S]*Prepare a matchup/, "the dashboard should link directly to Matchups");
assert.match(newMatchup, /href="\/armies\/muster"[\s\S]*Muster an army/, "users without armies should have a direct recovery action");

assert.match(armyDetail, /href=\{`\/armies\/matchups\/new\?armyId=\$\{army\.id\}`\}/, "army detail should continue passing the selected army id");
assert.match(newMatchup, /searchParams\.get\("armyId"\)/, "new Matchup should continue reading the selected army id");
assert.match(newMatchup, /armyId === presetArmyId/, "the matching preset army should remain selected");

console.log("Matchups navigation validation passed");
