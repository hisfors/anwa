import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: { site: { include: { host: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  let b: Record<string, unknown> = {};
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const siteId = typeof b.siteId === "string" ? b.siteId : "";
  const guestName = typeof b.guestName === "string" ? b.guestName.trim() : "";
  const guestEmail = typeof b.guestEmail === "string" ? b.guestEmail.trim() : "";
  const date = typeof b.date === "string" ? b.date : "";
  const partySize = Math.round(typeof b.partySize === "number" ? b.partySize : parseInt(String(b.partySize), 10));
  const message = typeof b.message === "string" ? b.message.trim() : "";
  const language = typeof b.language === "string" ? b.language : "en";

  if (!siteId || !guestName || !guestEmail || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(guestEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!isFinite(partySize) || partySize < 1) {
    return NextResponse.json({ error: "Party size must be at least 1" }, { status: 400 });
  }
  const when = new Date(date);
  if (isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }
  if (partySize > site.capacity) {
    return NextResponse.json(
      { error: `Party size exceeds capacity (${site.capacity})` },
      { status: 400 },
    );
  }

  // a booking must land on a night the host actually opened (a Planner-good night),
  // not any arbitrary date a crafted request could supply
  const avail = await prisma.availability.findFirst({
    where: { siteId, date: when, isOpen: true },
  });
  if (!avail) {
    return NextResponse.json(
      { error: "That night is not open for this site" },
      { status: 400 },
    );
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        siteId,
        guestName,
        guestEmail,
        partySize,
        date: when,
        message: message || "No message.",
        language,
        status: "REQUESTED",
      },
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the booking" }, { status: 500 });
  }
}
