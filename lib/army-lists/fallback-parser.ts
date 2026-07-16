import type { ArmyListParserInput, ParsedArmyList, ParsedArmyUnit } from "./types";
import { isNonDatasheet } from "./unit-lexicon";

const SECTION_HEADERS = new Set(["ATTACHED UNITS", "CHARACTERS", "BATTLELINE", "DEDICATED TRANSPORTS", "OTHER DATASHEETS", "ALLIED UNITS", "CORE", "SPECIAL", "RARE", "MERCENARIES", "ALLIES", "LORDS", "HEROES"]);
const FORCE_SIZES = /\b(Strike Force|Incursion|Combat Patrol|Onslaught)\b/i;

export function parseArmyListDeterministically(input: ArmyListParserInput): ParsedArmyList {
  const lines = input.rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const joined = lines.join("\n");
  const is40kExport = looksLikeWarhammer40kExport(joined);
  const detachments = is40kExport ? extractDetachments(lines) : { detachment_names: [] as string[], detachment_points: null as number | null };
  const pointsTotal = extractPointsTotal(joined);
  const isOldWorld = input.gameSystem === "Warhammer: The Old World";
  const units = is40kExport && !isOldWorld ? parseWarhammer40kUnits(lines) : parseSectionedUnits(lines, isOldWorld);
  const faction = input.faction || (is40kExport ? extractWarhammerFaction(lines) : null) || extractLabeledValue(lines, ["faction", "army", "allegiance"]);
  const gameSystem = input.gameSystem || inferGameSystem(joined);
  const subfaction = detachments.detachment_names.length ? detachments.detachment_names.join(" / ") : extractLabeledValue(lines, ["subfaction", "detachment", "chapter", "clan", "sept", "legion"]);
  const modelCount = units.reduce((sum, unit) => sum + (unit.quantity ?? 1), 0);
  const warnings = ["Imported list is unofficial and has not been checked against construction rules. Review before locking."];
  if (units.some((unit) => unit.unverified)) warnings.push("Some unfamiliar lines were preserved as unverified entries.");
  if (!units.length) warnings.push("No obvious unit rows were detected; raw roster text was preserved.");
  if (!pointsTotal) warnings.push("Could not confidently identify a total points value.");

  return { game_system: gameSystem, faction, subfaction, points_total: pointsTotal, units, unit_count: units.length, model_count: modelCount || null, detachment_names: detachments.detachment_names, detachment_points: detachments.detachment_points, inferred_playstyle_tags: inferPlaystyleTags(joined, units), confidence: units.length ? (is40kExport ? 0.78 : 0.42) : 0.22, warnings };
}

function parseSectionedUnits(lines: string[], preserveUnknown: boolean): ParsedArmyUnit[] {
  const units: ParsedArmyUnit[] = [];
  let section: string | null = null;
  for (const raw of lines) {
    const line = raw.replace(/^[-*•]\s*/, "").trim();
    const heading = line.replace(/:$/, "").toUpperCase();
    if (SECTION_HEADERS.has(heading)) { section = titleCase(heading); continue; }
    const parsed = parseUnitLine(line, section);
    if (parsed) { units.push({ ...parsed, raw_text: raw }); continue; }
    if (preserveUnknown && section && !/^(total|faction|army|game system|points)\b/i.test(line)) {
      units.push({ name: line, raw_text: raw, unverified: true, quantity: null, points: null, role: null, section, category: section, enhancements: [], upgrades: [], wargear: [] });
    }
  }
  return units.slice(0, 120);
}

export function looksLikeWarhammer40kExport(text: string): boolean {
  return /Exported with App Version|Data Version|ATTACHED UNITS|CHARACTERS|DEDICATED TRANSPORTS|OTHER DATASHEETS/i.test(text) || FORCE_SIZES.test(text) || /\b\d+\s+detachments?\s*\([\d,]+\s*Points\)/i.test(text);
}

function extractWarhammerFaction(lines: string[]): string | null {
  const firstPointsIndex = lines.findIndex((line) => /\([\d,]+\s*Points\)/i.test(line));
  if (firstPointsIndex >= 0) {
    const faction = lines.slice(firstPointsIndex + 1).find((line) => !/^(Exported with|Data Version|Force Dispositions:)/i.test(line) && !/\([\d,]+\s*(?:Points|Detachment Points)\)/i.test(line));
    if (faction) return faction;
  }
  return null;
}

function extractDetachments(lines: string[]): { detachment_names: string[]; detachment_points: number | null } {
  for (const line of lines) {
    const match = line.match(/^(.+?)\s*\(([\d,]+)\s*Detachment Points?\)$/i);
    if (!match) continue;
    return { detachment_names: match[1].split(/\s+and\s+|\s*[,&]\s*/i).map((name) => name.trim()).filter(Boolean), detachment_points: parseNumber(match[2]) };
  }
  return { detachment_names: [], detachment_points: null };
}

function parseWarhammer40kUnits(lines: string[]): ParsedArmyUnit[] {
  const units: ParsedArmyUnit[] = [];
  let section: string | null = null;
  let current: ParsedArmyUnit | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[-*•]\s*/, "").trim();
    if (SECTION_HEADERS.has(line.toUpperCase())) { section = titleCase(line); current = null; continue; }
    const unit = parseUnitLine(line, section);
    if (unit && !/Detachment Points/i.test(line) && !FORCE_SIZES.test(line) && !/^\d+\s+detachments?/i.test(line)) {
      units.push(unit); current = unit; continue;
    }
    if (!current) continue;
    const quantityMatch = line.match(/^(\d+)\s*[x×]\s+(.+)/i);
    if (quantityMatch && normalizeName(quantityMatch[2]).includes(normalizeName(current.name).replace(/s$/, ""))) current.quantity = Number(quantityMatch[1]);
    const roleMatch = line.match(/Attached as:\s*(.+)$/i);
    if (roleMatch) current.role = roleMatch[1].trim();
    const enhancementMatch = line.match(/Enhancements?:\s*(.+)$/i);
    if (enhancementMatch) current.enhancements.push(...splitList(enhancementMatch[1]));
    if (/^◦|^-|^•|^\*/.test(rawLine.trim())) current.wargear.push(line.replace(/^◦\s*/, ""));
  }
  return units.slice(0, 120);
}

function extractLabeledValue(lines: string[], labels: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/^([a-z ]{3,20})\s*[:\-–]\s*(.+)$/i);
    if (match && labels.includes(match[1].trim().toLowerCase())) return match[2].trim();
  }
  return null;
}

function extractPointsTotal(text: string): number | null {
  const topLevel = text.match(/(?:^|\n)(?:\d+\s+detachments?\s*)?\(([\d,]+)\s*Points\)/i) || text.match(/(?:Strike Force|Incursion|Combat Patrol|Onslaught)\s*\(([\d,]+)\s*Points\)/i);
  if (topLevel) return parseNumber(topLevel[1]);
  const labeled = text.match(/(?:total|points|pts)\D{0,12}([\d,]{3,5})\s*(?:pts?|points)?/i);
  if (labeled) return parseNumber(labeled[1]);
  const allPoints = [...text.matchAll(/([\d,]{1,5})\s*(?:pts?|points)\b/gi)].map((match) => parseNumber(match[1]));
  return allPoints.length ? Math.max(...allPoints) : null;
}

function parseUnitLine(line: string, section: string | null): ParsedArmyUnit | null {
  if (/^(faction|army|game system|total|points|detachment|subfaction|force dispositions|exported with|data version)\b/i.test(line)) return null;
  const pointMatch = line.match(/^(.+?)\s*\(([\d,]{1,5})\s*(?:pts?|points)\)$/i) || line.match(/^(.+?)\s+[-–]\s+([\d,]{1,5})\s*(?:pts?|points)\b/i);
  if (!pointMatch) return null;
  const quantityMatch = pointMatch[1].match(/^(\d+)\s*(?:[x×]\s*|\s+)(.+)/i);
  const name = (quantityMatch ? quantityMatch[2] : pointMatch[1]).trim();
  if (name.length < 3) return null;
  // Army rules, detachments, and stratagems can carry a points-looking value
  // and get mistaken for datasheets (e.g. a "Synaptic ambush" phantom). Never
  // let a known non-datasheet name become a unit.
  if (isNonDatasheet(name)) return null;
  return { name, raw_text: line, quantity: quantityMatch ? Number(quantityMatch[1]) : 1, points: parseNumber(pointMatch[2]), role: inferRole(`${section ?? ""} ${line}`), section, category: section, enhancements: [], upgrades: [], wargear: [] };
}

function inferGameSystem(text: string): string | null {
  if (looksLikeWarhammer40kExport(text) || /warhammer\s*40|40k|adeptus|space marines|tyranids|necrons|death guard/i.test(text)) return "Warhammer 40,000";
  if (/age of sigmar|stormcast|seraphon|ossiarch/i.test(text)) return "Warhammer Age of Sigmar";
  if (/kill team/i.test(text)) return "Kill Team";
  return null;
}

function inferRole(text: string): string | null {
  if (/Attached as:\s*(.+)$/i.test(text)) return text.match(/Attached as:\s*(.+)$/i)?.[1].trim() ?? null;
  if (/character|warlord/i.test(text)) return "Character";
  if (/battleline|troops/i.test(text)) return "Battleline";
  if (/transport|rhino|trukk/i.test(text)) return "Transport";
  if (/vehicle|tank|monster|beast/i.test(text)) return "Heavy support";
  return null;
}

function inferPlaystyleTags(text: string, units: ParsedArmyUnit[]): string[] { const tags = new Set<string>(); if (/melee|assault|charge|berserker|blade/i.test(text)) tags.add("melee pressure"); if (/shoot|rifle|gun|cannon|plasma|melta/i.test(text)) tags.add("ranged firepower"); if (/scout|infiltrat|deep strike|jump|fast|drone/i.test(text)) tags.add("mobility"); if (/psyker|wizard|magic|spell/i.test(text)) tags.add("psychic/magic support"); if (units.length >= 8) tags.add("board control"); return [...tags]; }
function parseNumber(value: string): number { return Number(value.replace(/,/g, "")); }
function splitList(value: string): string[] { return value.split(/[,;]\s*/).map((item) => item.trim()).filter(Boolean); }
function titleCase(value: string): string { return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()); }
function normalizeName(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
