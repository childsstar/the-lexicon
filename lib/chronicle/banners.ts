import type { Banner } from "./types";

// The answer space for Find Your Banner: twelve archetypes, each mapped to a
// real game system + faction. All prose is original; faction and system
// names are used nominatively. Image prompts describe environments and mood
// only — no characters, no publisher IP.

export const BANNERS: Banner[] = [
  {
    id: "shield-unbroken",
    name: "The Shield Unbroken",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Space Marines",
    profile: { discipline: 3, valor: 2, endurance: 2 },
    personalitySummary:
      "You are the one people look to when everything goes wrong. You don't panic, you don't posture — you plant your feet and the chaos breaks around you like water on stone.",
    reasoning:
      "You'd thrive in Warhammer 40,000, where grand heroics meet grim odds — and the Space Marines are its steadfast heart: disciplined, loyal, and unbreakable when it matters most. Their armies reward players who hold the line and strike with purpose.",
    chronicleIntro:
      "The chronicle opens on a wall that should have fallen a hundred years ago. It still stands. So do you. Somewhere beyond the smoke, a horn sounds — and you take one step forward, because someone has to be first.",
    imagePrompt:
      "A colossal marble bastion on a cliff edge at dawn, gold light breaking through storm clouds, banners of deep blue snapping in the wind, embers rising from distant fires below, monumental and unyielding, painterly, no people",
    cardQuote: "Someone has to be first.",
    palette: ["#0c1425", "#1e3a5f", "#d4ac62"],
  },
  {
    id: "burning-faith",
    name: "The Burning Faith",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Adepta Sororitas",
    profile: { wonder: 3, valor: 2, discipline: 1 },
    personalitySummary:
      "You believe in things fully or not at all. When you commit — to a person, a cause, an idea — you burn for it, and people around you warm their hands on that fire whether they admit it or not.",
    reasoning:
      "Warhammer 40,000 is a setting where conviction is a weapon, and no one wields it like the Adepta Sororitas — warriors whose faith is literal armor. Their armies reward the player who commits utterly and never takes a backward step.",
    chronicleIntro:
      "The chronicle opens in candlelight. A thousand small flames, each one a promise somebody kept. You add yours to the constellation and the dark leans away — not because it fears the light, but because it fears the one who lit it.",
    imagePrompt:
      "A vast ruined cathedral interior lit by thousands of candles, crimson and gold light on broken stained glass, incense smoke curling into high shadowed vaults, solemn and radiant, painterly, no people",
    cardQuote: "The dark leans away.",
    palette: ["#1a0a0a", "#5f1e1e", "#e5c988"],
  },
  {
    id: "endless-hunger",
    name: "The Endless Hunger",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Tyranids",
    profile: { wildness: 3, cunning: 2, endurance: 1 },
    personalitySummary:
      "You don't do things halfway. When something catches your interest you consume it whole — every book, every video, every rabbit hole at 2 a.m. People call it obsession. You call it Tuesday.",
    reasoning:
      "Warhammer 40,000 gives you a whole galaxy to devour, and the Tyranids are appetite made into an army — a living tide that adapts, evolves, and overwhelms. They reward players who think like an ecosystem instead of a general.",
    chronicleIntro:
      "The chronicle opens under a sky with two moons, in a jungle that is quietly rearranging itself. Everything here is patient. Everything here is hungry. You feel strangely at home.",
    imagePrompt:
      "An alien jungle beneath twin moons, bioluminescent violet and green flora, strange organic spires in the mist, air thick with drifting spores, beautiful and unsettling, painterly, no people",
    cardQuote: "Everything here is patient. Everything here is hungry.",
    palette: ["#120a1a", "#3d1e5f", "#7ee08a"],
  },
  {
    id: "deathless-crown",
    name: "The Deathless Crown",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Necrons",
    profile: { endurance: 3, discipline: 2, cunning: 2 },
    personalitySummary:
      "You play the long game. While everyone else reacts, you're already three moves ahead, unbothered, sipping something. Time is not your enemy — it's your instrument.",
    reasoning:
      "In Warhammer 40,000 the Necrons are patience given a metal body: an empire that simply waited out the ages and woke up still owning everything. Their armies reward calm, inevitability, and the confidence of a plan measured in eons.",
    chronicleIntro:
      "The chronicle opens on a desert where monoliths older than the stars are shrugging off the sand. Nothing here hurries. Nothing here needs to. The dynasty does not return — it resumes.",
    imagePrompt:
      "Black desert monoliths emerging from endless dunes at night, geometric emerald light tracing ancient carved circuitry, cold stars overhead, vast and silent, painterly, no people",
    cardQuote: "The dynasty does not return — it resumes.",
    palette: ["#050d0a", "#0f3d2e", "#3de8a0"],
  },
  {
    id: "roaring-horde",
    name: "The Roaring Horde",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Orks",
    profile: { valor: 3, wildness: 3 },
    personalitySummary:
      "You bring the noise. Every group has one person who makes things happen through sheer momentum and infectious chaos — that's you, and honestly, the plan usually works because nobody told you it couldn't.",
    reasoning:
      "Warhammer 40,000 has room for glorious mayhem, and the Orks are its beating, bellowing heart — a culture where enthusiasm is technology and the biggest laugh wins. Their armies reward speed, audacity, and joy.",
    chronicleIntro:
      "The chronicle opens mid-charge. There was probably a plan at some point. It doesn't matter now. The horizon is on fire, everyone is shouting, and you have never felt more alive.",
    imagePrompt:
      "A scrap-iron war camp at sunset under a smoke-red sky, towering junk totems and patchwork banners, sparks and bonfire light, raucous energy in every silhouette of machinery, painterly, no people",
    cardQuote: "There was probably a plan at some point.",
    palette: ["#140d05", "#5f3a1e", "#8ad46a"],
  },
  {
    id: "veiled-path",
    name: "The Veiled Path",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Aeldari",
    profile: { cunning: 3, wonder: 2 },
    personalitySummary:
      "You see the board, not the piece. People think you're quiet; really you're listening, weighing, and choosing the exact moment when one precise word — or move — changes everything.",
    reasoning:
      "Warhammer 40,000 rewards foresight, and no one embodies it like the Aeldari — an ancient people who read fate like sheet music and strike only where it matters. Their armies are fast, fragile, and devastating in the hands of a player who plans two turns ahead.",
    chronicleIntro:
      "The chronicle opens on a path only you can see, silver-thin, threading between disasters that haven't happened yet. You've already counted the exits. You always do.",
    imagePrompt:
      "Elegant glass spires drifting through a sea of stars, pale opal light refracting through crystalline architecture, ribbons of aurora, serene and melancholy, painterly, no people",
    cardQuote: "You've already counted the exits.",
    palette: ["#0a0f1a", "#2e3a5f", "#c9d8f0"],
  },
  {
    id: "verdant-wrath",
    name: "The Verdant Wrath",
    gameSystem: "Warhammer: Age of Sigmar",
    primaryFaction: "Sylvaneth",
    profile: { wildness: 3, wonder: 2, endurance: 1 },
    personalitySummary:
      "You're gentle until you're not. People mistake your calm for softness, right up until something you love is threatened — then they learn why forests outlive empires.",
    reasoning:
      "Age of Sigmar is high fantasy turned up to myth, and the Sylvaneth are its wild soul — spirits of root and thorn who sing groves into existence and enemies into the earth. They reward players who cultivate the board like a garden, then harvest.",
    chronicleIntro:
      "The chronicle opens in a forest that remembers everything. Every kindness, every axe. Today the canopy stirs without wind, and the old wrath rises through the roots like sap in spring — patient, green, and absolutely certain.",
    imagePrompt:
      "An ancient forest waking at green dawn, colossal moss-covered trees with faint golden spirit-light between the roots, drifting seeds glowing like embers, mist and shafts of light, painterly, no people",
    cardQuote: "Forests outlive empires.",
    palette: ["#08120a", "#1e4a2e", "#a0e87e"],
  },
  {
    id: "storms-herald",
    name: "The Storm's Herald",
    gameSystem: "Warhammer: Age of Sigmar",
    primaryFaction: "Stormcast Eternals",
    profile: { valor: 3, wonder: 2, discipline: 1 },
    personalitySummary:
      "You show up. When the group chat goes silent and the plan falls apart, you're the one who appears — slightly dramatic, fully committed, exactly when it matters. You'd rather burn out saving something than rust guarding it.",
    reasoning:
      "Age of Sigmar opens with heroes cast down from the sky in lightning, and that's the Stormcast Eternals' whole covenant: arrive like thunder, stand where others fell. Their armies are forgiving to learn and heroic to play — the classic first banner for a reason.",
    chronicleIntro:
      "The chronicle opens with a storm that chooses. Out of every soul on the field, the lightning bends — and finds you. Falling upward feels, briefly, like being remembered by the sky.",
    imagePrompt:
      "Lightning striking a mountain temple above the clouds at dusk, gold and cobalt storm light, colossal stone stairways vanishing into cloud, rain frozen mid-fall, mythic and electric, painterly, no people",
    cardQuote: "Arrive like thunder.",
    palette: ["#0a0d1a", "#2e2a5f", "#f0d878"],
  },
  {
    id: "iron-oath",
    name: "The Iron Oath",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Leagues of Votann",
    profile: { endurance: 3, discipline: 2, cunning: 1 },
    personalitySummary:
      "Your word is load-bearing. You're the friend who actually shows up with the truck, the one who finishes what everyone else abandoned. Flash fades; you were built for the long haul.",
    reasoning:
      "In Warhammer 40,000 the Leagues of Votann are the galaxy's stubbornest survivors — clans of miners and makers whose grudges are ledgers and whose loyalty is bedrock. Their armies reward methodical players who advance like a glacier and give back nothing.",
    chronicleIntro:
      "The chronicle opens in a forge-hall under a mountain of ice, where every hammer-fall is a promise kept. The ancestors are listening. You pick up the hammer.",
    imagePrompt:
      "Vast forge-halls carved beneath a mountain of ice, rivers of molten copper light between dark stone pillars, northern lights visible through a distant cavern mouth, warm fire against deep cold, painterly, no people",
    cardQuote: "Your word is load-bearing.",
    palette: ["#0d0f12", "#3d2e1e", "#e8a05f"],
  },
  {
    id: "machine-communion",
    name: "The Machine Communion",
    gameSystem: "Warhammer 40,000",
    primaryFaction: "Adeptus Mechanicus",
    profile: { discipline: 2, wonder: 2, cunning: 2 },
    personalitySummary:
      "You want to know how it works — the clock, the code, the universe. Taking things apart is your love language, and there's a quiet ecstasy in the moment a system finally makes sense.",
    reasoning:
      "Warhammer 40,000's Adeptus Mechanicus treat knowledge itself as sacred — engineers, archivists, and priests of the machine in one crimson procession. Their armies reward optimizers: every unit a component, every battle a proof.",
    chronicleIntro:
      "The chronicle opens in a city that hums in a frequency only you seem to hear. Somewhere beneath the brass and steam, a great engine is asking a question. You intend to answer it.",
    imagePrompt:
      "A forge-city of brass pipes and sacred machinery beneath a rust-red sky, geometric processional avenues lit by furnace glow and green data-light, steam rising past cog-shaped spires, intricate and reverent, painterly, no people",
    cardQuote: "Knowledge is the only heirloom.",
    palette: ["#120808", "#5f1e1e", "#7ec9c0"],
  },
  {
    id: "midnight-court",
    name: "The Midnight Court",
    gameSystem: "Warhammer: Age of Sigmar",
    primaryFaction: "Soulblight Gravelords",
    profile: { cunning: 2, endurance: 2, wonder: 2 },
    personalitySummary:
      "You have excellent taste and terrifying patience. You collect — books, grudges, beautiful things — and you never forget a detail. Charm is your opening move; the endgame is always yours.",
    reasoning:
      "Age of Sigmar's Soulblight Gravelords are aristocracy that refused to end: elegant, ancient, and always owed a debt. Their armies reward players who bleed opponents slowly and command the board like a manor they've owned for centuries.",
    chronicleIntro:
      "The chronicle opens at a manor above a sea of mist, where the candles never quite go out and the portraits are all, on close inspection, of you. The invitation was written before you were born. You attend anyway.",
    imagePrompt:
      "A moonlit gothic manor on a crag above a sea of rolling mist, warm candlelight in tall windows against cold blue night, iron gates and wild roses, elegant decay, painterly, no people",
    cardQuote: "The endgame is always yours.",
    palette: ["#0a0a12", "#2e1e3d", "#c9a0d8"],
  },
  {
    id: "cracked-moon",
    name: "The Cracked Moon",
    gameSystem: "Warhammer: Age of Sigmar",
    primaryFaction: "Gloomspite Gitz",
    profile: { cunning: 3, wildness: 2 },
    personalitySummary:
      "You are chaos with a plan — or at least a punchline. You zig when the world expects zag, and your best ideas arrive at the worst possible moments, which is precisely why they work.",
    reasoning:
      "Age of Sigmar's Gloomspite Gitz fight by moonlight, mushroom, and mischief — an ambush culture that wins by being exactly as unhinged as everyone feared. Their armies reward improvisation and reward laughing about it after.",
    chronicleIntro:
      "The chronicle opens in a cavern of glowing mushrooms under a moon with a crack in it. Everything down here is a joke, a trap, or both. You fit right in, and that should worry someone.",
    imagePrompt:
      "A vast cavern of towering bioluminescent mushrooms in blues and violets, pale crooked moonlight spilling through a crack in the cavern roof, winding paths and spore-light, whimsical and eerie, painterly, no people",
    cardQuote: "A joke, a trap, or both.",
    palette: ["#0d0a14", "#3d2e5f", "#8ae0d4"],
  },
];

export const BANNER_BY_ID = new Map(BANNERS.map((b) => [b.id, b] as const));
