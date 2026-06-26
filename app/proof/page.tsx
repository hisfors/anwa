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
  title: "How dark the sky is at Al Qua'a | Anwa",
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
        kicker="The dark sky"
        title="One of the darkest skies in the country"
        lead="Al Qua'a sits far from any city glow. Here is how its night sky compares with Dubai, Abu Dhabi and Al Ain, with two photographs taken on a clear night on site, where the Milky Way is bright enough to see with the naked eye."
      />

      {/* headline */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="panel-deep flex flex-col justify-center p-6">
          <span className="kicker">At a glance</span>
          <p className="mt-3 font-display text-2xl leading-snug text-bone">
            Al Qua&apos;a&apos;s sky is about{" "}
            <span className="text-brass">{ratioDubai.toFixed(0)} times darker</span> than Dubai&apos;s.
          </p>
          <div className="mt-4 flex items-end gap-6">
            <div>
              <div className="kicker">Al Qua&apos;a</div>
              <Figure value={alquaa.sqm.toFixed(1)} unit="sky darkness" tone="brass" className="text-2xl" />
              <div className="font-body text-sm text-sage">Bortle {alquaa.bortle} of 9</div>
            </div>
            <div>
              <div className="kicker">Dubai</div>
              <Figure value={dubai.sqm.toFixed(1)} unit="sky darkness" className="text-2xl" />
              <div className="font-body text-sm text-sage">Bortle {dubai.bortle} of 9</div>
            </div>
          </div>
          <p className="mt-4 font-body text-base leading-relaxed text-bone-muted">
            You can see the difference with your own eyes. From Al Qua&apos;a the Milky Way arches
            overhead, while from Dubai it has vanished into the city glow.
          </p>
        </div>

        {/* comparison ledger */}
        <div>
          <div className="grid grid-cols-[1.3fr_1fr_0.7fr_1fr] border-b border-sage/25 pb-2 font-body text-xs text-sage">
            <span>Location</span>
            <span className="text-right">Sky darkness</span>
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
                <span className={`text-right text-sm text-sage-light ${isHome ? "font-body" : "font-mono"}`}>
                  {isHome ? "home" : `${r.toFixed(0)}x darker`}
                </span>
              </div>
            );
          })}
          <div className="mt-4 border-t border-sage/15 pt-3">
            <p className="font-body text-[0.95rem] leading-relaxed text-bone-muted">
              <span className="text-bone">What these mean.</span> Sky darkness is given as a
              number where higher is darker, and on the Bortle scale that runs from 1, a perfect
              wilderness sky, to 9, an inner city. Al Qua&apos;a is Bortle 2 of 9, which is
              excellent. Dubai is Bortle 8 of 9.
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-sage-light">
              The figures come from published light-pollution data. You can read more on the{" "}
              <a href="/methods" className="cite-link">how it works</a> page.
            </p>
          </div>
        </div>
      </div>

      {/* map */}
      <div className="mt-20">
        <div className="border-t border-sage/20 pt-5">
          <span className="kicker">Explore the map</span>
        </div>
        <h3 className="mt-2 font-display text-[1.7rem] text-bone">
          The dark plateau and the bright coast
        </h3>
        <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-bone-muted">
          Green marks dark sites, orange marks bright cities. Click anywhere to see how dark
          that spot is.
        </p>
        <div className="mt-4">
          <ProofMap />
        </div>
      </div>

      {/* photographs from the site */}
      <div className="mt-20 border-t border-sage/20 pt-5">
        <span className="kicker">Photographs from Al Qua&apos;a</span>
        <h3 className="mt-2 font-display text-[1.7rem] text-bone">
          What the sky really looks like here
        </h3>
        <p className="mt-3 max-w-3xl font-body text-lg leading-relaxed text-bone-muted">
          Two long-exposure photographs taken on site. The bright cloudy band is the Milky
          Way, easy to see with the naked eye here. The soft green wash is airglow, a natural
          glow only a truly dark sky shows. The thin orange line low on the horizon is
          distant city light, the one thing creeping in on this sky.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
          <PhotoPlate
            src="/img/alquaa-sky-landscape.jpg"
            alt="Wide long-exposure of the Milky Way over the Al Qua'a dunes, green airglow across the sky and an orange light-pollution band on the horizon"
            caption="Long exposure · Al Qua'a, UAE · Photographed by the Anwa team"
            note="The Milky Way bright core and green airglow overhead. The orange glow low on the horizon is distant city light, the one thing creeping in on this sky."
            ratio="landscape"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <PhotoPlate
            src="/img/alquaa-sky-portrait.jpg"
            alt="Tall long-exposure of the Milky Way core rising over Al Qua'a, with natural green airglow"
            caption="Long exposure · Al Qua'a, UAE · Photographed by the Anwa team"
            note="The bright core stands almost upright in the sky here, this close to the Tropic of Cancer."
            ratio="portrait"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>

      {/* sources */}
      <div className="mt-20 border-t border-sage/20 pt-5">
        <span className="kicker">Where these numbers come from</span>
        <ul className="mt-3 space-y-3">
          {SOURCES.map((s) => (
            <li key={s.id} className="grid grid-cols-1 gap-1 border-b border-sage/12 pb-3 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-body text-sm text-bone">{s.label}</p>
                <p className="font-body text-xs text-sage-light">{s.detail}</p>
              </div>
              <Cite href={s.url}>view source</Cite>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
