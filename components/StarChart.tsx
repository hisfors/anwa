"use client";

import { useMemo, useEffect, useState } from "react";
import brightStars from "@/data/bright-stars.json";
import { LORE_BY_PROPER } from "@/data/stars";
import {
  equatorialToHorizontal,
  skyBodies,
  makeObserver,
  GALACTIC_CENTER,
  type SkyBody,
} from "@/lib/astronomy";

interface CatalogStar {
  ra: number;
  dec: number;
  mag: number;
  name?: string;
  bayer?: string;
  con?: string;
}

const STARS = brightStars as CatalogStar[];

/** Galactic (l,b) to equatorial J2000 (deg), via the standard rotation matrix transpose. */
function galToEqu(lDeg: number, bDeg: number): { ra: number; dec: number } {
  const l = (lDeg * Math.PI) / 180;
  const b = (bDeg * Math.PI) / 180;
  const xg = Math.cos(b) * Math.cos(l);
  const yg = Math.cos(b) * Math.sin(l);
  const zg = Math.sin(b);
  const xe = -0.054876 * xg + 0.494109 * yg - 0.867666 * zg;
  const ye = -0.873437 * xg - 0.44483 * yg - 0.198076 * zg;
  const ze = -0.483835 * xg + 0.746982 * yg + 0.455984 * zg;
  const ra = ((Math.atan2(ye, xe) * 180) / Math.PI + 360) % 360;
  const dec = (Math.asin(Math.max(-1, Math.min(1, ze))) * 180) / Math.PI;
  return { ra, dec };
}

const R = 290; // horizon radius in svg units
const CX = 300;
const CY = 300;

/** Stereographic projection of the visible dome: zenith at centre, horizon at edge.
 *  North up, East left (the looking-up convention). Returns null if below horizon. */
function project(altitude: number, azimuth: number): { x: number; y: number } | null {
  if (altitude < -1) return null;
  const z = (90 - altitude) * (Math.PI / 180); // zenith angle
  const r = R * Math.tan(z / 2);
  const az = azimuth * (Math.PI / 180);
  return { x: CX - r * Math.sin(az), y: CY - r * Math.cos(az) };
}

function magRadius(mag: number): number {
  // brightest ~ 2.6px, faintest (5.2) ~ 0.45px
  const r = 2.7 - (mag + 1.5) * 0.34;
  return Math.max(0.45, Math.min(2.8, r));
}

function magOpacity(mag: number): number {
  return Math.max(0.32, Math.min(1, 1.05 - mag * 0.13));
}

export interface StarChartProps {
  latitude: number;
  longitude: number;
  /** instant to draw, ISO string */
  dateISO: string;
  /** show the lore-star and planet labels */
  showLabels?: boolean;
  className?: string;
}

export default function StarChart({
  latitude,
  longitude,
  dateISO,
  showLabels = true,
  className = "",
}: StarChartProps) {
  // Compute only on the client. Trig can differ subtly between the Node and browser
  // engines, so server-rendering the stars then hydrating would mismatch attributes.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { dots, loreDots, milkyWay, bodies, gc } = useMemo(() => {
    if (!mounted)
      return {
        dots: [] as Array<{ x: number; y: number; r: number; o: number }>,
        loreDots: [] as Array<{ x: number; y: number; r: number; name: string; arabic: string; translit: string }>,
        milkyWay: [] as string[],
        bodies: [] as Array<SkyBody & { x: number; y: number }>,
        gc: null as ({ x: number; y: number; altitude: number } | null),
      };
    const date = new Date(dateISO);

    const dots: Array<{ x: number; y: number; r: number; o: number }> = [];
    const loreDots: Array<{
      x: number;
      y: number;
      r: number;
      name: string;
      arabic: string;
      translit: string;
    }> = [];

    for (const s of STARS) {
      const h = equatorialToHorizontal(s.ra, s.dec, latitude, date, longitude);
      if (h.altitude < 0) continue;
      const p = project(h.altitude, h.azimuth);
      if (!p) continue;
      const lore = s.name ? LORE_BY_PROPER[s.name] : undefined;
      if (lore) {
        loreDots.push({
          x: p.x,
          y: p.y,
          r: Math.max(1.8, magRadius(s.mag) + 0.6),
          name: lore.proper,
          arabic: lore.arabic,
          translit: lore.transliteration,
        });
      } else {
        dots.push({ x: p.x, y: p.y, r: magRadius(s.mag), o: magOpacity(s.mag) });
      }
    }

    // Milky Way band: galactic latitudes -10,-5,0,5,10 sampled around the plane
    const milkyWay: string[] = [];
    for (const b of [-10, -5, 0, 5, 10]) {
      let seg: string[] = [];
      const paths: string[] = [];
      for (let l = 0; l <= 360; l += 2) {
        const eq = galToEqu(l, b);
        const h = equatorialToHorizontal(eq.ra, eq.dec, latitude, date, longitude);
        if (h.altitude < 0) {
          if (seg.length > 1) paths.push("M" + seg.join("L"));
          seg = [];
          continue;
        }
        const p = project(h.altitude, h.azimuth);
        if (p) seg.push(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      }
      if (seg.length > 1) paths.push("M" + seg.join("L"));
      milkyWay.push(paths.join(" "));
    }

    // Sun/Moon/planets
    const observer = makeObserver(latitude, longitude);
    const sky: SkyBody[] = skyBodies(date, observer);
    const bodies = sky
      .filter((b) => b.altitude >= 0)
      .map((b) => {
        const p = project(b.altitude, b.azimuth)!;
        return { ...b, x: p.x, y: p.y };
      });

    // Galactic Centre marker
    const gcH = equatorialToHorizontal(
      GALACTIC_CENTER.ra,
      GALACTIC_CENTER.dec,
      latitude,
      date,
      longitude,
    );
    const gcP = gcH.altitude >= 0 ? project(gcH.altitude, gcH.azimuth) : null;
    const gc = gcP ? { ...gcP, altitude: gcH.altitude } : null;

    return { dots, loreDots, milkyWay, bodies, gc };
  }, [latitude, longitude, dateISO, mounted]);

  return (
    <svg
      viewBox="0 0 600 600"
      className={`w-full ${className}`}
      role="img"
      aria-label="Computed star chart for the selected night and location"
    >
      <defs>
        <radialGradient id="dome" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#16241C" />
          <stop offset="70%" stopColor="#0E1612" />
          <stop offset="100%" stopColor="#0B0F0D" />
        </radialGradient>
        <clipPath id="horizon">
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>

      {/* the dome */}
      <circle cx={CX} cy={CY} r={R} fill="url(#dome)" stroke="#3E6B52" strokeWidth="1" />
      {!mounted && (
        <text x={CX} y={CY} textAnchor="middle" className="font-mono" fontSize="11" fill="#6E8B7A">
          computing sky...
        </text>
      )}

      <g clipPath="url(#horizon)">
        {/* Milky Way band, faint and real */}
        {milkyWay.map((d, i) => (
          <path
            key={`mw-${i}`}
            d={d}
            fill="none"
            stroke="#7FA98F"
            strokeWidth={i === 2 ? 9 : 5}
            strokeLinecap="round"
            opacity={i === 2 ? 0.1 : 0.05}
          />
        ))}

        {/* altitude rings at 30 and 60 degrees */}
        {[30, 60].map((alt) => {
          const z = (90 - alt) * (Math.PI / 180);
          // round so server (Node) and client (browser) Math.tan agree at hydration
          const rr = +(R * Math.tan(z / 2)).toFixed(2);
          return (
            <circle
              key={alt}
              cx={CX}
              cy={CY}
              r={rr}
              fill="none"
              stroke="#6E8B7A"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              opacity="0.3"
            />
          );
        })}
        {/* cardinal cross */}
        <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="#6E8B7A" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.25" />
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="#6E8B7A" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.25" />

        {/* catalogue stars */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#E8E6DC" opacity={d.o} />
        ))}

        {/* Galactic Centre marker */}
        {gc && (
          <g>
            <circle cx={gc.x} cy={gc.y} r="7" fill="none" stroke="#D9A864" strokeWidth="0.75" opacity="0.6" />
            <circle cx={gc.x} cy={gc.y} r="2" fill="#D9A864" opacity="0.5" />
            {showLabels && (
              <text x={gc.x + 10} y={gc.y + 3} className="font-mono" fontSize="9" fill="#D9A864" opacity="0.85">
                Milky Way core
              </text>
            )}
          </g>
        )}

        {/* lore stars in brass, labelled */}
        {loreDots.map((d, i) => (
          <g key={`lore-${i}`}>
            <title>{`${d.translit} (${d.arabic}) - ${d.name}`}</title>
            <circle cx={d.x} cy={d.y} r={d.r + 1.6} fill="none" stroke="#E8B873" strokeWidth="0.6" opacity="0.55" />
            <circle cx={d.x} cy={d.y} r={d.r} fill="#E8B873" />
            {showLabels && (
              <text x={d.x + 7} y={d.y - 5} className="font-mono" fontSize="8.5" fill="#D9A864">
                {d.translit}
              </text>
            )}
          </g>
        ))}

        {/* moon and planets */}
        {bodies.map((b, i) =>
          b.kind === "moon" ? (
            <g key={`b-${i}`}>
              <circle cx={b.x} cy={b.y} r="6" fill="#C9CEC4" opacity="0.92" />
              {showLabels && (
                <text x={b.x + 9} y={b.y + 3} className="font-mono" fontSize="9" fill="#C9CEC4">
                  Moon
                </text>
              )}
            </g>
          ) : (
            <g key={`b-${i}`}>
              <title>{b.name}</title>
              <rect x={b.x - 2.6} y={b.y - 2.6} width="5.2" height="5.2" transform={`rotate(45 ${b.x} ${b.y})`} fill="#7FA98F" />
              {showLabels && (
                <text x={b.x + 7} y={b.y + 3} className="font-mono" fontSize="8.5" fill="#7FA98F">
                  {b.name}
                </text>
              )}
            </g>
          ),
        )}
      </g>

      {/* cardinal labels: looking up, East is on the left */}
      <text x={CX} y={CY - R - 7} textAnchor="middle" className="font-mono" fontSize="11" fill="#8AA995">N</text>
      <text x={CX} y={CY + R + 16} textAnchor="middle" className="font-mono" fontSize="11" fill="#8AA995">S</text>
      <text x={CX - R - 12} y={CY + 4} textAnchor="middle" className="font-mono" fontSize="11" fill="#8AA995">E</text>
      <text x={CX + R + 12} y={CY + 4} textAnchor="middle" className="font-mono" fontSize="11" fill="#8AA995">W</text>
    </svg>
  );
}
