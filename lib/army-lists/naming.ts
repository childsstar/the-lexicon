/**
 * Neutral fallback name for a mustered army when the player didn't type
 * one. The parser must never overwrite a user-entered name — this only
 * ever runs when that name is blank.
 */
export function generateFallbackArmyName(input: {
  faction?: string | null;
  gameSystem?: string | null;
}): string {
  const faction = input.faction?.trim();
  if (faction) return `Imported ${faction} Army`;

  const gameSystem = input.gameSystem?.trim();
  if (gameSystem) return `Imported ${gameSystem} Army`;

  return "Imported Army List";
}
