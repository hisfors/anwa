"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StarChart from "@/components/StarChart";
import { Figure } from "@/components/ui";
import { DateField, Select } from "@/components/controls";
import { fmtLocalTime, fmtLocalLongDate, type NightScore } from "@/lib/astronomy";

interface Props {
  initialNights: NightScore[];
  latitude: number;
  longitude: number;
  locationName: string;
  optimalNewMoon: string;
}

function scoreTone(score: number) {
  if (score >= 75) return "text-brass";
  if (score >= 55) return "text-accent-bright";
  return "text-sage-light";
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-px w-24 bg-sage/20">
        <div
          className={`absolute inset-y-0 left-0 ${score >= 75 ? "bg-brass" : score >= 55 ? "bg-accent-bright" : "bg-sage-light"}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`figure text-sm ${scoreTone(score)}`}>{score}</span>
    </div>
  );
}

export default function PlannerView({
  initialNights,
  latitude,
  longitude,
  locationName,
  optimalNewMoon,
}: Props) {
  const [nights, setNights] = useState<NightScore[]>(initialNights);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [start, setStart] = useState<string>(initialNights[0]?.date ?? "");

  // best night selected by default
  const bestDate = useMemo(
    () => [...nights].sort((a, b) => b.score - a.score)[0]?.date,
    [nights],
  );
  const [selectedDate, setSelectedDate] = useState<string>(bestDate ?? nights[0]?.date);

  const selected =
    nights.find((n) => n.date === selectedDate) ??
    [...nights].sort((a, b) => b.score - a.score)[0] ??
    nights[0];

  // chart time scrubs across the astronomical night
  const duskMs = selected?.astroDusk ? new Date(selected.astroDusk).getTime() : 0;
  const dawnMs = selected?.astroDawn ? new Date(selected.astroDawn).getTime() : 0;
  const gcMs = selected?.gcTransit ? new Date(selected.gcTransit).getTime() : 0;
  const defaultFrac =
    duskMs && dawnMs && gcMs > duskMs && gcMs < dawnMs
      ? (gcMs - duskMs) / (dawnMs - duskMs)
      : 0.5;
  const [frac, setFrac] = useState(defaultFrac);
  // deterministic fallback (not Date.now) so server and client render identically
  const fallbackMs = new Date(`${selected?.date ?? "2026-01-01"}T19:00:00Z`).getTime();
  const chartMs = duskMs && dawnMs ? duskMs + frac * (dawnMs - duskMs) : fallbackMs;
  const chartISO = new Date(chartMs).toISOString();

  async function recompute(nextStart: string, nextDays: number) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/plan?lat=${latitude}&lon=${longitude}&start=${nextStart}&days=${nextDays}`,
      );
      const data = await res.json();
      if (Array.isArray(data.nights) && data.nights.length) {
        setNights(data.nights);
        const newBest = [...data.nights].sort((a: NightScore, b: NightScore) => b.score - a.score)[0];
        setSelectedDate(newBest.date);
        setFrac(0.5);
      }
    } finally {
      setLoading(false);
    }
  }

  function selectNight(date: string) {
    setSelectedDate(date);
    const n = nights.find((x) => x.date === date);
    if (n?.astroDusk && n?.astroDawn && n?.gcTransit) {
      const d = new Date(n.astroDusk).getTime();
      const w = new Date(n.astroDawn).getTime();
      const g = new Date(n.gcTransit).getTime();
      setFrac(g > d && g < w ? (g - d) / (w - d) : 0.5);
    } else {
      setFrac(0.5);
    }
  }

  return (
    <div>
      {/* controls */}
      <div className="mt-6 flex flex-wrap items-end gap-4 border-y border-sage/15 py-4">
        <div>
          <label className="kicker block">Location</label>
          <div className="mt-1 font-mono text-sm text-bone">
            {locationName}{" "}
            <span className="text-sage">
              {latitude.toFixed(2)}N {longitude.toFixed(2)}E
            </span>
          </div>
        </div>
        <div className="w-44">
          <label className="kicker mb-1.5 block">Start date</label>
          <DateField
            value={start}
            ariaLabel="Start date"
            onChange={(v) => {
              setStart(v);
              recompute(v, days);
            }}
          />
        </div>
        <div className="w-36">
          <label className="kicker mb-1.5 block">Nights</label>
          <Select
            value={String(days)}
            ariaLabel="Number of nights"
            options={[
              { value: "14", label: "14 nights" },
              { value: "30", label: "30 nights" },
              { value: "45", label: "45 nights" },
            ]}
            onChange={(v) => {
              const d = parseInt(v, 10);
              setDays(d);
              recompute(start, d);
            }}
          />
        </div>
        <div className="ml-auto self-center">
          <span className="tag-brass">
            Next new moon · {fmtLocalLongDate(new Date(optimalNewMoon)).split(" ").slice(1).join(" ")}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ranked nights */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="kicker">Ranked nights {loading && "· computing..."}</span>
            <span className="font-mono text-[0.62rem] text-sage">score / 100</span>
          </div>
          <ol className="mt-3 max-h-[640px] divide-y divide-sage/10 overflow-y-auto border-y border-sage/15">
            {nights.map((n) => {
              const active = n.date === selectedDate;
              return (
                <li key={n.date}>
                  <button
                    type="button"
                    onClick={() => selectNight(n.date)}
                    className={`flex w-full items-center justify-between gap-3 px-2 py-3 text-left transition-colors ${
                      active ? "bg-observatory" : "hover:bg-raised/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className={`font-mono text-sm ${active ? "text-brass" : "text-bone"}`}>
                        {n.label}
                      </div>
                      <div className="mt-0.5 truncate font-body text-xs text-sage-light">
                        {Math.round(n.moonIllumination * 100)}% moon · core {n.gcMaxAltitude}&deg;
                        {n.meteor?.isPeak ? ` · ${n.meteor.name}` : ""}
                      </div>
                    </div>
                    <ScoreBar score={n.score} />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* selected night detail */}
        <div>
          {selected && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl text-bone">
                  {fmtLocalLongDate(new Date(`${selected.date}T12:00:00Z`))}
                </h3>
                <span className={`figure text-2xl ${scoreTone(selected.score)}`}>
                  {selected.score}
                  <span className="ml-1 text-sm font-normal text-sage">/ 100</span>
                </span>
              </div>

              <div className="panel-deep mt-4 p-4 sm:p-5">
                <StarChart
                  latitude={latitude}
                  longitude={longitude}
                  dateISO={chartISO}
                />
                {/* time scrubber */}
                <div className="mt-3">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.005}
                    value={frac}
                    onChange={(e) => setFrac(parseFloat(e.target.value))}
                    aria-label="Time of night"
                    className="w-full accent-[#7FA98F]"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">
                    <span>Dusk {fmtLocalTime(selected.astroDusk ? new Date(selected.astroDusk) : null)}</span>
                    <span className="text-brass">{fmtLocalTime(new Date(chartMs))} local</span>
                    <span>Dawn {fmtLocalTime(selected.astroDawn ? new Date(selected.astroDawn) : null)}</span>
                  </div>
                </div>
              </div>

              {/* sky clock */}
              <SkyClock night={selected} chartMs={chartMs} />

              {/* raw values for verification */}
              <div className="mt-5">
                <span className="kicker">Raw values · check against any ephemeris</span>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-sage/15 pt-3 sm:grid-cols-3">
                  <RawVal label="Moon illum." value={`${(selected.moonIllumination * 100).toFixed(1)}`} unit="%" />
                  <RawVal label="Moon phase" value={selected.moonPhaseName} />
                  <RawVal label="Dark hours" value={`${selected.darkHours}`} unit={`/ ${selected.astroNightHours} h`} />
                  <RawVal label="Astro dusk" value={fmtLocalTime(selected.astroDusk ? new Date(selected.astroDusk) : null)} unit="local" />
                  <RawVal label="Astro dawn" value={fmtLocalTime(selected.astroDawn ? new Date(selected.astroDawn) : null)} unit="local" />
                  <RawVal label="Core max alt" value={`${selected.gcMaxAltitude}`} unit="deg" />
                  <RawVal label="Core transit" value={fmtLocalTime(selected.gcTransit ? new Date(selected.gcTransit) : null)} unit="local" />
                  <RawVal label="Moon down" value={`${fmtLocalTime(selected.moonDownWindow.start ? new Date(selected.moonDownWindow.start) : null)}-${fmtLocalTime(selected.moonDownWindow.end ? new Date(selected.moonDownWindow.end) : null)}`} />
                  <RawVal label="Score parts" value={`m${selected.components.moon} g${selected.components.gc} s${selected.components.meteor}`} />
                </dl>
                {selected.planets.length > 0 && (
                  <p className="mt-3 font-body text-sm text-bone-muted">
                    <span className="kicker">Planets up</span>{" "}
                    {selected.planets
                      .map((p) => `${p.name} ${p.altitude.toFixed(0)}deg (mag ${p.magnitude.toFixed(1)})`)
                      .join(" · ")}
                  </p>
                )}
              </div>

              {/* cross-links to the other modules */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/guide?date=${selected.date}&lat=${latitude}&lon=${longitude}`}
                  className="btn"
                >
                  Generate the tour for this night
                </Link>
                <Link href="/book" className="btn-ghost">
                  Find a host for this night
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RawVal({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">{label}</dt>
      <dd className="mt-0.5">
        <Figure value={value} unit={unit} className="text-sm" />
      </dd>
    </div>
  );
}

function SkyClock({ night, chartMs }: { night: NightScore; chartMs: number }) {
  if (!night.astroDusk || !night.astroDawn) {
    return (
      <p className="mt-5 font-body text-sm text-sage-light">
        No astronomical darkness on this night at this latitude.
      </p>
    );
  }
  // window: 30 min before dusk to 30 min after dawn
  const dusk = new Date(night.astroDusk).getTime();
  const dawn = new Date(night.astroDawn).getTime();
  const t0 = dusk - 30 * 60000;
  const t1 = dawn + 30 * 60000;
  const span = t1 - t0;
  const pct = (ms: number) => `${((ms - t0) / span) * 100}%`;
  const w = (a: number, b: number) => `${((b - a) / span) * 100}%`;

  const moonStart = night.moonDownWindow.start ? new Date(night.moonDownWindow.start).getTime() : null;
  const moonEnd = night.moonDownWindow.end ? new Date(night.moonDownWindow.end).getTime() : null;
  const gc = night.gcTransit ? new Date(night.gcTransit).getTime() : null;

  return (
    <div className="mt-5">
      <span className="kicker">Sky clock · the night, end to end</span>
      <div className="relative mt-3 h-9 w-full border border-sage/20 bg-field">
        {/* astronomical night band */}
        <div
          className="absolute inset-y-0 bg-observatory"
          style={{ left: pct(dusk), width: w(dusk, dawn) }}
        />
        {/* moon-down (best) window */}
        {moonStart && moonEnd && (
          <div
            className="absolute inset-y-0 border-x border-accent-bright/40 bg-accent-deep/40"
            style={{ left: pct(moonStart), width: w(moonStart, moonEnd) }}
          />
        )}
        {/* GC transit marker */}
        {gc && gc >= t0 && gc <= t1 && (
          <div className="absolute inset-y-0 w-px bg-brass" style={{ left: pct(gc) }}>
            <span className="absolute -top-0.5 left-1 font-mono text-[0.55rem] text-brass">core</span>
          </div>
        )}
        {/* current chart time marker */}
        <div className="absolute inset-y-0 w-0.5 bg-bone" style={{ left: pct(chartMs) }} />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[0.58rem] uppercase tracking-[0.12em] text-sage">
        <span>{fmtLocalTime(new Date(t0))}</span>
        <span className="text-accent-bright">dark = moon down</span>
        <span>{fmtLocalTime(new Date(t1))}</span>
      </div>
    </div>
  );
}
