import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

interface SkyReading {
  source: "sample" | "live" | "unavailable";
  bortle: number | null;
  bortleLabel: string;
  limitingMagnitude: string;
  milkyWay: string;
  lightPollution: string;
  summary: string;
}

// committed readings for the team's own photos, so the feature demos with no key
const SAMPLES: Record<string, SkyReading> = {
  landscape: {
    source: "sample",
    bortle: 2,
    bortleLabel: "Bortle 2 of 9, a truly dark sky",
    limitingMagnitude: "about 6.5 (very faint stars visible)",
    milkyWay: "Clearly visible, the bright summer core arching up from the horizon",
    lightPollution: "Only a thin orange band low on the horizon, from a distant town",
    summary:
      "A genuinely dark site. The Milky Way and the faint green airglow both show, with hundreds of stars and only a sliver of distant city light on the horizon.",
  },
  portrait: {
    source: "sample",
    bortle: 2,
    bortleLabel: "Bortle 2 of 9, a truly dark sky",
    limitingMagnitude: "about 6.5 (very faint stars visible)",
    milkyWay: "Clearly visible, standing almost upright in the sky",
    lightPollution: "A faint glow at the very bottom, otherwise none",
    summary:
      "The Milky Way core stands tall and bright, the way it only does under a properly dark sky this close to the Tropic of Cancer.",
  },
};

export async function POST(request: Request) {
  let body: { sample?: string; imageBase64?: string; mediaType?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // a committed example photo: always works
  if (body.sample && SAMPLES[body.sample]) {
    return NextResponse.json({ reading: SAMPLES[body.sample] });
  }

  const haveImage = typeof body.imageBase64 === "string" && body.imageBase64.length > 100;
  if (!haveImage) {
    return NextResponse.json({ error: "No image" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reading: {
        source: "unavailable",
        bortle: null,
        bortleLabel: "",
        limitingMagnitude: "",
        milkyWay: "",
        lightPollution: "",
        summary:
          "Reading your own photo needs the guide connected. Try one of the Al Qua'a photos below to see how it works.",
      } satisfies SkyReading,
    });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const model = process.env.ANWA_GUIDE_MODEL || "claude-opus-4-8";
    const mediaType = (body.mediaType || "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/webp";

    const resp = await client.messages.create({
      model,
      max_tokens: 600,
      system:
        "You assess a night-sky photograph for how dark the sky is. Look at how many stars show, " +
        "whether the Milky Way and any green airglow are visible, and any orange or grey light-pollution glow. " +
        "Estimate the Bortle dark-sky class (1 darkest to 9 inner city). Be honest: a bright or empty sky is a high Bortle number. " +
        "Reply with ONLY a JSON object, no markdown, of this shape: " +
        '{"bortle": number 1-9, "bortleLabel": short plain phrase like "Bortle 4 of 9, rural sky", ' +
        '"limitingMagnitude": short phrase, "milkyWay": short phrase, "lightPollution": short phrase, "summary": one or two plain sentences}. ' +
        "British spelling. No em dashes or en dashes, plain hyphens only. If the photo is not a night sky, say so in the summary and set bortle to null.",
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: body.imageBase64 as string } },
            { type: "text", text: "Assess this night sky photo." },
          ],
        },
      ],
    });

    const text = resp.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonStr);
    return NextResponse.json({
      reading: {
        source: "live",
        bortle: typeof parsed.bortle === "number" ? parsed.bortle : null,
        bortleLabel: parsed.bortleLabel || "",
        limitingMagnitude: parsed.limitingMagnitude || "",
        milkyWay: parsed.milkyWay || "",
        lightPollution: parsed.lightPollution || "",
        summary: parsed.summary || "",
      } satisfies SkyReading,
    });
  } catch (err) {
    return NextResponse.json({
      reading: {
        source: "unavailable",
        bortle: null,
        bortleLabel: "",
        limitingMagnitude: "",
        milkyWay: "",
        lightPollution: "",
        summary: "Could not read that photo just now. Please try again in a moment.",
      } satisfies SkyReading,
    });
  }
}
