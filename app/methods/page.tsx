import { SectionHeader, Cite } from "@/components/ui";
import { SOURCES } from "@/data/darkness";
import { METEOR_SHOWERS } from "@/data/meteorShowers";
import sampleWindow from "@/data/sample-window.json";
import { fmtLocalDate, fmtLocalTime } from "@/lib/astronomy";

export const metadata = { title: "Methods & Sources | Anwa" };

const PROVENANCE = [
  {
    kind: "Real, measured on site",
    tone: "brass",
    items: [
      "The two long-exposure photographs of the Al Qua'a sky. Team originals, not stock.",
    ],
  },
  {
    kind: "Published, cited",
    tone: "sage",
    items: [
      "Bortle class per location, from the Falchi 2016 model and VIIRS night radiance.",
      "The meteor shower calendar (peak dates and ZHR), from the IMO working list.",
      "Star positions and magnitudes, from the HYG catalogue (2,072 stars to mag 5.2).",
      "Arabic star names and meanings, from the standard star-name references.",
    ],
  },
  {
    kind: "Computed here",
    tone: "accent",
    items: [
      "Moon illumination and phase, twilight times, planet positions, with astronomy-engine.",
      "Galactic Centre altitude and transit, by the standard equatorial-to-horizontal transform.",
      "The mag/arcsec2 figure, derived as the midpoint of the published range for each Bortle class.",
      "The night score, from moon-down fraction, core altitude, and the meteor calendar.",
    ],
  },
  {
    kind: "AI generated",
    tone: "sage",
    items: [
      "Only the narrated guided tour, and only when an API key is present.",
      "The model is grounded in the curated heritage dataset and told not to invent lore.",
      "With no key, a committed sample tour is served instead. No other figure on the platform is AI generated.",
    ],
  },
];

const TONE_CLASS: Record<string, string> = {
  brass: "text-brass",
  sage: "text-sage-light",
  accent: "text-accent-bright",
  bone: "text-bone",
};

export default function MethodsPage() {
  const best = sampleWindow.best;
  return (
    <div className="py-10">
      <SectionHeader
        index="06"
        kicker="Methods & Sources · the honesty page"
        title="Every number, where it comes from and how to check it"
        lead="This page documents the data sources, the libraries, the formulas, and exactly what is real-measured, published, computed, or AI-generated. Nothing on the platform is fabricated. Where a figure is derived rather than directly measured, it is labelled as such here and in the product."
      />

      {/* provenance */}
      <div className="mt-8">
        <span className="kicker">What is what</span>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          {PROVENANCE.map((p) => (
            <div key={p.kind} className="panel p-5">
              <h3 className={`font-display text-xl ${TONE_CLASS[p.tone] ?? "text-bone"}`}>
                {p.kind}
              </h3>
              <ul className="mt-3 space-y-2">
                {p.items.map((it, i) => (
                  <li key={i} className="font-body text-base leading-relaxed text-bone-muted">
                    <span className="text-brass/60">·</span> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* formulas */}
      <div className="mt-16 border-t border-sage/20 pt-5">
        <span className="kicker">Formulas and assumptions</span>
        <div className="mt-4 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
          <Method title="Astronomical darkness">
            True dark is when the Sun is more than 18 degrees below the horizon. Dusk and dawn
            are found by searching the Sun&apos;s altitude with astronomy-engine.
          </Method>
          <Method title="Galactic Centre altitude">
            The Milky Way core is taken at Sgr A*, RA 266.42, Dec -28.99. Its altitude is the
            standard transform alt = asin(sin&delta; sin&phi; + cos&delta; cos&phi; cosH), where H is the
            hour angle from local sidereal time. At this latitude it peaks near 90 - |&phi; - &delta;|, about 37 degrees.
          </Method>
          <Method title="Bortle to mag/arcsec2">
            Each location&apos;s Bortle class comes from published light-pollution data. The
            mag/arcsec2 shown is the midpoint of the standard zenith brightness range for that
            class. It is a derived figure, not an on-site sensor reading, and the range is shown with it.
            The raw upward radiance behind each class can be queried per coordinate from the cited
            VIIRS and Falchi sources.
          </Method>
          <Method title="Brightness ratio">
            The factor by which one sky is darker than another is 10^(0.4 &times; &Delta;mag), since each
            magnitude per square arcsecond is a factor of about 2.512 in surface brightness.
          </Method>
          <Method title="Night score (0-100)">
            Moon darkness up to 50, as the fraction of the astronomical night with the Moon
            down. Galactic Centre altitude up to 30. Meteor peak up to 20, scaled by ZHR.
            All inputs are shown per night on the Planner.
          </Method>
          <Method title="Star chart">
            A stereographic projection of the visible dome, zenith at centre, horizon at the
            edge, north up and east left as when looking up. Stars sized by magnitude. The
            Milky Way band is drawn from the galactic plane via the standard rotation matrix.
          </Method>
        </div>
      </div>

      {/* reproduce */}
      <div className="mt-16 border-t border-sage/20 pt-5">
        <span className="kicker">Reproduce the claims</span>
        <h3 className="mt-2 font-display text-2xl text-bone">Check the committed sample yourself</h3>
        <div className="panel-deep mt-4 p-5">
          <p className="font-body text-base leading-relaxed text-bone">
            The committed sample optimal window was computed from a fixed reference date,
            {" "}{fmtLocalDate(new Date(sampleWindow.generatedFrom))}, and is reproducible with{" "}
            <code className="font-mono text-sm text-brass">npx tsx scripts/generate-sample.ts</code>.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-sage/15 pt-4 sm:grid-cols-4">
            <RV label="New moon" value={fmtLocalDate(new Date(sampleWindow.newMoon))} />
            <RV label="Best night" value={best.label} />
            <RV label="Moon illum." value={`${(best.moonIllumination * 100).toFixed(1)}%`} />
            <RV label="Core transit" value={`${fmtLocalTime(best.gcTransit ? new Date(best.gcTransit) : null)} local`} />
          </dl>
          <p className="mt-4 font-body text-base leading-relaxed text-bone-muted">
            To verify independently: open Stellarium or timeanddate.com, set the location to Al
            Qua&apos;a (23.52N, 55.49E) and the date to the best night above, and confirm the
            moon phase, the twilight times, and the altitude of the galactic centre. They will match.
          </p>
        </div>
      </div>

      {/* meteor calendar */}
      <div className="mt-16 border-t border-sage/20 pt-5">
        <span className="kicker">Embedded meteor calendar · IMO</span>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-3">
          {METEOR_SHOWERS.map((m) => (
            <div key={m.id} className="flex items-baseline justify-between border-b border-sage/10 py-1.5">
              <span className="font-body text-sm text-bone">{m.name}</span>
              <span className="font-mono text-xs text-sage-light">
                {String(m.peakDay).padStart(2, "0")}/{String(m.peakMonth).padStart(2, "0")} · ZHR {m.zhr}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* sources + libraries */}
      <div className="mt-16 grid grid-cols-1 gap-10 border-t border-sage/20 pt-5 md:grid-cols-2">
        <div>
          <span className="kicker">Primary sources</span>
          <ul className="mt-3 space-y-3">
            {SOURCES.map((s) => (
              <li key={s.id} className="border-b border-sage/12 pb-3">
                <p className="font-body text-sm text-bone">{s.label}</p>
                <p className="mt-0.5 font-body text-xs text-sage-light">{s.detail}</p>
                <Cite href={s.url}>open source</Cite>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="kicker">Libraries and data</span>
          <ul className="mt-3 space-y-3">
            <Lib name="astronomy-engine" detail="Accurate ephemeris for Sun, Moon, planets, twilight and transits. MIT." url="https://github.com/cosinekitty/astronomy" />
            <Lib name="MapLibre GL JS" detail="Keyless interactive map, with the CARTO dark basemap tiles." url="https://maplibre.org/" />
            <Lib name="HYG star database (v41)" detail="Star positions and magnitudes for the chart. The committed data/bright-stars.json is the HYG v41 catalogue filtered to apparent magnitude 5.2 or brighter, giving 2,072 stars." url="https://github.com/astronexus/HYG-Database" />
            <Lib name="Prisma + SQLite" detail="Local, file-based persistence for hosts, sites, availability and bookings." url="https://www.prisma.io/" />
            <Lib name="Anthropic API" detail="Server-side, for the multilingual Guide only. Optional; degrades to the sample tour." url="https://docs.anthropic.com/" />
          </ul>
        </div>
      </div>
    </div>
  );
}

function Method({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l border-sage/15 pl-4">
      <h4 className="font-display text-lg text-bone">{title}</h4>
      <p className="mt-1.5 font-body text-base leading-relaxed text-bone-muted">{children}</p>
    </div>
  );
}

function RV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm tabular-nums text-brass">{value}</dd>
    </div>
  );
}

function Lib({ name, detail, url }: { name: string; detail: string; url: string }) {
  return (
    <li className="border-b border-sage/12 pb-3">
      <a href={url} target="_blank" rel="noreferrer" className="font-body text-sm text-bone hover:text-brass">
        {name}
      </a>
      <p className="mt-0.5 font-body text-xs text-sage-light">{detail}</p>
    </li>
  );
}
