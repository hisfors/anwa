import Link from "next/link";
import Image from "next/image";
import StarChart from "@/components/StarChart";
import { Figure, Stat } from "@/components/ui";
import { DARKNESS_BY_ID, brightnessRatio, SOURCE_BY_ID } from "@/data/darkness";
import { fmtLocalTime, fmtLocalDate } from "@/lib/astronomy";
import sampleWindow from "@/data/sample-window.json";

const MODULES = [
  {
    index: "01",
    href: "/proof",
    title: "The Proof",
    desc: "Darkness measured against the cities, with raw figures, units and sources, plus the team's own photographs.",
    figure: "21.8",
    unit: "mag/arcsec2",
  },
  {
    index: "02",
    href: "/planner",
    title: "The Planner",
    desc: "The best stargazing nights, computed months ahead from real astronomy. No model, just ephemeris you can check.",
    figure: "78",
    unit: "/ 100 score",
  },
  {
    index: "03",
    href: "/guide",
    title: "The Guide",
    desc: "A full guided tour in any language, grounded in real Arab and Bedouin star lore, so an Arabic-only host can guide the world.",
    figure: "8+",
    unit: "languages",
  },
  {
    index: "04",
    href: "/book",
    title: "Host & Book",
    desc: "Families list a desert site and take bookings tied to the genuinely dark nights, turning the sky into a second income.",
    figure: "4",
    unit: "host families",
  },
];

export default function HomePage() {
  const alquaa = DARKNESS_BY_ID.alquaa;
  const dubai = DARKNESS_BY_ID.dubai;
  const ratio = brightnessRatio(alquaa.sqm, dubai.sqm);
  const best = sampleWindow.best;
  const chartTime = best.gcTransit ?? best.astroDusk ?? sampleWindow.newMoon;
  const falchi = SOURCE_BY_ID.falchi2016;

  return (
    <div className="pb-8">
      {/* Masthead plate, anchored by the real landscape photograph */}
      <section className="mt-8">
        <div className="panel overflow-hidden">
          <div className="relative aspect-[16/9] w-full sm:aspect-[2/1]">
            <Image
              src="/img/alquaa-sky-landscape.jpg"
              alt="Long-exposure photograph of the Milky Way over Al Qua'a, with green airglow and a faint orange band of distant light pollution on the horizon"
              fill
              priority
              sizes="100vw"
              className="photo-treated object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-field via-field/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:p-8">
              <h1 className="max-w-3xl font-display text-3xl leading-[1.05] text-bone text-balance sm:text-5xl">
                A world-class dark sky that earns the families who hold it nothing.
                Anwa changes that.
              </h1>
              <div className="flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] text-sage">
                <span>Long exposure · Al Qua&apos;a, UAE · team original</span>
                <span className="hidden sm:inline">Milky Way core · green airglow visible</span>
              </div>
            </div>
          </div>
        </div>

        {/* editorial intro, two columns, dense and asymmetric */}
        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-sage/20 pt-6 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="font-body text-lg leading-relaxed text-bone">
              Al Qua&apos;a is a rural camel-farming community near Al Ain, on the
              Tropic of Cancer, with some of the darkest skies on Earth. The families
              here depend on camel farming as a single income, while the night sky
              above them, a rare and shrinking natural asset, earns nothing and is
              measured by no one. Anwa turns that sky into a bookable, AI-guided,
              heritage-rooted experience the families can host and earn from, and it
              proves and protects the darkness with real data.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/planner" className="btn">
                Plan a night
              </Link>
              <Link href="/proof" className="btn-ghost">
                See the proof
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 self-start border-l border-sage/15 pl-5">
            <Stat label="Al Qua'a sky" value={alquaa.sqm.toFixed(1)} unit="mag/arcsec2" tone="brass" sub={`Bortle ${alquaa.bortle}`} />
            <Stat label="vs Dubai" value={dubai.sqm.toFixed(1)} unit="mag/arcsec2" sub={`Bortle ${dubai.bortle}`} />
            <Stat label="Darker than Dubai" value={`${ratio.toFixed(0)}x`} tone="brass" sub="from the magnitude gap" />
            <Stat label="Catalogued stars" value="2,072" sub="real positions, drawn" />
          </div>
        </div>
      </section>

      {/* The computed centrepiece: a real star chart, not a decorative blob */}
      <section className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="kicker">The interactive almanac</span>
          <h2 className="mt-3 font-display text-[2rem] font-medium leading-[1.1] text-bone sm:text-[2.4rem]">
            The sky as it will really stand on the next optimal night
          </h2>
          <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-bone-muted">
            This is a computed chart, not an illustration. Every dot is a real
            star at its real place for Al Qua&apos;a at the moment the Milky Way
            core crosses due south. The brass stars carry their Arab names. The
            faint band is the galactic plane, drawn from the same coordinates.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-sage/15 pt-5">
            <Stat label="Night" value={best.label.split(" ").slice(1).join(" ")} sub="2026, new-moon week" />
            <Stat label="Core transit" value={fmtLocalTime(new Date(chartTime))} unit="local" sub="due south" tone="brass" />
            <Stat label="Core altitude" value={best.gcMaxAltitude} unit="deg" tone="brass" sub="highest of the night" />
            <Stat label="Moon" value={Math.round(best.moonIllumination * 100)} unit="% lit" sub={best.moonPhaseName} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/planner" className="btn">
              Open the planner
            </Link>
            <Link href="/guide" className="btn-ghost">
              Hear the guided tour
            </Link>
          </div>
        </div>
        <div className="panel-deep p-4 sm:p-6">
          <StarChart
            latitude={sampleWindow.location.latitude}
            longitude={sampleWindow.location.longitude}
            dateISO={chartTime}
          />
          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">
            <span>Stereographic dome · N up, E left</span>
            <span>{fmtLocalTime(new Date(chartTime))} local · 12 Jul 2026</span>
          </div>
        </div>
      </section>

      {/* Module index, a ledger, not bento cards */}
      <section className="mt-24">
        <div className="flex items-baseline justify-between border-t border-sage/20 pt-5">
          <span className="kicker">Four connected modules</span>
          <span className="font-body text-[0.8rem] text-sage smallcaps">
            Prove · Plan · Guide · Earn
          </span>
        </div>
        <div className="mt-4 divide-y divide-sage/12 border-y border-sage/12">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group grid grid-cols-1 items-center gap-3 py-5 transition-colors hover:bg-raised/50 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:px-2"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-brass/70">{m.index}</span>
                <span className="font-display text-[1.65rem] text-bone group-hover:text-brass">
                  {m.title}
                </span>
              </div>
              <p className="font-body text-[1.05rem] leading-relaxed text-bone-muted">
                {m.desc}
              </p>
              <div className="text-right">
                <Figure value={m.figure} unit={m.unit} tone="sage" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testable claims, the falsifiability spine, on the front page */}
      <section className="mt-24">
        <span className="kicker">Claims you can check</span>
        <h2 className="mt-3 font-display text-[2rem] font-medium text-bone">Everything here is testable</h2>
        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden border border-sage/15 bg-sage/15 sm:grid-cols-3">
          <div className="bg-raised p-6">
            <p className="font-body text-[1.05rem] leading-relaxed text-bone">
              Al Qua&apos;a sky brightness is{" "}
              <Figure value={alquaa.sqm.toFixed(1)} unit="mag/arcsec2" tone="brass" /> (Bortle {alquaa.bortle}),
              versus Dubai at <Figure value={dubai.sqm.toFixed(1)} unit="mag/arcsec2" />, about{" "}
              {ratio.toFixed(0)}x darker.
            </p>
            <a href={falchi.url} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sage-light hover:text-brass">
              Source: Falchi et al. 2016
            </a>
          </div>
          <div className="bg-raised p-6">
            <p className="font-body text-[1.05rem] leading-relaxed text-bone">
              The next optimal window is around the{" "}
              {fmtLocalDate(new Date(sampleWindow.newMoon))}{" "}
              new moon, with the best night under{" "}
              <Figure value={Math.round(best.moonIllumination * 100)} unit="% moon" tone="brass" />, computed from ephemeris.
            </p>
            <Link href="/methods" className="mt-3 inline-block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sage-light hover:text-brass">
              Verify against Stellarium
            </Link>
          </div>
          <div className="bg-raised p-6">
            <p className="font-body text-[1.05rem] leading-relaxed text-bone">
              An Arabic-only host can run a full guided session, because the tour is
              generated and narrated by the platform. A committed sample proves it
              with no API key.
            </p>
            <Link href="/guide" className="mt-3 inline-block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sage-light hover:text-brass">
              Read the sample tour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
