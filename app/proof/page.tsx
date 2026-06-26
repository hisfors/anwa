import ProofMap from "@/components/ProofMap";
import PhotoPlate from "@/components/PhotoPlate";
import { SectionHeader, Figure, Cite } from "@/components/ui";
import {
  DARKNESS_POINTS,
  DARKNESS_BY_ID,
  brightnessRatio,
  SOURCES,
  SOURCE_BY_ID,
} from "@/data/darkness";

export const metadata = {
  title: "The Proof - darkness measured | Anwa",
};

export default function ProofPage() {
  const alquaa = DARKNESS_BY_ID.alquaa;
  const dubai = DARKNESS_BY_ID.dubai;
  const ratioDubai = brightnessRatio(alquaa.sqm, dubai.sqm);
  const falchi = SOURCE_BY_ID.falchi2016;
  const bortleRef = SOURCE_BY_ID.bortle;

  return (
    <div className="py-10">
      <SectionHeader
        index="01"
        kicker="The Proof · darkness, measured"
        title="Among the darkest inhabited skies in the UAE"
        lead="The claim is specific and checkable. Every figure below shows its raw number, its unit, its method, and its source. The darkness is also shown directly: two long-exposure photographs the team shot on site at Al Qua'a, where the Milky Way core and the natural green airglow are visible to the naked eye."
      />

      {/* headline */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="panel-deep flex flex-col justify-center p-6">
          <span className="kicker">Headline</span>
          <p className="mt-3 font-display text-2xl leading-snug text-bone">
            Al Qua&apos;a&apos;s sky is about{" "}
            <span className="text-brass">{ratioDubai.toFixed(0)} times darker</span> than Dubai&apos;s.
          </p>
          <div className="mt-4 flex items-end gap-6">
            <div>
              <div className="kicker">Al Qua&apos;a</div>
              <Figure value={alquaa.sqm.toFixed(1)} unit="mag/arcsec2" tone="brass" className="text-2xl" />
              <div className="font-mono text-xs text-sage">Bortle {alquaa.bortle}</div>
            </div>
            <div>
              <div className="kicker">Dubai</div>
              <Figure value={dubai.sqm.toFixed(1)} unit="mag/arcsec2" className="text-2xl" />
              <div className="font-mono text-xs text-sage">Bortle {dubai.bortle}</div>
            </div>
          </div>
          <p className="mt-4 font-body text-sm leading-relaxed text-bone-muted">
            A higher mag/arcsec&sup2; means a darker sky. Each magnitude is a factor of
            about 2.5 in brightness, so the {(alquaa.sqm - dubai.sqm).toFixed(1)} magnitude gap is
            roughly {ratioDubai.toFixed(0)}x. Both figures are the class-midpoint brightness
            derived from each location&apos;s Bortle class, not sensor readings; see the method below.
          </p>
        </div>

        {/* comparison ledger */}
        <div>
          <div className="grid grid-cols-[1.3fr_1fr_0.7fr_1fr] border-b border-sage/25 pb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">
            <span>Location</span>
            <span className="text-right">mag/arcsec&sup2;</span>
            <span className="text-right">Bortle</span>
            <span className="text-right">vs Al Qua&apos;a</span>
          </div>
          {DARKNESS_POINTS.map((p) => {
            const isHome = p.id === "alquaa";
            const r = isHome ? 1 : brightnessRatio(alquaa.sqm, p.sqm);
            return (
              <div
                key={p.id}
                className={`grid grid-cols-[1.3fr_1fr_0.7fr_1fr] items-center border-b border-sage/12 py-3 ${
                  isHome ? "bg-observatory/60" : ""
                }`}
              >
                <span className={`font-body text-sm ${isHome ? "text-brass" : "text-bone"}`}>
                  {p.name}
                </span>
                <span className="text-right">
                  <Figure value={p.sqm.toFixed(1)} className="text-sm" tone={isHome ? "brass" : "bone"} />
                </span>
                <span className="text-right font-mono text-sm text-bone-muted">{p.bortle}</span>
                <span className="text-right font-mono text-sm text-sage-light">
                  {isHome ? "home" : `${r.toFixed(0)}x darker`}
                </span>
              </div>
            );
          })}
          <p className="mt-3 font-body text-xs leading-relaxed text-sage-light">
            Method: each Bortle class is from the Falchi 2016 artificial-brightness model and
            VIIRS night radiance. The mag/arcsec&sup2; figure is the midpoint of the standard
            published range for that class, derived from the class, not an on-site sensor
            reading. Ranges and full method on the{" "}
            <a href="/methods" className="cite-link">Methods page</a>.
          </p>
        </div>
      </div>

      {/* map */}
      <div className="mt-14">
        <div className="flex items-baseline justify-between border-t border-sage/20 pt-5">
          <span className="kicker">Drop a pin · sample the darkness</span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">
            MapLibre · CARTO dark · keyless
          </span>
        </div>
        <h3 className="mt-2 font-display text-2xl text-bone">
          The dark plateau and the bright coast, on one map
        </h3>
        <div className="mt-4">
          <ProofMap />
        </div>
      </div>

      {/* first-party photographic evidence */}
      <div className="mt-14 border-t border-sage/20 pt-5">
        <span className="kicker">First-party evidence · team originals</span>
        <h3 className="mt-2 font-display text-2xl text-bone">
          The proof you can see, shot on site
        </h3>
        <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-bone-muted">
          These are real long-exposure captures from Al Qua&apos;a, not stock imagery. The
          bright cloudy band is the Milky Way core, plainly visible to the naked eye here.
          The faint green wash is natural airglow, the oxygen emission only a genuinely dark
          sky shows. The thin orange band low on the horizon is distant light pollution
          encroaching, the exact thing this platform exists to monitor.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
          <PhotoPlate
            src="/img/alquaa-sky-landscape.jpg"
            alt="Wide long-exposure of the Milky Way over the Al Qua'a dunes, green airglow across the sky and an orange light-pollution band on the horizon"
            caption="Long exposure · Al Qua'a, UAE · team original"
            note="Milky Way core and green airglow overhead. Note the orange glow low on the horizon: distant city light pollution, monitored here."
            ratio="landscape"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <PhotoPlate
            src="/img/alquaa-sky-portrait.jpg"
            alt="Tall long-exposure of the Milky Way core rising over Al Qua'a, with natural green airglow"
            caption="Long exposure · Al Qua'a, UAE · team original"
            note="The core stands almost upright from this latitude near the Tropic of Cancer."
            ratio="portrait"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>

      {/* sources */}
      <div className="mt-14 border-t border-sage/20 pt-5">
        <span className="kicker">Sources for this page</span>
        <ul className="mt-3 space-y-3">
          {SOURCES.map((s) => (
            <li key={s.id} className="grid grid-cols-1 gap-1 border-b border-sage/12 pb-3 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-body text-sm text-bone">{s.label}</p>
                <p className="font-body text-xs text-sage-light">{s.detail}</p>
              </div>
              <Cite href={s.url}>open source</Cite>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
