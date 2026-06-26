/**
 * The fixed annual meteor shower calendar, from the IMO (International Meteor
 * Organization) working list. Peak dates shift by about a day year to year; the
 * month/day here is the nominal peak. ZHR is the zenithal hourly rate at peak under
 * a perfect dark sky, which a Bortle 2 site like Al Qua'a can approach.
 *
 * Source: IMO Meteor Shower Calendar, https://www.imo.net/resources/calendar/
 */

export interface MeteorShower {
  id: string;
  name: string;
  /** nominal peak, month is 1-12 */
  peakMonth: number;
  peakDay: number;
  /** active window, used to flag a night that falls inside it */
  activeStart: { month: number; day: number };
  activeEnd: { month: number; day: number };
  zhr: number;
  parent: string;
  radiant: string;
  note: string;
}

export const METEOR_SHOWERS: MeteorShower[] = [
  {
    id: "quadrantids",
    name: "Quadrantids",
    peakMonth: 1,
    peakDay: 4,
    activeStart: { month: 12, day: 28 },
    activeEnd: { month: 1, day: 12 },
    zhr: 120,
    parent: "asteroid 2003 EH1",
    radiant: "Boötes",
    note: "A sharp, short peak only a few hours wide. Strong but easy to miss.",
  },
  {
    id: "lyrids",
    name: "Lyrids",
    peakMonth: 4,
    peakDay: 22,
    activeStart: { month: 4, day: 16 },
    activeEnd: { month: 4, day: 25 },
    zhr: 18,
    parent: "comet C/1861 G1 Thatcher",
    radiant: "Lyra",
    note: "Modest but reliable, with occasional bright fireballs.",
  },
  {
    id: "eta-aquariids",
    name: "Eta Aquariids",
    peakMonth: 5,
    peakDay: 6,
    activeStart: { month: 4, day: 19 },
    activeEnd: { month: 5, day: 28 },
    zhr: 50,
    parent: "comet 1P/Halley",
    radiant: "Aquarius",
    note: "Debris from Halley's Comet, and strongly favoured at Al Qua'a's low latitude where the radiant climbs high before dawn.",
  },
  {
    id: "delta-aquariids",
    name: "Southern Delta Aquariids",
    peakMonth: 7,
    peakDay: 30,
    activeStart: { month: 7, day: 18 },
    activeEnd: { month: 8, day: 21 },
    zhr: 25,
    parent: "comet 96P/Machholz",
    radiant: "Aquarius",
    note: "Best seen from southern and low latitudes, and overlaps the start of the Perseids.",
  },
  {
    id: "perseids",
    name: "Perseids",
    peakMonth: 8,
    peakDay: 12,
    activeStart: { month: 7, day: 17 },
    activeEnd: { month: 8, day: 24 },
    zhr: 100,
    parent: "comet 109P/Swift-Tuttle",
    radiant: "Perseus",
    note: "The most popular shower of the year, fast and bright, peaking in warm summer nights.",
  },
  {
    id: "orionids",
    name: "Orionids",
    peakMonth: 10,
    peakDay: 21,
    activeStart: { month: 10, day: 2 },
    activeEnd: { month: 11, day: 7 },
    zhr: 20,
    parent: "comet 1P/Halley",
    radiant: "Orion",
    note: "The second shower from Halley's Comet, with swift meteors that often leave trains.",
  },
  {
    id: "leonids",
    name: "Leonids",
    peakMonth: 11,
    peakDay: 17,
    activeStart: { month: 11, day: 6 },
    activeEnd: { month: 11, day: 30 },
    zhr: 15,
    parent: "comet 55P/Tempel-Tuttle",
    radiant: "Leo",
    note: "Usually modest, but the source of historic meteor storms every few decades.",
  },
  {
    id: "geminids",
    name: "Geminids",
    peakMonth: 12,
    peakDay: 14,
    activeStart: { month: 12, day: 4 },
    activeEnd: { month: 12, day: 20 },
    zhr: 150,
    parent: "asteroid 3200 Phaethon",
    radiant: "Gemini",
    note: "The richest shower of the year, with slow bright meteors in many colours.",
  },
  {
    id: "ursids",
    name: "Ursids",
    peakMonth: 12,
    peakDay: 22,
    activeStart: { month: 12, day: 17 },
    activeEnd: { month: 12, day: 26 },
    zhr: 10,
    parent: "comet 8P/Tuttle",
    radiant: "Ursa Minor",
    note: "A quiet shower close to the winter solstice, circumpolar and visible all night.",
  },
];

/** Day-of-year helper that treats wrap-around windows (Quadrantids) correctly. */
function inWindow(
  month: number,
  day: number,
  start: { month: number; day: number },
  end: { month: number; day: number },
): boolean {
  const m = month * 100 + day;
  const s = start.month * 100 + start.day;
  const e = end.month * 100 + end.day;
  if (s <= e) return m >= s && m <= e;
  // wrap across the new year
  return m >= s || m <= e;
}

/** Meteor showers active on a given calendar date, with a flag for the nominal peak night. */
export function showersOn(date: Date): Array<MeteorShower & { isPeak: boolean }> {
  // use UTC fields: the night anchor is built as local-noon expressed in UTC,
  // so reading UTC keeps shower membership deterministic across server timezones
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return METEOR_SHOWERS.filter((s) =>
    inWindow(month, day, s.activeStart, s.activeEnd),
  ).map((s) => ({
    ...s,
    isPeak: Math.abs(s.peakMonth - month) <= 1 && Math.abs(s.peakDay - day) <= 1,
  }));
}
