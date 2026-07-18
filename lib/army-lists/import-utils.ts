import { findGameByName, type Game } from "../games";

/** Detect only explicit roster metadata; never guess 40K merely from active UI context. */
export function detectRosterGame(text: string): Game | undefined {
  if (/Warhammer:\s*The Old World|\bThe Old World\b/i.test(text)) return findGameByName("Warhammer: The Old World");
  if (/Warhammer(?::)?\s*(?:Age of Sigmar|AoS)\b/i.test(text)) return findGameByName("Warhammer: Age of Sigmar");
  if (/Warhammer\s*40,?000|\b40K\b/i.test(text)) return findGameByName("Warhammer 40,000");
  if (/\bKill Team\b/i.test(text)) return findGameByName("Kill Team");
  if (/\b(?:The )?Horus Heresy\b/i.test(text)) return findGameByName("The Horus Heresy");
  return undefined;
}

export const ARMY_IMPORT_ERROR = "We couldn't save this army right now. Please try again shortly. Your pasted roster has not been lost.";

export function isArmyListSchemaError(error: { message?: string; code?: string } | null): boolean {
  return Boolean(error && (error.code === "PGRST204" || /schema cache|game_key|army_lists/i.test(error.message ?? "")));
}
