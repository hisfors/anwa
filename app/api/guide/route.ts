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
  // expose whether live generation is available, for the UI to label honestly
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
    // no-key mode: serve the committed sample, label live as unavailable
    const sample = samples[language] || samples.en;
    return NextResponse.json({
      tour: sample,
      live: false,
      requestedLanguage: language,
      servedLanguage: sample.language,
      note:
        "Live generation is unavailable because no ANTHROPIC_API_KEY is set. This is the committed sample tour. Add a key in .env to generate for this exact night in any language.",
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
        ? `transits ${fmtLocalTime(new Date(night.gcTransit))} local at ${night.gcMaxAltitude} deg altitude`
        : "not above the horizon during darkness on this night",
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
      "You are an expert Bedouin star-lore guide for Al Qua'a in the UAE. You write a guided night-sky tour. " +
      "You MUST only use the heritage facts provided in the user's JSON. Do not invent star names, meanings, or lore. " +
      "If a star is not in the provided list, do not mention it by an Arabic name. " +
      "Use British spelling. Never use em dashes or en dashes, only plain hyphens. No filler, tight and specific. " +
      "Reply with ONLY a JSON object, no markdown fence, matching exactly this TypeScript type: " +
      "{ title: string; intro: string; segments: { time: string; phase: string; heading: string; facts: { label: string; value: string }[]; narration: string; stars: string[] }[]; closing: string }. " +
      "Produce 3 to 5 segments ordered through the night. Put altitudes and times in facts as strings with units. " +
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
        `Computed for ${grounding.night} at ${grounding.location} with astronomy-engine.`,
        `Galactic Centre: ${grounding.galacticCentre}.`,
        `Lore stars above the horizon and their etymology came from the curated dataset.`,
        `Generated live with ${model}, grounded only in the supplied heritage facts.`,
      ],
      source: "live",
    };

    return NextResponse.json({ tour, live: true, requestedLanguage: language, servedLanguage: language });
  } catch (err) {
    // any failure falls back to the sample, so the demo never breaks
    const sample = samples[language] || samples.en;
    return NextResponse.json({
      tour: sample,
      live: false,
      requestedLanguage: language,
      servedLanguage: sample.language,
      note:
        "Live generation failed, serving the committed sample tour instead. " +
        (err instanceof Error ? err.message : "unknown error"),
    });
  }
}
