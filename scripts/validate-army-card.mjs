import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const card = readFileSync(new URL("../components/army-card.tsx", import.meta.url), "utf8");
const armiesClient = readFileSync(new URL("../app/(app)/armies/armies-client.tsx", import.meta.url), "utf8");
const heraldry = readFileSync(new URL("../components/faction-heraldry.tsx", import.meta.url), "utf8");

// Part 6 — the army card must show the faction's heraldry, name, faction,
// game system, points, datasheet count, last updated, and visibility/lock
// status, and link to the army's detail page.
assert.match(card, /import FactionHeraldry from "@\/components\/faction-heraldry"/, "army card should render the shared faction heraldry");
assert.match(card, /<FactionHeraldry faction=\{army\.faction\}/, "army card should pass the army's own faction to the heraldry");
assert.match(card, /army\.name/, "army card should show the army name");
assert.match(card, /army\.faction/, "army card should show the faction");
assert.match(card, /army\.game_system/, "army card should show the game system");
assert.match(card, /army\.points_total/, "army card should show points total");
assert.match(card, /army\.datasheet_count/, "army card should show datasheet count");
assert.match(card, /relativeTime\(army\.updated_at\)/, "army card should show when the army was last updated");
assert.match(card, /statusLabel\(army\)/, "army card should show visibility/lock status");
assert.match(card, /href=\{`\/armies\/\$\{army\.id\}`\}/, "army card should link to the army's detail page");

// The heraldry must degrade gracefully — a faction without a Hall of
// Banners entry still renders a placeholder rather than a broken mark, and
// the artwork must come from the same BannerArt pipeline the Hall uses.
assert.match(heraldry, /resolveFactionHeraldry/, "faction heraldry should resolve factions through the shared registry");
assert.match(heraldry, /import BannerArt from "@\/components\/chronicle\/banner-art"/, "faction heraldry should reuse the Hall of Banners artwork pipeline");
assert.match(heraldry, /ShieldIcon/, "faction heraldry should render a placeholder for factions without a banner");

// Part 6 — the index needs both CTAs and must read real, user-scoped data
// (not placeholder examples) so it reflects what's actually been mustered.
assert.match(armiesClient, /from\("army_lists"\)/, "the armies index should query real army_lists rows");
assert.match(armiesClient, /\.eq\("user_id", user!\.id\)/, "the armies index should be scoped to the signed-in user");
assert.match(armiesClient, /href="\/armies\/muster"/, "the armies index should offer a Muster New Army CTA");
assert.match(armiesClient, /No armies mustered yet/, "an empty muster roll should show a dedicated empty state, not a blank page");
assert.doesNotMatch(armiesClient, /example-crusaders|example-swarm/, "the armies index should no longer show hardcoded placeholder examples");

console.log("Army card/index validation passed");
