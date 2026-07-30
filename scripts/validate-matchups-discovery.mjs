import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const dashboard = read("app/(app)/dashboard/dashboard-client.tsx");
const briefing = read("components/onboarding/travelers-briefing.tsx");
const onboarding = read("components/onboarding/passport-onboarding.tsx");
const profile = read("app/(app)/profile/profile-client.tsx");
const armyDetail = read("app/(app)/armies/[id]/army-detail-client.tsx");
const muster = read("app/(app)/armies/muster/muster-army-client.tsx");

assert.match(dashboard, /href="\/armies\/matchups"/);
assert.match(dashboard, /Prepare a matchup/);
assert.match(dashboard, /Start or join a sealed army-list exchange before a game\./);

assert.match(onboarding, /\.from\("army_lists"\)[\s\S]*\.eq\("user_id", userId\)[\s\S]*\.limit\(1\)/);
assert.match(onboarding, /hasArmy=\{hasArmy\}/);
assert.match(briefing, /hasArmy[\s\S]*label: "Prepare a matchup"[\s\S]*href: "\/armies\/matchups"/);
assert.match(briefing, /banner\.bannerName[\s\S]*label: "Muster your first army"/);
assert.match(briefing, /Add an army to prepare sealed matchups and future games\./);
assert.match(briefing, /banner\.bannerName[\s\S]*label: "Browse the Hall of Banners"/, "no-faction briefing should not invent a Matchups action");

assert.match(profile, /armyIds\.length > 0[\s\S]*Prepare a matchup/);
assert.match(profile, /armyIds\.length === 1 \? `\/armies\/matchups\/new\?armyId=\$\{armyIds\[0\]\}` : "\/armies\/matchups"/);
assert.match(profile, /armyIds\.length === 0 && Boolean\(profile\?\.primary_factions\?\.length\)[\s\S]*Muster your first army/);
assert.equal((armyDetail.match(/Prepare a matchup/g) ?? []).length, 1, "army detail should contain one Matchups action");
assert.match(armyDetail, /\/armies\/matchups\/new\?armyId=\$\{army\.id\}/);
assert.match(muster, /router\.push\(`\/armies\/\$\{payload\.armyList\.id\}`\)/, "successful imports should still redirect to army detail");

console.log("Contextual Matchups discovery validation passed.");
