import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const card = readFileSync(new URL("../components/army-card.tsx", import.meta.url), "utf8");
const armiesClient = readFileSync(new URL("../app/(app)/armies/armies-client.tsx", import.meta.url), "utf8");
const sigil = readFileSync(new URL("../components/army-sigil.tsx", import.meta.url), "utf8");

// Part 6 — the army card must show a sigil, name, faction, game system,
// points, datasheet count, last updated, and visibility/lock status, and
// link to the army's detail page.
assert.match(card, /import ArmySigil from "@\/components\/army-sigil"/, "army card should render the visual identity sigil");
assert.match(card, /<ArmySigil identity=\{army\.visual_identity_json\}/, "army card should pass the army's own visual identity to the sigil");
assert.match(card, /army\.name/, "army card should show the army name");
assert.match(card, /army\.faction/, "army card should show the faction");
assert.match(card, /army\.game_system/, "army card should show the game system");
assert.match(card, /army\.points_total/, "army card should show points total");
assert.match(card, /army\.datasheet_count/, "army card should show datasheet count");
assert.match(card, /relativeTime\(army\.updated_at\)/, "army card should show when the army was last updated");
assert.match(card, /statusLabel\(army\)/, "army card should show visibility/lock status");
assert.match(card, /href=\{`\/armies\/\$\{army\.id\}`\}/, "army card should link to the army's detail page");

// The sigil must degrade gracefully — an army without an identity yet
// still renders a placeholder rather than crashing the card.
assert.match(sigil, /if \(!identity\)/, "the sigil component should handle a missing visual identity");

// Part 6 — the index needs both CTAs and must read real, user-scoped data
// (not placeholder examples) so it reflects what's actually been mustered.
assert.match(armiesClient, /from\("army_lists"\)/, "the armies index should query real army_lists rows");
assert.match(armiesClient, /\.eq\("user_id", user!\.id\)/, "the armies index should be scoped to the signed-in user");
assert.match(armiesClient, /href="\/armies\/muster"/, "the armies index should offer a Muster New Army CTA");
assert.match(armiesClient, /No armies mustered yet/, "an empty muster roll should show a dedicated empty state, not a blank page");
assert.doesNotMatch(armiesClient, /example-crusaders|example-swarm/, "the armies index should no longer show hardcoded placeholder examples");

console.log("Army card/index validation passed");
