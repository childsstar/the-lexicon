// Curated game systems and factions for profile picklists.
//
// Names are used nominatively — to identify what people play — and carry no
// rules, datasheets, or points. Not affiliated with any publisher. Lists
// don't need to be exhaustive: every picker backed by this data also accepts
// free-text entries.
//
// Universe/Realm/Game hierarchy: where a name matches a canonical Game
// (lib/games.ts), the entry below is backfilled with its gameKey rather
// than duplicating that data — see GAME_SYSTEMS at the bottom of this file.

import { findGameByName, type GameKey } from "./games";

export type GameSystem = {
  name: string;
  factions: string[];
  /** Set when this name also names a canonical Game — undefined for hobby
   * systems the Universe/Realm/Game hierarchy doesn't model yet. */
  gameKey?: GameKey;
};

const RAW_GAME_SYSTEMS: GameSystem[] = [
  {
    name: "Warhammer 40,000",
    factions: [
      "Adepta Sororitas",
      "Adeptus Custodes",
      "Adeptus Mechanicus",
      "Aeldari",
      "Astra Militarum",
      "Black Templars",
      "Blood Angels",
      "Chaos Daemons",
      "Chaos Knights",
      "Chaos Space Marines",
      "Dark Angels",
      "Death Guard",
      "Drukhari",
      "Emperor's Children",
      "Genestealer Cults",
      "Grey Knights",
      "Imperial Agents",
      "Imperial Knights",
      "Leagues of Votann",
      "Necrons",
      "Orks",
      "Space Marines",
      "Space Wolves",
      "T'au Empire",
      "Thousand Sons",
      "Tyranids",
      "World Eaters",
    ],
  },
  {
    name: "Warhammer: Age of Sigmar",
    factions: [
      "Blades of Khorne",
      "Cities of Sigmar",
      "Daughters of Khaine",
      "Disciples of Tzeentch",
      "Flesh-eater Courts",
      "Fyreslayers",
      "Gloomspite Gitz",
      "Hedonites of Slaanesh",
      "Idoneth Deepkin",
      "Kharadron Overlords",
      "Lumineth Realm-lords",
      "Maggotkin of Nurgle",
      "Nighthaunt",
      "Ogor Mawtribes",
      "Orruk Warclans",
      "Ossiarch Bonereapers",
      "Seraphon",
      "Skaven",
      "Slaves to Darkness",
      "Sons of Behemat",
      "Soulblight Gravelords",
      "Stormcast Eternals",
      "Sylvaneth",
    ],
  },
  {
    name: "Warhammer: The Old World",
    factions: [
      "Beastmen Brayherds",
      "Chaos Dwarfs",
      "Daemons of Chaos",
      "Dark Elves",
      "Dwarfen Mountain Holds",
      "Empire of Man",
      "Grand Cathay",
      "High Elf Realms",
      "Kingdom of Bretonnia",
      "Lizardmen",
      "Orc & Goblin Tribes",
      "Skaven",
      "Tomb Kings of Khemri",
      "Vampire Counts",
      "Warriors of Chaos",
      "Wood Elf Realms",
    ],
  },
  {
    name: "The Horus Heresy",
    factions: [
      "Legiones Astartes — Loyalist",
      "Legiones Astartes — Traitor",
      "Solar Auxilia",
      "Mechanicum",
      "Legio Custodes",
      "Sisters of Silence",
      "Imperialis Militia",
      "Daemons of the Ruinstorm",
      "Questoris Knights",
    ],
  },
  {
    name: "Necromunda",
    factions: [
      "House Cawdor",
      "House Delaque",
      "House Escher",
      "House Goliath",
      "House Orlock",
      "House Van Saar",
      "Palanite Enforcers",
      "Corpse Grinder Cult",
      "Genestealer Cults",
      "Ash Waste Nomads",
      "Ironhead Squat Prospectors",
    ],
  },
  {
    name: "Battlefleet Gothic",
    factions: [
      "Imperial Navy",
      "Adeptus Astartes",
      "Chaos Fleets",
      "Eldar Corsairs",
      "Dark Eldar",
      "Ork Pirates",
      "Tyranid Hive Fleets",
      "Necrons",
      "Tau Empire",
    ],
  },
  {
    name: "Star Wars: Legion",
    factions: [
      "Rebel Alliance",
      "Galactic Empire",
      "Grand Army of the Republic",
      "Separatist Alliance",
      "Shadow Collective",
    ],
  },
  // Systems below don't have curated faction lists yet — the faction picker
  // falls back to free text for them.
  { name: "Kill Team", factions: [] },
  { name: "Warcry", factions: [] },
  { name: "Blood Bowl", factions: [] },
  { name: "Adeptus Titanicus", factions: [] },
  { name: "Middle-earth Strategy Battle Game", factions: [] },
  { name: "Star Wars: Shatterpoint", factions: [] },
  { name: "Marvel: Crisis Protocol", factions: [] },
  { name: "BattleTech", factions: [] },
  { name: "A Song of Ice and Fire", factions: [] },
  { name: "Bolt Action", factions: [] },
  { name: "Infinity", factions: [] },
  { name: "Malifaux", factions: [] },
  { name: "Warmachine", factions: [] },
  { name: "Kings of War", factions: [] },
  { name: "Conquest: The Last Argument of Kings", factions: [] },
  { name: "One Page Rules (Grimdark Future)", factions: [] },
  { name: "Trench Crusade", factions: [] },
  { name: "Frostgrave", factions: [] },
];

export const GAME_SYSTEMS: GameSystem[] = RAW_GAME_SYSTEMS.map((system) => {
  const game = findGameByName(system.name);
  return game ? { ...system, gameKey: game.key } : system;
});

export const SYSTEM_BY_NAME = new Map(
  GAME_SYSTEMS.map((s) => [s.name, s] as const)
);

export const KNOWN_SYSTEM_NAMES = new Set(GAME_SYSTEMS.map((s) => s.name));

export const KNOWN_FACTION_NAMES = new Set(
  GAME_SYSTEMS.flatMap((s) => s.factions)
);
