import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import {
  rankNights,
  rankNight,
  nextNewMoonWindow,
  equatorialToHorizontal,
  fmtLocalLongDate,
  fmtLocalTime,
} from "@/lib/astronomy";
import { LORE_STARS, CULTURAL_SYSTEMS } from "@/data/stars";
import { AL_QUAA } from "@/data/locations";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LAT = AL_QUAA.latitude;
const LON = AL_QUAA.longitude;

function todayISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// ---- the tools the agent can call, each backed by real computation ----

const TOOLS = [
  {
    name: "rank_nights",
    description:
      "Rank upcoming nights at Al Qua'a for stargazing, best first, using real astronomy (moon, darkness, Milky Way core height, meteor showers). Use for any question about which nights are good.",
    input_schema: {
      type: "object",
      properties: {
        start: { type: "string", description: "start date YYYY-MM-DD, defaults to today" },
        days: { type: "number", description: "how many nights to consider, default 30, max 60" },
      },
    },
  },
  {
    name: "next_dark_window",
    description: "Get the next new-moon window and its single best night. Use for 'when is the next great night'.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "whats_up",
    description:
      "What is in the sky on a given night at Al Qua'a: the named Arabic stars above the horizon, the planets, the moon phase, and when the Milky Way core is highest.",
    input_schema: {
      type: "object",
      properties: { date: { type: "string", description: "night date YYYY-MM-DD, defaults to today" } },
    },
  },
  {
    name: "star_lore",
    description: "Look up the real Arabic name, meaning and Bedouin lore for a star. Use for any question about a star's name or story.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string", description: "a star name in any form, e.g. Suhail, Canopus, Vega, the Pleiades" } },
      required: ["name"],
    },
  },
  {
    name: "list_sites",
    description: "List the Al Qua'a host families and their sites, prices, capacity, what they offer, and how many open nights they have. Use for booking and host questions.",
    input_schema: { type: "object", properties: {} },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  if (name === "rank_nights") {
    const start = typeof input.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.start) ? input.start : todayISO();
    const days = Math.min(60, Math.max(1, typeof input.days === "number" ? input.days : 30));
    const nights = rankNights(LAT, LON, start, days)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((n) => ({
        date: n.date,
        label: n.label,
        score: n.score,
        moonLitPercent: Math.round(n.moonIllumination * 100),
        moonPhase: n.moonPhaseName,
        milkyWayCoreHeightDeg: n.gcMaxAltitude,
        meteorShower: n.meteor?.isPeak ? n.meteor.name : null,
      }));
    return { bestNights: nights };
  }
  if (name === "next_dark_window") {
    const w = nextNewMoonWindow(LAT, LON, new Date());
    return {
      newMoon: fmtLocalLongDate(new Date(w.newMoon)),
      bestNight: w.best.label,
      bestNightDate: w.best.date,
      score: w.best.score,
      moonLitPercent: Math.round(w.best.moonIllumination * 100),
    };
  }
  if (name === "whats_up") {
    const date = typeof input.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : todayISO();
    const [y, m, d] = date.split("-").map(Number);
    const night = rankNight(LAT, LON, y, m - 1, d);
    const repISO = night.gcTransit ?? night.astroDusk ?? `${date}T19:00:00Z`;
    const repTime = new Date(repISO);
    const up = LORE_STARS.map((s) => {
      const h = equatorialToHorizontal(s.ra, s.dec, LAT, repTime, LON);
      return { name: s.transliteration, meaning: s.meaning, altitudeDeg: Math.round(h.altitude) };
    })
      .filter((x) => x.altitudeDeg > 0)
      .sort((a, b) => b.altitudeDeg - a.altitudeDeg);
    return {
      night: fmtLocalLongDate(new Date(`${date}T12:00:00Z`)),
      moonPhase: night.moonPhaseName,
      moonLitPercent: Math.round(night.moonIllumination * 100),
      milkyWayCoreHighestAt: night.gcTransit ? fmtLocalTime(new Date(night.gcTransit)) : "not up during darkness",
      milkyWayCoreHeightDeg: night.gcMaxAltitude,
      namedStarsUp: up,
      planetsUp: night.planets.map((p) => `${p.name} ${Math.round(p.altitude)} deg up`),
    };
  }
  if (name === "star_lore") {
    const q = String(input.name || "").toLowerCase().trim();
    const star =
      LORE_STARS.find((s) => s.transliteration.toLowerCase().includes(q) || q.includes(s.transliteration.toLowerCase())) ||
      LORE_STARS.find((s) => s.proper.toLowerCase().includes(q) || q.includes(s.proper.toLowerCase())) ||
      LORE_STARS.find((s) => s.constellation.toLowerCase().includes(q)) ||
      (q.includes("pleiad") || q.includes("thurayya") ? LORE_STARS.find((s) => s.id === "thurayya") : undefined);
    if (!star) {
      return { notFound: true, available: LORE_STARS.map((s) => `${s.transliteration} (${s.proper})`) };
    }
    return {
      arabicName: star.arabic,
      transliteration: star.transliteration,
      alsoKnownAs: star.proper,
      meaning: star.meaning,
      constellation: star.constellation,
      lore: star.lore,
      seasonMarker: star.seasonMarker ?? null,
    };
  }
  if (name === "list_sites") {
    const sites = await prisma.site.findMany({
      include: { host: true, availabilities: { where: { isOpen: true }, orderBy: { date: "asc" } } },
      orderBy: { name: "asc" },
    });
    return {
      sites: sites.map((s) => ({
        id: s.id,
        name: s.name,
        hostFamily: s.host.familyName,
        pricePerPersonAed: s.pricePerPerson,
        capacity: s.capacity,
        offers: s.offerings,
        openNights: s.availabilities.length,
        nextOpenNight: s.availabilities[0] ? fmtLocalLongDate(s.availabilities[0].date) : null,
        bookLink: `/book/${s.id}`,
      })),
    };
  }
  return { error: "unknown tool" };
}

const SYSTEM = [
  "You are Anwa's sky companion, a warm, knowledgeable guide to the dark night sky at Al Qua'a in the UAE.",
  "Help visitors plan a stargazing night, understand what they will see, learn the old Arab and Bedouin star names, and find a host family to book with.",
  "ALWAYS use the tools for real facts: which nights are good, what is up on a night, a star's name or story, and the host sites. Never invent dates, scores, star names, lore, prices or availability.",
  "Keep replies warm, plain and short, a few sentences. Explain any astronomy term in plain words. British spelling. Never use em dashes or en dashes, only plain hyphens.",
  "When someone wants to book, name a suitable host family and tell them to open that site's page to send a request.",
].join(" ");

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function GET() {
  return NextResponse.json({ live: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (history.length === 0) {
    return NextResponse.json({ error: "No message" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // graceful fallback: still give a real, computed answer so it is never dead
    const w = nextNewMoonWindow(LAT, LON, new Date());
    return NextResponse.json({
      reply:
        "Live chat needs the guide connected, but here is a real answer to start: the next great night is " +
        `${w.best.label} (scoring ${w.best.score} out of 100, moon only ${Math.round(w.best.moonIllumination * 100)}% lit). ` +
        "Open the Planner to see every upcoming night, or Host & Book to find a family to stay with.",
      live: false,
      toolsUsed: ["next_dark_window"],
    });
  }

  try {
    const AnthropicSDK = (await import("@anthropic-ai/sdk")).default;
    const client = new AnthropicSDK({ apiKey: process.env.ANTHROPIC_API_KEY });
    const model = process.env.ANWA_GUIDE_MODEL || "claude-opus-4-8";

    // build the running message list in Anthropic format
    const messages: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const toolsUsed: string[] = [];
    let finalText = "";

    for (let round = 0; round < 6; round++) {
      const resp = await client.messages.create({
        model,
        max_tokens: 1200,
        system: SYSTEM,
        tools: TOOLS as Anthropic.Tool[],
        messages,
      });

      if (resp.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: resp.content });
        const results: Anthropic.ToolResultBlockParam[] = [];
        for (const block of resp.content) {
          if (block.type === "tool_use") {
            toolsUsed.push(block.name);
            const out = await runTool(block.name, (block.input || {}) as Record<string, unknown>);
            results.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(out),
            });
          }
        }
        messages.push({ role: "user", content: results });
        continue;
      }

      finalText = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      break;
    }

    return NextResponse.json({
      reply: finalText || "I am not sure how to help with that one. Try asking about the best nights, what is up tonight, a star's story, or finding a host.",
      live: true,
      toolsUsed: [...new Set(toolsUsed)],
    });
  } catch (err) {
    return NextResponse.json({
      reply: "Something went wrong reaching the companion just now. Please try again in a moment.",
      live: false,
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}
