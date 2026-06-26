import { NextResponse } from "next/server";
import {
  rankNight,
  equatorialToHorizontal,
  fmtLocalTime,
  fmtLocalLongDate,
} from "@/lib/astronomy";
import { LORE_STARS, CULTURAL_SYSTEMS } from "@/data/stars";
import { AL_QUAA } from "@/data/locations";
import type { Tour } from "@/lib/guide-types";
import sampleTour from "@/data/sample-tour.json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  date?: string; // yyyy-mm-dd
  latitude?: number;
  longitude?: number;
  language?: string;
  languageLabel?: string;
  rtl?: boolean;
  siteName?: string;
}

const samples = sampleTour as Record<string, Tour>;

export async function GET() {
  // report whether a fresh tour can be written right now, so the page can say so
  return NextResponse.json({ live: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const latitude = typeof body.latitude === "number" ? body.latitude : AL_QUAA.latitude;
  const longitude = typeof body.longitude === "number" ? body.longitude : AL_QUAA.longitude;
  const language = body.language || "en";
  const languageLabel = body.languageLabel || "English";
  const rtl = Boolean(body.rtl);

  const dateStr =
    body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : new Date().toISOString().slice(0, 10);
  const [y, m, d] = dateStr.split("-").map(Number);

  // real astronomy for the night, used to ground the tour
  const night = rankNight(latitude, longitude, y, m - 1, d);
  const repISO = night.gcTransit ?? night.astroDusk ?? `${dateStr}T19:00:00Z`;
  const repTime = new Date(repISO);

  // lore stars above the horizon at the representative moment
  const loreUp = LORE_STARS.map((s) => {
    const h = equatorialToHorizontal(s.ra, s.dec, latitude, repTime, longitude);
    return { star: s, alt: h.altitude, az: h.azimuth };
  })
    .filter((x) => x.alt > 0)
    .sort((a, b) => b.alt - a.alt);

  const haveKey = Boolean(process.env.ANTHROPIC_API_KEY);

  if (!haveKey) {
    // show the example tour for now
    const sample = samples[language] || samples.en;
    return NextResponse.json({
      tour: sample,
      live: false,
      requestedLanguage: language,
      servedLanguage: sample.language,
      note:
        "A full tour for any night in any language is coming soon. Here is an example of the night for now.",
    });
  }

  // live generation, grounded strictly in the curated heritage dataset
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const grounding = {
      location: `${AL_QUAA.name} approx, ${latitude.toFixed(2)}N ${longitude.toFixed(2)}E`,
      night: fmtLocalLongDate(new Date(`${dateStr}T12:00:00Z`)),
      astroDusk: fmtLocalTime(night.astroDusk ? new Date(night.astroDusk) : null),
      astroDawn: fmtLocalTime(night.astroDawn ? new Date(night.astroDawn) : null),
      moonIllumination: `${(night.moonIllumination * 100).toFixed(0)}%`,
      moonPhase: night.moonPhaseName,
      galacticCentre: night.gcTransit
        ? `is highest around ${fmtLocalTime(new Date(night.gcTransit))}, about ${Math.round((night.gcMaxAltitude / 90) * 100)} per cent of the way up the southern sky`
        : "stays below the horizon through the dark hours on this night",
      planetsUp: night.planets.map((p) => `${p.name} ${p.altitude.toFixed(0)} deg`),
      loreStarsUp: loreUp.map((x) => ({
        transliteration: x.star.transliteration,
        arabic: x.star.arabic,
        meaning: x.star.meaning,
        lore: x.star.lore,
        seasonMarker: x.star.seasonMarker,
        altitude: `${x.alt.toFixed(0)} deg`,
        azimuth: `${x.az.toFixed(0)} deg`,
      })),
      culturalSystems: CULTURAL_SYSTEMS,
    };

    const system =
      "You are a warm, plain-spoken Bedouin star-lore guide for Al Qua'a in the UAE. You write a guided night-sky tour for a first-time visitor who knows no astronomy. " +
      "You MUST only use the heritage facts provided in the user's JSON. Do not invent star names, meanings, or lore. " +
      "If a star is not in the provided list, do not mention it by an Arabic name. " +
      "Write in plain, calm, welcoming language. Talk about what the visitor will see in the sky, never about systems or data. " +
      "Lead any technical term with everyday words and briefly gloss it: say 'the Milky Way bright core' not 'Galactic Centre'; say 'the hours of full darkness' not 'astronomical night'; describe how high something sits ('a third of the way up the sky') rather than giving raw degrees in the prose; give a number a sense of scale (for example 'a Bortle 2 of 9, among the darkest skies'). " +
      "Use British spelling. Never use em dashes or en dashes, only plain hyphens. No filler, no boasting, short real sentences. " +
      "Reply with ONLY a JSON object, no markdown fence, matching exactly this TypeScript type: " +
      "{ title: string; intro: string; segments: { time: string; phase: string; heading: string; facts: { label: string; value: string }[]; narration: string; stars: string[] }[]; closing: string }. " +
      "Produce 3 to 5 segments ordered through the night. Keep each phase label a plain friendly phrase. In the facts, keep the numbers but use plain labels a visitor understands. " +
      "Weave the Arabic names and their real meanings into the narration. Write everything in the requested language.";

    const user =
      `Requested language: ${languageLabel} (code ${language}). ` +
      (body.siteName ? `Host site: ${body.siteName}. ` : "") +
      "Ground the tour strictly in this computed sky and heritage data:\n" +
      JSON.stringify(grounding, null, 2);

    const model = process.env.ANWA_GUIDE_MODEL || "claude-opus-4-8";
    const resp = await client.messages.create({
      model,
      max_tokens: 3000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = resp.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonStr);

    const tour: Tour = {
      language,
      languageLabel,
      rtl,
      title: parsed.title,
      intro: parsed.intro,
      location: grounding.location,
      night: grounding.night,
      segments: parsed.segments,
      closing: parsed.closing,
      grounding: [
        `This tour is for the night of ${grounding.night} at ${grounding.location}.`,
        `The Milky Way bright core ${grounding.galacticCentre}.`,
        `The star names and their meanings come from old Arab and Bedouin sky lore.`,
        `The order of the night follows where each star and planet sits as the hours pass.`,
      ],
      source: "live",
    };

    return NextResponse.json({ tour, live: true, requestedLanguage: language, servedLanguage: language });
  } catch {
    // fall back to the example tour so the page always has something to show
    const sample = samples[language] || samples.en;
    return NextResponse.json({
      tour: sample,
      live: false,
      requestedLanguage: language,
      servedLanguage: sample.language,
      note:
        "A fresh tour is not ready just now. Here is an example of the night for now.",
    });
  }
}
