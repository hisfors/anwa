import { NextResponse } from "next/server";
import { rankNight, equatorialToHorizontal, fmtLocalLongDate, fmtLocalTime } from "@/lib/astronomy";
import { LORE_STARS } from "@/data/stars";
import { AL_QUAA } from "@/data/locations";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function POST(request: Request) {
  let body: { date?: string; latitude?: number; longitude?: number; name?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const latitude = typeof body.latitude === "number" ? body.latitude : AL_QUAA.latitude;
  const longitude = typeof body.longitude === "number" ? body.longitude : AL_QUAA.longitude;
  const name = (typeof body.name === "string" ? body.name : "").trim().slice(0, 40);
  const dateStr = body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : "2026-07-12";
  const [y, m, d] = dateStr.split("-").map(Number);

  const night = rankNight(latitude, longitude, y, m - 1, d);
  const repISO = night.gcTransit ?? night.astroDusk ?? `${dateStr}T19:00:00Z`;
  const repTime = new Date(repISO);
  const longDate = fmtLocalLongDate(new Date(`${dateStr}T12:00:00Z`));

  const up = LORE_STARS.map((s) => {
    const h = equatorialToHorizontal(s.ra, s.dec, latitude, repTime, longitude);
    return { star: s, alt: h.altitude };
  })
    .filter((x) => x.alt > 0)
    .sort((a, b) => b.alt - a.alt);

  const facts = [
    { label: "The night", value: longDate },
    { label: "Moon", value: `${night.moonPhaseName}, ${Math.round(night.moonIllumination * 100)}% lit` },
    {
      label: "Milky Way core",
      value: night.gcTransit ? `highest at ${fmtLocalTime(new Date(night.gcTransit))}` : "below the horizon",
    },
    { label: "Named stars overhead", value: up.slice(0, 3).map((x) => x.star.transliteration).join(", ") || "the winter stars" },
  ];

  const topStar = up[0]?.star;

  // graceful fallback story (no key), grounded in the real night
  function fallbackStory(): string {
    const star = topStar
      ? `${topStar.transliteration}, ${topStar.meaning},`
      : "the old stars";
    const core = night.gcTransit
      ? `the bright core of the Milky Way climbed over the desert and stood about ${night.gcMaxAltitude} degrees high`
      : "the winter stars wheeled overhead";
    return (
      `On ${longDate}, under one of the darkest skies in the country, ${core}. ` +
      `${star} the same star the Bedouin once read to know the seasons, watched over Al Qua'a. ` +
      `A quiet, black sky, and the family who keep this land beneath it.`
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ story: fallbackStory(), facts, date: longDate, chartISO: repISO, source: "sample" });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const model = process.env.ANWA_GUIDE_MODEL || "claude-opus-4-8";
    const grounding = {
      night: longDate,
      moon: `${night.moonPhaseName}, ${Math.round(night.moonIllumination * 100)}% lit`,
      milkyWayCore: night.gcTransit ? `highest at ${fmtLocalTime(new Date(night.gcTransit))}, about ${night.gcMaxAltitude} degrees up` : "below the horizon",
      namedStarsOverhead: up.slice(0, 4).map((x) => ({ name: x.star.transliteration, meaning: x.star.meaning })),
      guestName: name || null,
    };
    const resp = await client.messages.create({
      model,
      max_tokens: 320,
      system:
        "You write a short, warm keepsake about a guest's night under the dark sky at Al Qua'a in the UAE. " +
        "Three sentences at most. Evocative but true: use only the real stars and facts given. " +
        "Name one or two stars by their Arabic name and meaning. If a guest name is given, you may address them once, warmly. " +
        "British spelling. No em dashes or en dashes, plain hyphens only. Reply with only the keepsake text, no preamble.",
      messages: [{ role: "user", content: JSON.stringify(grounding) }],
    });
    const story = resp.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return NextResponse.json({ story: story || fallbackStory(), facts, date: longDate, chartISO: repISO, source: "live" });
  } catch {
    return NextResponse.json({ story: fallbackStory(), facts, date: longDate, chartISO: repISO, source: "sample" });
  }
}
