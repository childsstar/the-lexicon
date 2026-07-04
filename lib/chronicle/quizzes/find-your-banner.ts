import type { ChronicleQuiz } from "../types";

// Find Your Banner — the first Chronicle.
//
// Rule of the house: no question mentions armies, miniatures, factions, or
// the tabletop. Every option scores personality traits only, so people
// answer honestly instead of optimizing.

export const FIND_YOUR_BANNER: ChronicleQuiz = {
  slug: "find-your-banner",
  title: "Find Your Banner",
  tagline: "Eight choices. One calling.",
  invocation:
    "Somewhere in the Lexicon's oldest pages, a banner is waiting for a name. Answer honestly — the pages can tell.",
  ceremony: [
    "The Lexicon is searching forgotten chronicles…",
    "Ancient banners stir…",
    "One of them lifts its head…",
    "Your story is beginning.",
  ],
  questions: [
    {
      prompt: "A road splits before you.",
      followUp: "Which path do you take?",
      options: [
        {
          label: "The broad sunlit road, straight toward the horizon",
          traits: { valor: 2, discipline: 1 },
        },
        {
          label: "The shadowed shortcut between the trees",
          traits: { cunning: 2, wildness: 1 },
        },
        {
          label: "The switchbacks up into the cold heights",
          traits: { endurance: 2, discipline: 1 },
        },
        {
          label: "The path that glimmers in a way roads shouldn't",
          traits: { wonder: 2, cunning: 1 },
        },
      ],
    },
    {
      prompt: "Your desk usually looks like…",
      options: [
        { label: "Perfectly organized", traits: { discipline: 2 } },
        { label: "Creative chaos", traits: { wildness: 1, wonder: 1 } },
        {
          label: "Somewhere in between",
          traits: { endurance: 1, discipline: 1 },
        },
        { label: "I genuinely could not tell you", traits: { wildness: 2 } },
      ],
    },
    {
      prompt: "A storm knocks the power out.",
      followUp: "You…",
      options: [
        { label: "Find the flashlight. There is a flashlight.", traits: { discipline: 1, endurance: 1 } },
        { label: "Light candles", traits: { wonder: 2 } },
        { label: "Go outside to watch it", traits: { valor: 1, wildness: 1 } },
        { label: "Wait, and listen", traits: { cunning: 1, endurance: 1 } },
      ],
    },
    {
      prompt: "You discover an ancient artifact.",
      followUp: "Do you…",
      options: [
        { label: "Use it", traits: { valor: 2 } },
        { label: "Study it", traits: { wonder: 1, discipline: 1 } },
        { label: "Hide it", traits: { cunning: 2 } },
        { label: "Sell it", traits: { cunning: 1, endurance: 1 } },
      ],
    },
    {
      prompt: "When friends attempt something together, you're the one who…",
      options: [
        { label: "Draws up the plan", traits: { discipline: 2 } },
        { label: "Keeps everyone going when it gets hard", traits: { endurance: 1, valor: 1 } },
        { label: "Finds the loophole", traits: { cunning: 2 } },
        { label: "Starts the chant", traits: { valor: 1, wildness: 1 } },
      ],
    },
    {
      prompt: "A companion joins your journey.",
      followUp: "Which one?",
      options: [
        { label: "A loyal hound", traits: { valor: 1, discipline: 1 } },
        { label: "A clever raven", traits: { cunning: 1, wonder: 1 } },
        { label: "A half-wild wolf", traits: { wildness: 2 } },
        { label: "An ancient tortoise", traits: { endurance: 2 } },
      ],
    },
    {
      prompt: "One hour of the day belongs to you.",
      followUp: "Which is it?",
      options: [
        { label: "Dawn, before anyone else wakes", traits: { discipline: 1, valor: 1 } },
        { label: "High noon, everything blazing", traits: { valor: 1, endurance: 1 } },
        { label: "Dusk, when the light goes strange", traits: { wonder: 2 } },
        { label: "Midnight, wide awake", traits: { cunning: 1, wildness: 1 } },
      ],
    },
    {
      prompt: "A locked door bars the way, and no one is coming.",
      options: [
        { label: "Knock. Loudly. Repeatedly.", traits: { valor: 2 } },
        { label: "Pick the lock", traits: { cunning: 2 } },
        { label: "Sit down and outwait whoever locked it", traits: { endurance: 2 } },
        { label: "Wonder what the door wants", traits: { wonder: 2 } },
      ],
    },
  ],
};
