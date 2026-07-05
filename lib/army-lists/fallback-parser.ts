import type { ArmyListParserInput, ParsedArmyList, ParsedArmyUnit } from "./types";

export function parseArmyListDeterministically(input: ArmyListParserInput): ParsedArmyList {
  const lines = input.rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const joined = lines.join("\n");
  const pointsTotal = extractPointsTotal(joined);
  const units = lines.map(parseUnitLine).filter((unit): unit is ParsedArmyUnit => Boolean(unit)).slice(0, 80);
  const faction = input.faction || extractLabeledValue(lines, ["faction", "army", "allegiance"]);
  const gameSystem = input.gameSystem || inferGameSystem(joined);
  const subfaction = extractLabeledValue(lines, ["subfaction", "detachment", "chapter", "clan", "sept", "legion"]);
  const warnings = ["Used deterministic fallback parsing; review units, upgrades, and points before relying on this summary."];
  if (!units.length) warnings.push("No obvious unit rows were detected; raw roster text was preserved.");
  if (!pointsTotal) warnings.push("Could not confidently identify a total points value.");

  return { game_system: gameSystem, faction, subfaction, points_total: pointsTotal, units, inferred_playstyle_tags: inferPlaystyleTags(joined, units), confidence: units.length ? 0.42 : 0.22, warnings };
}

function extractLabeledValue(lines: string[], labels: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/^([a-z ]{3,20})\s*[:\-–]\s*(.+)$/i);
    if (match && labels.includes(match[1].trim().toLowerCase())) return match[2].trim();
  }
  return null;
}

function extractPointsTotal(text: string): number | null {
  const labeled = text.match(/(?:total|points|pts)\D{0,12}(\d{3,5})\s*(?:pts?|points)?/i);
  if (labeled) return Number(labeled[1]);
  const allPoints = [...text.matchAll(/(\d{1,5})\s*(?:pts?|points)\b/gi)].map((match) => Number(match[1]));
  return allPoints.length ? Math.max(...allPoints) : null;
}

function parseUnitLine(line: string): ParsedArmyUnit | null {
  if (/^(faction|army|game system|total|points|detachment|subfaction)\b/i.test(line)) return null;
  const pointMatch = line.match(/(?:\(|\b)(\d{1,4})\s*(?:pts?|points)\)?/i);
  const quantityMatch = line.match(/^(\d+)\s*[x×]\s+(.+)/i);
  const bulletClean = line.replace(/^[-*•]\s*/, "");
  let name = quantityMatch ? quantityMatch[2] : bulletClean;
  name = name.replace(/\(?\d{1,4}\s*(?:pts?|points)\)?/gi, "").replace(/\s[-–:]\s.*$/, "").trim();
  if (!pointMatch || name.length < 3) return null;
  const trailing = line.split(/\s[-–:]\s/).slice(1).join(" - ");
  const extras = trailing ? trailing.split(/[,;]\s*/).map((item) => item.trim()).filter(Boolean) : [];
  return { name, quantity: quantityMatch ? Number(quantityMatch[1]) : 1, points: Number(pointMatch[1]), role: inferRole(line), enhancements: extras.filter((item) => /enhancement|trait|relic/i.test(item)), upgrades: extras.filter((item) => /upgrade|mark|icon/i.test(item)), wargear: extras.filter((item) => !/enhancement|trait|relic|upgrade|mark|icon/i.test(item)) };
}

function inferGameSystem(text: string): string | null {
  if (/warhammer\s*40|40k|adeptus|space marines|tyranids|necrons/i.test(text)) return "Warhammer 40,000";
  if (/age of sigmar|stormcast|seraphon|ossiarch/i.test(text)) return "Warhammer Age of Sigmar";
  if (/kill team/i.test(text)) return "Kill Team";
  return null;
}

function inferRole(text: string): string | null {
  if (/hq|leader|character|warlord/i.test(text)) return "Leader";
  if (/battleline|troops|infantry/i.test(text)) return "Battleline";
  if (/transport|rhino|trukk/i.test(text)) return "Transport";
  if (/vehicle|tank|monster|beast/i.test(text)) return "Heavy support";
  return null;
}

function inferPlaystyleTags(text: string, units: ParsedArmyUnit[]): string[] {
  const tags = new Set<string>();
  if (/melee|assault|charge|berserker|blade/i.test(text)) tags.add("melee pressure");
  if (/shoot|rifle|gun|cannon|plasma|melta/i.test(text)) tags.add("ranged firepower");
  if (/scout|infiltrat|deep strike|jump|fast/i.test(text)) tags.add("mobility");
  if (/psyker|wizard|magic|spell/i.test(text)) tags.add("psychic/magic support");
  if (units.length >= 8) tags.add("board control");
  return [...tags];
}
