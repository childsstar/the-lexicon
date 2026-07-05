import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getChronicle } from "@/lib/chronicle";
import { rankBanners, scoreAnswers } from "@/lib/chronicle/engine";
import {
  CHRONICLE_RESULT_SCHEMA,
  CHRONICLE_SYSTEM,
  TemplateResultGenerator,
  buildResultPrompt,
  isValidChronicleResult,
} from "@/lib/chronicle/generate";
import type { Banner, ChronicleResult } from "@/lib/chronicle/types";
import { filterBannersForActiveContext } from "@/lib/chronicle/types";
import { filterByGameSystems, isGameSystemKey } from "@/lib/game-systems";
import { isRealmKey } from "@/lib/realms";
import { isGameKey } from "@/lib/games";

// Generates a Chronicle reading. The Anthropic API key lives only here,
// server-side; the browser never sees it. Every failure path falls back to
// the deterministic template generator so the reveal never breaks.

const MODEL = process.env.CHRONICLE_MODEL || "claude-opus-4-8";

// Netlify synchronous functions allow ~10s — leave headroom for our own
// overhead, and never let the SDK retry past the platform limit.
const CLAUDE_TIMEOUT_MS = 8_500;

function bannerGameSystem(banner: Banner): string {
  return banner.gameSystem ?? "Unknown game system";
}

type RequestBody = {
  slug?: unknown;
  answers?: unknown;
  rotation?: unknown;
  systems?: unknown;
  realmKey?: unknown;
  gameKey?: unknown;
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entry = typeof body.slug === "string" ? getChronicle(body.slug) : null;
  if (!entry) {
    return NextResponse.json({ error: "Unknown chronicle" }, { status: 404 });
  }
  const { quiz } = entry;

  // Mirror the client's exact filter precedence so both rankings agree —
  // an explicit Find Your World hand-off (?systems=) wins; otherwise fall
  // back to the caller's active realm/game via the same canonical matcher
  // Hall of Banners and venues use. Unknown/missing values are dropped, so
  // a stale or malformed field never breaks the pool, it just falls
  // through to "unfiltered."
  const preferredSystems = Array.isArray(body.systems)
    ? body.systems.filter(
        (s): s is string => typeof s === "string"
      ).filter(isGameSystemKey)
    : [];
  const realmKey =
    typeof body.realmKey === "string" && isRealmKey(body.realmKey)
      ? body.realmKey
      : null;
  const gameKey =
    typeof body.gameKey === "string" && isGameKey(body.gameKey)
      ? body.gameKey
      : null;
  const banners =
    preferredSystems.length > 0
      ? filterByGameSystems(entry.banners, preferredSystems)
      : filterBannersForActiveContext(entry.banners, { realmKey, gameKey })
          .banners;

  const answers = body.answers;
  const validAnswers =
    Array.isArray(answers) &&
    answers.length === quiz.questions.length &&
    answers.every(
      (a, i) =>
        Number.isInteger(a) && a >= 0 && a < quiz.questions[i].options.length
    );
  if (!validAnswers) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const rotation =
    Number.isInteger(body.rotation) &&
    (body.rotation as number) >= 0 &&
    (body.rotation as number) < 3
      ? (body.rotation as number)
      : 0;

  // Never trust client scoring — re-derive everything server-side.
  const scores = scoreAnswers(quiz, answers as number[]);
  const baseRanked = rankBanners(scores, banners);
  const ranked = [...baseRanked.slice(rotation), ...baseRanked.slice(0, rotation)];
  const generatorInput = { quiz, answers: answers as number[], scores, ranked };

  const template = await new TemplateResultGenerator().generate(generatorInput);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ result: template, source: "template" });
  }

  try {
    const client = new Anthropic({
      timeout: CLAUDE_TIMEOUT_MS,
      maxRetries: 0, // a retry would blow the platform's function timeout
    });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      // No `thinking` param: this is a short creative generation where
      // latency matters more than deliberation (must fit the ceremony).
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: CHRONICLE_RESULT_SCHEMA },
      },
      system: CHRONICLE_SYSTEM,
      messages: [{ role: "user", content: buildResultPrompt(generatorInput) }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ result: template, source: "template" });
    }

    const text = response.content.find((b) => b.type === "text")?.text;
    const parsed: unknown = text ? JSON.parse(text) : null;
    if (!isValidChronicleResult(parsed)) {
      console.error("Chronicle generation returned invalid shape");
      return NextResponse.json({ result: template, source: "template" });
    }

    // The model narrates; the engine decides. Pin the recommendation (and
    // alternate identities) to the server-side ranking so a creative
    // paraphrase can never change someone's matched faction.
    const result: ChronicleResult = {
      ...parsed,
      gameSystem: bannerGameSystem(ranked[0]),
      primaryFaction: ranked[0].primaryFaction,
      alternateFactions: parsed.alternateFactions
        .slice(0, 2)
        .map((alt, i) => pinAlternate(alt, ranked[i + 1])),
      imagePrompt: ranked[0].imagePrompt,
    };

    return NextResponse.json({ result, source: "ai" });
  } catch (err) {
    // Timeouts, rate limits, network, JSON parse — all land here. The
    // ceremony is already covering our latency; serve the template.
    console.error(
      "Chronicle generation failed, using template:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ result: template, source: "template" });
  }
}

function pinAlternate(
  alt: ChronicleResult["alternateFactions"][number],
  banner: Banner
): ChronicleResult["alternateFactions"][number] {
  return {
    bannerName: banner.name,
    gameSystem: bannerGameSystem(banner),
    faction: banner.primaryFaction,
    whisper: alt.whisper,
  };
}
