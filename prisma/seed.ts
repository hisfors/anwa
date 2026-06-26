/**
 * Seed realistic Al Qua'a host sites and pre-fill each one's availability from the
 * Planner's top-ranked dark nights, so a booking is always tied to a genuinely good
 * stargazing night. Run with `npm run db:seed` (or `npm run db:reset` to rebuild).
 */

import { PrismaClient } from "@prisma/client";
import { rankNights } from "@/lib/astronomy";

const prisma = new PrismaClient();

interface SeedSite {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  capacity: number;
  offerings: string;
  pricePerPerson: number;
  bortleClass: number;
  skyBrightness: number;
}

interface SeedHost {
  name: string;
  familyName: string;
  phone: string;
  bio: string;
  sites: SeedSite[];
}

const HOSTS: SeedHost[] = [
  {
    name: "Saif Al Marar",
    familyName: "Al Marar family",
    phone: "+971 50 000 0001",
    bio: "Third-generation camel herders. The family has run dairy and racing camels on the Al Qua'a plateau for over forty years and now opens the farm to night visitors.",
    sites: [
      {
        name: "Al Marar Camel Farm Camp",
        description:
          "A working camel farm on open gravel plain with an uninterrupted southern horizon, ideal for the Milky Way core. Guests sit by the herd after dark.",
        latitude: 23.521,
        longitude: 55.487,
        capacity: 12,
        offerings: "Camel ride, Bedouin tea and dates, fresh camel milk, traditional dinner, floor seating and blankets",
        pricePerPerson: 180,
        bortleClass: 2,
        skyBrightness: 21.8,
      },
    ],
  },
  {
    name: "Mariam Bin Huwaidin",
    familyName: "Bin Huwaidin family",
    phone: "+971 50 000 0002",
    bio: "The family keeps a desert majlis south of the main track. Mariam learned the old star names from her grandfather and tells them to guests in Arabic.",
    sites: [
      {
        name: "Bin Huwaidin Desert Majlis",
        description:
          "A low dune hollow that blocks the faint horizon glow from the north, with a carpeted majlis and a fire. Quiet, no vehicles after sunset.",
        latitude: 23.534,
        longitude: 55.502,
        capacity: 8,
        offerings: "Bedouin majlis, gahwa and dates, storytelling in Arabic with translation, dinner, telescope on request",
        pricePerPerson: 220,
        bortleClass: 2,
        skyBrightness: 21.9,
      },
    ],
  },
  {
    name: "Khalfan Al Ketbi",
    familyName: "Al Ketbi family",
    phone: "+971 50 000 0003",
    bio: "Khalfan runs a small herd and a guest camp near the Tropic of Cancer marker. He guides the night himself and is building a second platform for larger groups.",
    sites: [
      {
        name: "Al Ketbi Tropic Star Camp",
        description:
          "Sits almost exactly on the Tropic of Cancer, where the Galactic Centre climbs highest. Raised viewing deck and reclined seating facing south.",
        latitude: 23.515,
        longitude: 55.471,
        capacity: 15,
        offerings: "Raised viewing deck, camel ride, tea and dinner, green-laser sky tour, family tent for overnight stays",
        pricePerPerson: 250,
        bortleClass: 2,
        skyBrightness: 21.7,
      },
    ],
  },
  {
    name: "Aisha Al Mazrouei",
    familyName: "Al Mazrouei family",
    phone: "+971 50 000 0004",
    bio: "The Mazrouei family offers overnight desert stays. Aisha handles bookings and cooks; her sons manage the camels and set up the camp each evening.",
    sites: [
      {
        name: "Mazrouei Dunes Overnight Stay",
        description:
          "Soft red dunes a short drive off the plateau, for guests who want to sleep out under the sky and watch the core rise after midnight.",
        latitude: 23.508,
        longitude: 55.515,
        capacity: 10,
        offerings: "Overnight tents, full board, camel ride at dawn, sand-boarding, sunrise over the dunes",
        pricePerPerson: 300,
        bortleClass: 2,
        skyBrightness: 21.8,
      },
    ],
  },
];

function startISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.site.deleteMany();
  await prisma.host.deleteMany();

  const today = new Date();
  const from = startISO(today);

  for (const h of HOSTS) {
    const host = await prisma.host.create({
      data: {
        name: h.name,
        familyName: h.familyName,
        phone: h.phone,
        bio: h.bio,
      },
    });

    for (const s of h.sites) {
      const site = await prisma.site.create({
        data: { ...s, hostId: host.id },
      });

      // pre-fill availability from the Planner's best upcoming nights for this site
      const ranked = rankNights(s.latitude, s.longitude, from, 45)
        .filter((n) => n.score >= 55)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .sort((a, b) => a.date.localeCompare(b.date));

      for (const n of ranked) {
        const note =
          n.meteor?.isPeak
            ? `${n.meteor.name} peak, ${Math.round(n.moonIllumination * 100)}% moon`
            : `${n.moonPhaseName}, ${Math.round(n.moonIllumination * 100)}% moon, core ${n.gcMaxAltitude}deg`;
        await prisma.availability.create({
          data: {
            siteId: site.id,
            date: new Date(`${n.date}T17:00:00.000Z`), // ~21:00 local
            score: n.score,
            moonIllumination: n.moonIllumination,
            note,
          },
        });
      }
      console.log(`Seeded ${site.name} with ${ranked.length} open nights`);
    }
  }

  // one example booking so the host dashboard is not empty in the demo
  const firstSite = await prisma.site.findFirst({ orderBy: { name: "asc" } });
  const firstAvail = firstSite
    ? await prisma.availability.findFirst({ where: { siteId: firstSite.id }, orderBy: { date: "asc" } })
    : null;
  if (firstSite && firstAvail) {
    await prisma.booking.create({
      data: {
        siteId: firstSite.id,
        guestName: "Lena Hoffmann",
        guestEmail: "lena.h@example.com",
        partySize: 2,
        date: firstAvail.date,
        message: "Visiting from Germany, would love the Arabic star stories with English translation.",
        language: "en",
        status: "REQUESTED",
      },
    });
    console.log("Seeded one sample booking request");
  }

  const counts = {
    hosts: await prisma.host.count(),
    sites: await prisma.site.count(),
    availability: await prisma.availability.count(),
    bookings: await prisma.booking.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
