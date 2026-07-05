#!/usr/bin/env node
import assert from "node:assert/strict";
import { compileForRequire } from "./compile-ts.mjs";

const [
  activeUniverseState,
  activeContextMatching,
  chronicleTypes,
  worldQuiz,
  gameSystems,
] = compileForRequire([
  "lib/active-universe-state.ts",
  "lib/active-context-matching.ts",
  "lib/chronicle/types.ts",
  "lib/world-quiz.ts",
  "lib/game-systems.ts",
]);

const {
  DEFAULT_ACTIVE_UNIVERSE_STATE,
  parseActiveUniverseState,
  applyRealmSelection,
  applyGameSelection,
} = activeUniverseState;

const {
  matchesActiveUniverseContext,
  venueMatchesActiveContext,
  venueContextRelevance,
  venuePreferredRealmKey,
  eventMatchesActiveContext,
} = activeContextMatching;

const { bannerHierarchy, filterBannersForActiveContext } = chronicleTypes;
const { FIND_YOUR_WORLD, scoreWorldAnswers } = worldQuiz;
const { GAME_SYSTEM_KEYS, GAME_SYSTEMS } = gameSystems;

// ---------------------------------------------------------------------------
// lib/active-universe-state.ts
// ---------------------------------------------------------------------------

assert.deepEqual(parseActiveUniverseState(null), DEFAULT_ACTIVE_UNIVERSE_STATE);
assert.deepEqual(parseActiveUniverseState(undefined), DEFAULT_ACTIVE_UNIVERSE_STATE);
assert.deepEqual(parseActiveUniverseState("not json{"), DEFAULT_ACTIVE_UNIVERSE_STATE);
assert.deepEqual(
  parseActiveUniverseState(JSON.stringify({ universeKey: "not-a-universe", realmKey: "not-a-realm", gameKey: "not-a-game" })),
  DEFAULT_ACTIVE_UNIVERSE_STATE
);
assert.deepEqual(
  parseActiveUniverseState(JSON.stringify({ universeKey: "warhammer", realmKey: "age-of-sigmar", gameKey: "warcry" })),
  { universeKey: "warhammer", realmKey: "age-of-sigmar", gameKey: "warcry" }
);

// Selecting a realm clears any specific game.
assert.deepEqual(
  applyRealmSelection({ universeKey: "warhammer", realmKey: null, gameKey: "warcry" }, "the-old-world"),
  { universeKey: "warhammer", realmKey: "the-old-world", gameKey: null }
);
// "All Warhammer" is realmKey: null, and is itself a valid selection.
assert.deepEqual(
  applyRealmSelection({ universeKey: "warhammer", realmKey: "age-of-sigmar", gameKey: "warcry" }, null),
  { universeKey: "warhammer", realmKey: null, gameKey: null }
);

// Selecting a game pins its realm.
assert.deepEqual(
  applyGameSelection({ universeKey: "warhammer", realmKey: null, gameKey: null }, "necromunda"),
  { universeKey: "warhammer", realmKey: "warhammer-40k", gameKey: "necromunda" }
);
// Clearing the game (null) leaves the active realm untouched.
assert.deepEqual(
  applyGameSelection({ universeKey: "warhammer", realmKey: "horus-heresy", gameKey: "adeptus-titanicus" }, null),
  { universeKey: "warhammer", realmKey: "horus-heresy", gameKey: null }
);

console.log("active-universe-state: parse + realm/game transitions passed");

// ---------------------------------------------------------------------------
// lib/active-context-matching.ts — the canonical matching layer
// ---------------------------------------------------------------------------

const allWarhammer = { realmKey: null, gameKey: null };
const aosActive = { realmKey: "age-of-sigmar", gameKey: null };
const warcryActive = { realmKey: "age-of-sigmar", gameKey: "warcry" };

// "All Warhammer" always matches, mapped or not.
assert.equal(matchesActiveUniverseContext({ realmKey: "the-old-world" }, allWarhammer), true);
assert.equal(matchesActiveUniverseContext({}, allWarhammer), true);

// A specific realm matches its own items and rejects other realms.
assert.equal(matchesActiveUniverseContext({ realmKey: "age-of-sigmar" }, aosActive), true);
assert.equal(matchesActiveUniverseContext({ realmKey: "horus-heresy" }, aosActive), false);
// gameKey implies its realm even without an explicit realmKey.
assert.equal(matchesActiveUniverseContext({ gameKey: "warcry" }, aosActive), true);
assert.equal(matchesActiveUniverseContext({ gameKey: "necromunda" }, aosActive), false);

// Unknown items (no hierarchy at all) are included by default (graceful),
// excluded only when a caller explicitly opts out.
assert.equal(matchesActiveUniverseContext({}, aosActive), true);
assert.equal(matchesActiveUniverseContext({}, aosActive, { onUnknown: false }), false);

// A specific active game only matches that exact game.
assert.equal(matchesActiveUniverseContext({ gameKey: "warcry" }, warcryActive), true);
assert.equal(matchesActiveUniverseContext({ gameKey: "age-of-sigmar" }, warcryActive), false);
assert.equal(matchesActiveUniverseContext({}, warcryActive), true); // unknown, graceful default

// eventMatchesActiveContext is the same generic matcher, ready for a future
// Events/Campaigns feature that carries a gameKey/realmKey.
assert.equal(eventMatchesActiveContext({ gameKey: "warcry" }, aosActive), true);

console.log("active-context-matching: generic matcher passed");

// ---------------------------------------------------------------------------
// Venues — free-text supported_game_systems resolved via alias/name lookup
// ---------------------------------------------------------------------------

const boardGameCafe = { supported_game_systems: ["Board games", "Magic: The Gathering"] };
const aosVenueNoColon = { supported_game_systems: ["Warhammer 40,000", "Warhammer Age of Sigmar"] };
const shorthand40k = { supported_game_systems: ["40k", "Miniatures wargames"] };
const oldWorldOnly = { supported_game_systems: ["Warhammer: The Old World"] };

// Unmapped venues are never hidden — they match every context.
assert.equal(venueMatchesActiveContext(boardGameCafe, allWarhammer), true);
assert.equal(venueMatchesActiveContext(boardGameCafe, aosActive), true);
assert.equal(venueContextRelevance(boardGameCafe, aosActive), 1);

// Free-text label variants (with/without colon) resolve to the same realm.
assert.equal(venueMatchesActiveContext(aosVenueNoColon, aosActive), true);
assert.equal(venueContextRelevance(aosVenueNoColon, aosActive), 2);

// Shorthand alias ("40k") resolves to the Warhammer 40,000 realm.
assert.equal(venueMatchesActiveContext(shorthand40k, { realmKey: "warhammer-40k", gameKey: null }), true);
assert.equal(venueContextRelevance(shorthand40k, aosActive), 0); // explicit mismatch

// A venue mapped only to a different realm doesn't match, but is still
// available (never hidden) — callers choose to hide via matches*, or just
// deprioritize via the relevance tier.
assert.equal(venueMatchesActiveContext(oldWorldOnly, aosActive), false);
assert.equal(venueMatchesActiveContext(oldWorldOnly, { realmKey: "the-old-world", gameKey: null }), true);

// Discord CTA personalization: prefers the active realm when the venue
// supports it; falls back to the venue's one unambiguous realm; refuses to
// guess when there are multiple realms and none is active.
assert.equal(venuePreferredRealmKey(aosVenueNoColon, aosActive), "age-of-sigmar");
assert.equal(venuePreferredRealmKey(oldWorldOnly, allWarhammer), "the-old-world");
assert.equal(venuePreferredRealmKey(aosVenueNoColon, allWarhammer), undefined);
assert.equal(venuePreferredRealmKey(boardGameCafe, allWarhammer), undefined);

console.log("active-context-matching: venue matching passed");

// ---------------------------------------------------------------------------
// lib/chronicle/types.ts — bannerHierarchy + Hall of Banners filtering
// ---------------------------------------------------------------------------

assert.deepEqual(bannerHierarchy({ gameSystemKey: "warhammer-40k" }), {
  universeKey: "warhammer",
  realmKey: "warhammer-40k",
});
assert.equal(bannerHierarchy({ gameSystemKey: "battletech" }), undefined);

const banners = [
  { id: "a", gameSystemKey: "warhammer-40k" },
  { id: "b", gameSystemKey: "warhammer-40k" },
  { id: "c", gameSystemKey: "age-of-sigmar" },
];

// "All Warhammer" — every banner, unfiltered.
const allResult = filterBannersForActiveContext(banners, allWarhammer);
assert.equal(allResult.banners.length, 3);
assert.equal(allResult.fellBack, false);

// A realm with mapped banners — filtered to just those.
const aosResult = filterBannersForActiveContext(banners, aosActive);
assert.deepEqual(aosResult.banners.map((b) => b.id), ["c"]);
assert.equal(aosResult.fellBack, false);

// A realm with zero mapped banners — graceful fallback to the full list,
// flagged so the UI can explain what happened instead of a silent dead end.
const oldWorldResult = filterBannersForActiveContext(banners, { realmKey: "the-old-world", gameKey: null });
assert.equal(oldWorldResult.banners.length, 3);
assert.equal(oldWorldResult.fellBack, true);

console.log("chronicle/types: bannerHierarchy + Hall of Banners filtering passed");

// ---------------------------------------------------------------------------
// lib/world-quiz.ts — realm as a soft weighting signal, never a filter
// ---------------------------------------------------------------------------

const firstOptionAnswers = FIND_YOUR_WORLD.questions.map(() => 0);
const baseScores = scoreWorldAnswers(firstOptionAnswers);
const boostedScores = scoreWorldAnswers(firstOptionAnswers, { preferredRealmKey: "warhammer-40k" });

let sawABoostedSystem = false;
for (const key of GAME_SYSTEM_KEYS) {
  const system = GAME_SYSTEMS[key];
  if (system.realmKey === "warhammer-40k") {
    assert.equal(boostedScores[key], baseScores[key] + 1, `expected ${key} to get the realm bonus`);
    sawABoostedSystem = true;
  } else {
    assert.equal(boostedScores[key], baseScores[key], `expected ${key} to be unaffected by an unrelated realm`);
  }
}
assert.equal(sawABoostedSystem, true, "expected at least one warhammer-40k system to receive the bonus");

// No preferred realm at all leaves scores untouched.
assert.deepEqual(scoreWorldAnswers(firstOptionAnswers, {}), baseScores);
assert.deepEqual(scoreWorldAnswers(firstOptionAnswers), baseScores);

console.log("world-quiz: realm soft-weighting passed (nudges, never filters)");

console.log("active context validation passed");
