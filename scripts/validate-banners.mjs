import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const bannersSource = readFileSync(path.join(ROOT, "lib", "chronicle", "banners.ts"), "utf8");
const platesSource = readFileSync(path.join(ROOT, "components", "chronicle", "plates.tsx"), "utf8");
const gameSystemsSource = readFileSync(path.join(ROOT, "lib", "game-systems.ts"), "utf8");

const keysList = gameSystemsSource.match(/GAME_SYSTEM_KEYS = \[([\s\S]*?)\] as const/)?.[1];
if (!keysList) throw new Error("Could not locate GAME_SYSTEM_KEYS in lib/game-systems.ts.");
const allowedGameSystems = new Set([...keysList.matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const allowedTraits = new Set(["valor", "discipline", "cunning", "wonder", "endurance", "wildness"]);
const requiredStringFields = [
  "id",
  "name",
  "gameSystemKey",
  "gameSystem",
  "primaryFaction",
  "personalitySummary",
  "reasoning",
  "chronicleIntro",
  "imagePrompt",
  "cardQuote",
];

const body = bannersSource.match(/export const BANNERS: Banner\[] = \[([\s\S]*?)\];\n\nexport const BANNER_BY_ID/)?.[1];
if (!body) throw new Error("Could not locate BANNERS array.");

const records = [...body.matchAll(/\n  \{[\s\S]*?\n  \},/g)].map((m) => m[0]);
if (records.length === 0) throw new Error("No banner records found.");

const ids = new Set();
const oldWorldFactions = new Set();
for (const [index, record] of records.entries()) {
  for (const field of requiredStringFields) {
    if (!new RegExp(`${field}:\\s*"[^"]+"`).test(record)) {
      throw new Error(`Banner ${index + 1} is missing required string field: ${field}`);
    }
  }

  const id = record.match(/id:\s*"([^"]+)"/)?.[1];
  if (ids.has(id)) throw new Error(`Duplicate banner id: ${id}`);
  ids.add(id);

  const gameSystemKey = record.match(/gameSystemKey:\s*"([^"]+)"/)?.[1];
  if (gameSystemKey === "the-old-world") {
    const faction = record.match(/primaryFaction:\s*"([^"]+)"/)?.[1];
    if (faction) oldWorldFactions.add(faction);
  }
  if (!allowedGameSystems.has(gameSystemKey)) {
    throw new Error(`Banner ${id} uses unknown gameSystemKey: ${gameSystemKey}`);
  }

  const palette = record.match(/palette:\s*\[([^\]]+)\]/)?.[1]
    ?.split(",")
    .map((part) => part.trim().replace(/^"|"$/g, ""));
  if (!palette || palette.length !== 3 || palette.some((color) => !/^#[0-9a-fA-F]{6}$/.test(color))) {
    throw new Error(`Banner ${id} must have a three-color hex palette.`);
  }

  const profile = record.match(/profile:\s*\{([^}]+)\}/)?.[1];
  if (!profile) throw new Error(`Banner ${id} is missing a trait profile.`);
  for (const trait of profile.split(",").map((part) => part.trim()).filter(Boolean)) {
    const [name, rawValue] = trait.split(":").map((part) => part.trim());
    const value = Number(rawValue);
    if (!allowedTraits.has(name)) throw new Error(`Banner ${id} uses invalid trait: ${name}`);
    if (!Number.isInteger(value) || value < 1 || value > 3) {
      throw new Error(`Banner ${id} has invalid trait weight for ${name}: ${rawValue}`);
    }
  }

  if (!new RegExp(`"${id}":`).test(platesSource)) {
    throw new Error(`Banner ${id} is missing from the PLATES registry.`);
  }
}

const expectedOldWorldFactions = new Set([
  "Kingdom of Bretonnia",
  "Tomb Kings of Khemri",
  "Dwarfen Mountain Holds",
  "Orc & Goblin Tribes",
  "Empire of Man",
  "Warriors of Chaos",
  "Beastmen Brayherds",
  "Wood Elf Realms",
  "High Elf Realms",
  "Grand Cathay",
]);
const missingOldWorldFactions = [...expectedOldWorldFactions].filter(
  (faction) => !oldWorldFactions.has(faction)
);
const unexpectedOldWorldFactions = [...oldWorldFactions].filter(
  (faction) => !expectedOldWorldFactions.has(faction)
);
if (missingOldWorldFactions.length || unexpectedOldWorldFactions.length) {
  throw new Error(
    `Old World roster mismatch. Missing: ${missingOldWorldFactions.join(", ") || "none"}; unexpected: ${unexpectedOldWorldFactions.join(", ") || "none"}.`
  );
}

console.log(`Validated ${records.length} banners: unique ids, required fields, game system keys, palettes, trait profiles, plate registry entries, and the complete ${oldWorldFactions.size}-faction Old World roster.`);
