import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rankNights } from "@/lib/astronomy";

export const dynamic = "force-dynamic";

export async function GET() {
  const sites = await prisma.site.findMany({
    include: {
      host: true,
      availabilities: { where: { isOpen: true }, orderBy: { date: "asc" } },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ sites });
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return isFinite(n) ? n : fallback;
}

function startISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  let b: Record<string, unknown> = {};
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required = ["hostName", "familyName", "phone", "siteName", "description"];
  for (const k of required) {
    if (!b[k] || typeof b[k] !== "string" || !(b[k] as string).trim()) {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  const latitude = num(b.latitude, 23.52);
  const longitude = num(b.longitude, 55.49);
  const capacity = Math.max(1, Math.round(num(b.capacity, 8)));
  const pricePerPerson = Math.max(0, Math.round(num(b.pricePerPerson, 200)));

  try {
  const host = await prisma.host.create({
    data: {
      name: (b.hostName as string).trim(),
      familyName: (b.familyName as string).trim(),
      phone: (b.phone as string).trim(),
      bio: typeof b.bio === "string" && b.bio.trim() ? (b.bio as string).trim() : "A local host family in Al Qua'a.",
    },
  });

  const site = await prisma.site.create({
    data: {
      hostId: host.id,
      name: (b.siteName as string).trim(),
      description: (b.description as string).trim(),
      latitude,
      longitude,
      capacity,
      offerings:
        typeof b.offerings === "string" && b.offerings.trim()
          ? (b.offerings as string).trim()
          : "Bedouin tea and dates, dinner, floor seating",
      pricePerPerson,
      bortleClass: Math.round(num(b.bortleClass, 2)),
      skyBrightness: num(b.skyBrightness, 21.8),
    },
  });

  // pre-fill availability from the Planner's best upcoming nights for this site
  const ranked = rankNights(latitude, longitude, startISO(new Date()), 45)
    .filter((n) => n.score >= 55)
    .sort((a, c) => c.score - a.score)
    .slice(0, 6)
    .sort((a, c) => a.date.localeCompare(c.date));

  for (const n of ranked) {
    await prisma.availability.create({
      data: {
        siteId: site.id,
        date: new Date(`${n.date}T17:00:00.000Z`),
        score: n.score,
        moonIllumination: n.moonIllumination,
        note: `${n.moonPhaseName}, ${Math.round(n.moonIllumination * 100)}% moon, core ${n.gcMaxAltitude}deg`,
      },
    });
  }

  return NextResponse.json({ site: { ...site, hostName: host.name }, openNights: ranked.length }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not list the site" }, { status: 500 });
  }
}
