/**
 * All ephemeris for Anwa. The "intelligence" that ranks nights is real astronomy,
 * not a model: moon phase, twilight, Galactic Centre altitude, planets, meteor peaks.
 * Anyone can check a moon phase against Stellarium or timeanddate, which is the point.
 *
 * Sun, Moon and planet positions come from the astronomy-engine library (accurate,
 * MIT, dependency-free). Fixed stars and the Galactic Centre use the standard
 * equatorial-to-horizontal transform below, which is exact to well under a degree
 * and avoids the library's 8 user-star limit, so the whole catalogue can be drawn.
 */

import {
  Observer,
  Body,
  Illumination,
  MoonPhase,
  SearchAltitude,
  SearchMoonPhase,
  Equator,
  Horizon,
} from "astronomy-engine";
import { showersOn } from "@/data/meteorShowers";

/** Al Qua'a is Asia/Dubai, UTC+4 all year, no daylight saving. Times are shown in this. */
export const TZ_OFFSET_HOURS = 4;

/** Galactic Centre, Sgr A* (J2000). The heart of the Milky Way core. */
export const GALACTIC_CENTER = { ra: 266.41683, dec: -28.99 };

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function makeObserver(latitude: number, longitude: number) {
  return new Observer(latitude, longitude, 200); // ~200 m elevation, desert plateau
}

/** Greenwich Mean Sidereal Time, degrees, from a Date (IAU 1982 expression). */
export function gmst(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  const t = d / 36525;
  let g =
    280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38710000;
  g = ((g % 360) + 360) % 360;
  return g;
}

/** Local Sidereal Time, degrees. */
export function lst(date: Date, longitudeEast: number): number {
  return (((gmst(date) + longitudeEast) % 360) + 360) % 360;
}

export interface HorizontalCoord {
  altitude: number; // degrees above horizon
  azimuth: number; // degrees from north, clockwise through east
}

/**
 * Equatorial (J2000, degrees) to horizontal for an observer at a given instant.
 * J2000 coordinates are used directly with an equator-of-date hour angle, so
 * precession since 2000 (about 0.3 deg) is ignored. This keeps placement exact to
 * well under a degree, which is the chart and Galactic Centre tolerance we want.
 */
export function equatorialToHorizontal(
  raDeg: number,
  decDeg: number,
  latDeg: number,
  date: Date,
  longitudeEast: number,
): HorizontalCoord {
  const ha = (lst(date, longitudeEast) - raDeg) * DEG; // hour angle, radians
  const dec = decDeg * DEG;
  const lat = latDeg * DEG;
  const sinAlt =
    Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const az = Math.atan2(
    -Math.cos(dec) * Math.sin(ha),
    Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(ha),
  );
  return {
    altitude: altitude * RAD,
    azimuth: ((az * RAD) % 360 + 360) % 360,
  };
}

/** Altitude/azimuth of a Sun/Moon/planet body via the accurate ephemeris. */
export function bodyHorizontal(body: Body, date: Date, observer: Observer): HorizontalCoord {
  const eq = Equator(body, date, observer, true, true);
  const hor = Horizon(date, observer, eq.ra, eq.dec, "normal");
  return { altitude: hor.altitude, azimuth: hor.azimuth };
}

export interface MoonInfo {
  illumination: number; // 0-1 illuminated fraction
  phaseName: string;
  phaseAngle: number; // 0 new, 90 first quarter, 180 full, 270 last quarter
}

export function moonInfo(date: Date): MoonInfo {
  const ill = Illumination(Body.Moon, date);
  const elong = MoonPhase(date); // 0..360
  return {
    illumination: ill.phase_fraction,
    phaseAngle: elong,
    phaseName: moonPhaseName(elong),
  };
}

function moonPhaseName(elong: number): string {
  if (elong < 22.5 || elong >= 337.5) return "New Moon";
  if (elong < 67.5) return "Waxing Crescent";
  if (elong < 112.5) return "First Quarter";
  if (elong < 157.5) return "Waxing Gibbous";
  if (elong < 202.5) return "Full Moon";
  if (elong < 247.5) return "Waning Gibbous";
  if (elong < 292.5) return "Last Quarter";
  return "Waning Crescent";
}

export interface PlanetVis {
  name: string;
  altitude: number;
  azimuth: number;
  magnitude: number;
}

const PLANETS: Array<{ body: Body; name: string }> = [
  { body: Body.Mercury, name: "Mercury" },
  { body: Body.Venus, name: "Venus" },
  { body: Body.Mars, name: "Mars" },
  { body: Body.Jupiter, name: "Jupiter" },
  { body: Body.Saturn, name: "Saturn" },
];

export function visiblePlanets(date: Date, observer: Observer, minAlt = 5): PlanetVis[] {
  const out: PlanetVis[] = [];
  for (const p of PLANETS) {
    const h = bodyHorizontal(p.body, date, observer);
    if (h.altitude >= minAlt) {
      const mag = Illumination(p.body, date).mag;
      out.push({
        name: p.name,
        altitude: h.altitude,
        azimuth: h.azimuth,
        magnitude: mag,
      });
    }
  }
  return out.sort((a, b) => a.magnitude - b.magnitude);
}

function toISO(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

/** Format a Date in Al Qua'a local time (UTC+4) as HH:MM. Deterministic across runtimes. */
export function fmtLocalTime(d: Date | null, offsetHours = TZ_OFFSET_HOURS): string {
  if (!d) return "--:--";
  const shifted = new Date(d.getTime() + offsetHours * 3600000);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format a Date in Al Qua'a local time as "14 July 2026". Deterministic, no locale. */
export function fmtLocalDate(d: Date | null, offsetHours = TZ_OFFSET_HOURS): string {
  if (!d) return "--";
  const s = new Date(d.getTime() + offsetHours * 3600000);
  return `${s.getUTCDate()} ${MONTHS_LONG[s.getUTCMonth()]} ${s.getUTCFullYear()}`;
}

/** Full weekday + date, "Sunday 12 July 2026". Deterministic. */
export function fmtLocalLongDate(d: Date | null, offsetHours = TZ_OFFSET_HOURS): string {
  if (!d) return "--";
  const s = new Date(d.getTime() + offsetHours * 3600000);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[s.getUTCDay()]} ${s.getUTCDate()} ${MONTHS_LONG[s.getUTCMonth()]} ${s.getUTCFullYear()}`;
}

export interface NightScore {
  date: string; // evening calendar date, yyyy-mm-dd (local)
  label: string; // e.g. "Fri 12 Jun"
  score: number; // 0-100
  components: { moon: number; gc: number; meteor: number };
  moonIllumination: number; // 0-1
  moonPhaseName: string;
  astroDusk: string | null; // ISO, sun reaches -18 in the evening
  astroDawn: string | null; // ISO, sun reaches -18 in the morning
  astroNightHours: number;
  darkHours: number; // sun < -18 and moon below horizon
  moonDownWindow: { start: string | null; end: string | null };
  gcMaxAltitude: number; // degrees during the astronomical night
  gcTransit: string | null; // ISO of GC's highest point at night, if up
  planets: PlanetVis[];
  meteor: { name: string; zhr: number; isPeak: boolean } | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Build a Date at local noon (UTC+4) for a given local calendar date, as a safe night anchor. */
function localNoon(year: number, month0: number, day: number): Date {
  // local noon = 12:00 at UTC+4 = 08:00 UTC
  return new Date(Date.UTC(year, month0, day, 12 - TZ_OFFSET_HOURS, 0, 0));
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * Score and explain a single night. The night is anchored to its evening local date.
 * Score = moon darkness (up to 50) + Galactic Centre altitude at night (up to 30)
 * + meteor shower bonus (up to 20). Every raw input is returned for verification.
 */
export function rankNight(
  latitude: number,
  longitude: number,
  year: number,
  month0: number,
  day: number,
): NightScore {
  const observer = makeObserver(latitude, longitude);
  const anchor = localNoon(year, month0, day);

  // astronomical twilight: sun down to -18 in the evening, back up to -18 next morning
  const dusk = SearchAltitude(Body.Sun, observer, -1, anchor, 1, -18);
  const duskDate = dusk ? dusk.date : null;
  const dawn = duskDate
    ? SearchAltitude(Body.Sun, observer, +1, duskDate, 1, -18)
    : null;
  const dawnDate = dawn ? dawn.date : null;

  let astroNightHours = 0;
  let darkHours = 0;
  let moonDownStart: Date | null = null;
  let moonDownEnd: Date | null = null;
  let gcMaxAltitude = -90;
  let gcTransit: Date | null = null;
  let midDark = anchor;

  if (duskDate && dawnDate && dawnDate.getTime() > duskDate.getTime()) {
    astroNightHours = (dawnDate.getTime() - duskDate.getTime()) / 3600000;
    midDark = new Date((duskDate.getTime() + dawnDate.getTime()) / 2);

    // sample the night in equal intervals at their midpoints, so the dark-hours
    // total integrates to at most the true night length (never exceeds it)
    const stepMin = 5;
    const steps = Math.max(1, Math.round((astroNightHours * 60) / stepMin));
    const stepMs = (dawnDate.getTime() - duskDate.getTime()) / steps;
    const hoursPerStep = astroNightHours / steps;
    let curMoonDownRunStart: Date | null = null;
    let bestRunLen = 0;
    for (let i = 0; i < steps; i++) {
      const t = new Date(duskDate.getTime() + (i + 0.5) * stepMs);
      const moon = bodyHorizontal(Body.Moon, t, observer);
      const moonDown = moon.altitude < 0;
      if (moonDown) {
        darkHours += hoursPerStep;
        if (!curMoonDownRunStart) curMoonDownRunStart = t;
        const runLen = t.getTime() - curMoonDownRunStart.getTime();
        if (runLen > bestRunLen) {
          bestRunLen = runLen;
          moonDownStart = curMoonDownRunStart;
          moonDownEnd = t;
        }
      } else {
        curMoonDownRunStart = null;
      }
      const gc = equatorialToHorizontal(
        GALACTIC_CENTER.ra,
        GALACTIC_CENTER.dec,
        latitude,
        t,
        longitude,
      );
      if (gc.altitude > gcMaxAltitude) {
        gcMaxAltitude = gc.altitude;
        gcTransit = t;
      }
    }
  }

  const moon = moonInfo(midDark);
  const planets = visiblePlanets(midDark, observer);

  // meteor showers active on the night, peak flagged
  const showers = showersOn(anchor);
  const topShower = showers.sort((a, b) => b.zhr - a.zhr)[0] || null;

  // scoring
  const moonScore =
    astroNightHours > 0 ? 50 * clamp01(darkHours / astroNightHours) : 0;
  const gcScore = gcMaxAltitude > 0 ? 30 * clamp01(gcMaxAltitude / 40) : 0;
  let meteorScore = 0;
  if (topShower) {
    const base = 20 * clamp01(topShower.zhr / 120);
    meteorScore = topShower.isPeak ? base : base * 0.4;
  }
  const score = Math.round(
    Math.max(0, Math.min(100, moonScore + gcScore + meteorScore)),
  );

  const dateObj = new Date(Date.UTC(year, month0, day));
  const label = `${WEEKDAYS[dateObj.getUTCDay()]} ${day} ${MONTHS[month0]}`;
  const isoDate = `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return {
    date: isoDate,
    label,
    score,
    components: {
      moon: Math.round(moonScore),
      gc: Math.round(gcScore),
      meteor: Math.round(meteorScore),
    },
    moonIllumination: moon.illumination,
    moonPhaseName: moon.phaseName,
    astroDusk: toISO(duskDate),
    astroDawn: toISO(dawnDate),
    astroNightHours: +astroNightHours.toFixed(2),
    darkHours: +darkHours.toFixed(2),
    moonDownWindow: { start: toISO(moonDownStart), end: toISO(moonDownEnd) },
    gcMaxAltitude: +Math.max(0, gcMaxAltitude).toFixed(1),
    gcTransit: gcMaxAltitude > 0 ? toISO(gcTransit) : null,
    planets,
    meteor: topShower
      ? { name: topShower.name, zhr: topShower.zhr, isPeak: topShower.isPeak }
      : null,
  };
}

/** Rank a run of nights starting from a local calendar date. */
export function rankNights(
  latitude: number,
  longitude: number,
  startISO: string,
  days: number,
): NightScore[] {
  const [y, m, d] = startISO.split("-").map(Number);
  const out: NightScore[] = [];
  const base = new Date(Date.UTC(y, m - 1, d));
  for (let i = 0; i < days; i++) {
    const cur = new Date(base.getTime() + i * 86400000);
    out.push(
      rankNight(
        latitude,
        longitude,
        cur.getUTCFullYear(),
        cur.getUTCMonth(),
        cur.getUTCDate(),
      ),
    );
  }
  return out;
}

export interface OptimalWindow {
  newMoon: string; // ISO of the new moon instant
  best: NightScore; // best-scoring night around it
  nights: NightScore[]; // the nights considered, +/- 3 days of new moon
}

/** The next optimal new-moon stargazing window from a given date. */
export function nextNewMoonWindow(
  latitude: number,
  longitude: number,
  from: Date,
): OptimalWindow {
  const nm = SearchMoonPhase(0, from, 45); // next new moon within 45 days
  const newMoonDate = nm ? nm.date : new Date(from.getTime() + 15 * 86400000);
  const start = new Date(newMoonDate.getTime() - 3 * 86400000);
  const startISO = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}-${String(start.getUTCDate()).padStart(2, "0")}`;
  const nights = rankNights(latitude, longitude, startISO, 7);
  const best = [...nights].sort((a, b) => b.score - a.score)[0];
  return { newMoon: newMoonDate.toISOString(), best, nights };
}

export interface SkyBody {
  name: string;
  ra: number;
  dec: number;
  altitude: number;
  azimuth: number;
  magnitude: number;
  kind: "moon" | "planet";
}

/** Sun/Moon/planet positions at an instant, for drawing on the chart. */
export function skyBodies(date: Date, observer: Observer): SkyBody[] {
  const out: SkyBody[] = [];
  const all: Array<{ body: Body; name: string; kind: "moon" | "planet" }> = [
    { body: Body.Moon, name: "Moon", kind: "moon" },
    ...PLANETS.map((p) => ({ body: p.body, name: p.name, kind: "planet" as const })),
  ];
  for (const b of all) {
    const eq = Equator(b.body, date, observer, true, true);
    const hor = Horizon(date, observer, eq.ra, eq.dec, "normal");
    const mag = b.kind === "moon" ? -12.5 : Illumination(b.body, date).mag;
    out.push({
      name: b.name,
      ra: eq.ra * 15, // hours to degrees
      dec: eq.dec,
      altitude: hor.altitude,
      azimuth: hor.azimuth,
      magnitude: mag,
      kind: b.kind,
    });
  }
  return out;
}
