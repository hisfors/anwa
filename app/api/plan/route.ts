import { NextResponse } from "next/server";
import { rankNights, nextNewMoonWindow } from "@/lib/astronomy";
import { AL_QUAA } from "@/data/locations";

export const dynamic = "force-dynamic";

/**
 * Rank a run of upcoming nights for a location. Pure astronomy, computed server-side.
 * GET /api/plan?lat=23.52&lon=55.49&start=2026-07-01&days=30
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? `${AL_QUAA.latitude}`);
  const lon = parseFloat(searchParams.get("lon") ?? `${AL_QUAA.longitude}`);
  const days = Math.min(45, Math.max(1, parseInt(searchParams.get("days") ?? "30", 10)));

  let start = searchParams.get("start");
  if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    const now = new Date();
    start = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
  }

  if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const nights = rankNights(lat, lon, start, days);
  const optimal = nextNewMoonWindow(lat, lon, new Date(`${start}T12:00:00Z`));

  return NextResponse.json({
    location: { latitude: lat, longitude: lon },
    start,
    days,
    nights,
    optimal,
  });
}
