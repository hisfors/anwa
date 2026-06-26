import Link from "next/link";
import Image from "next/image";
import StarChart from "@/components/StarChart";
import { Figure, Stat } from "@/components/ui";
import { DARKNESS_BY_ID, brightnessRatio } from "@/data/darkness";
import { fmtLocalTime, fmtLocalDate } from "@/lib/astronomy";
import sampleWindow from "@/data/sample-window.json";

const MODULES = [
  {
    index: "01",
    href: "/proof",
    title: "The Proof",
    desc: "See how dark it is here next to the cities, with two photographs taken on site at Al Qua'a.",
    figure: "33×",
    unit: "darker than Dubai",
  },
  {
    index: "02",
    href: "/planner",
    title: "The Planner",
    desc: "Find the best nights to stargaze in the months ahead, worked out from the moon and the stars.",
    figure: "78",
    unit: "top night score",
  },
  {
    index: "03",
    href: "/guide",
    title: "The Guide",
    desc: "A guided tour of the night in any language, with the old Arabic names for the stars you can see.",
    figure: "8",
    unit: "languages",
  },
  {
    index: "04",
    href: "/book",
    title: "Host & Book",
    desc: "Book a night with a local camel-farming family, who host you under the sky on a dark night.",
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
              <div className="flex items-center justify-between font-body text-[0.8rem] text-sage smallcaps">
                <span>Al Qua&apos;a, UAE. Photographed by the Anwa team.</span>
                <span className="hidden sm:inline">The Milky Way bright core, with green airglow</span>
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
              here live by camel farming, while the night sky above them, a rare and
              shrinking thing, earns nothing. Anwa lets you book a night under that
              sky, hosted by the families who hold it, with a guided tour of the stars
              in your own language.
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
            <Stat label="Al Qua'a sky darkness" value={alquaa.sqm.toFixed(1)} tone="brass" sub={`Bortle ${alquaa.bortle} of 9 (1 is the darkest)`} />
            <Stat label="Dubai sky darkness" value={dubai.sqm.toFixed(1)} sub={`Bortle ${dubai.bortle} of 9`} />
            <Stat label="Darker than Dubai" value={`${ratio.toFixed(0)}x`} tone="brass" sub="about this much darker" />
            <Stat label="Stars you can see" value="2,072" sub="each shown where it sits" />
          </div>
        </div>
      </section>

      {/* The computed centrepiece: a real star chart, not a decorative blob */}
      <section className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="kicker">The sky over Al Qua&apos;a</span>
          <h2 className="mt-3 font-display text-[2.1rem] font-medium leading-[1.1] text-bone sm:text-[2.5rem]">
            See the sky on the next dark night
          </h2>
          <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-bone-muted">
            This is the sky above Al Qua&apos;a on the next dark night, the 12th of
            July, as if you lay back and looked straight up. Each dot is a star where
            it will actually be. The gold ones carry their old Arabic names, and the
            soft cloudy band is the Milky Way.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-sage/15 pt-5">
            <Stat label="Night" value={best.label.split(" ").slice(1).join(" ")} sub="2026, around the new moon" />
            <Stat label="Milky Way at its highest" value={fmtLocalTime(new Date(chartTime))} unit="local time" sub="looking due south" tone="brass" />
            <Stat label="How high it climbs" value={best.gcMaxAltitude} unit="degrees up" tone="brass" sub="well clear of the horizon" />
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
        <div className="border border-sage/15 bg-[#080C12] p-4 sm:p-6">
          <StarChart
            latitude={sampleWindow.location.latitude}
            longitude={sampleWindow.location.longitude}
            dateISO={chartTime}
          />
          <div className="mt-3 flex items-center justify-between font-body text-[0.8rem] text-sage smallcaps">
            <span>Looking straight up, north at the top</span>
            <span className="font-mono">{fmtLocalTime(new Date(chartTime))} · 12 Jul 2026</span>
          </div>
        </div>
      </section>

      {/* Module index, a ledger, not bento cards */}
      <section className="mt-24">
        <div className="flex items-baseline justify-between border-t border-sage/20 pt-5">
          <span className="kicker">What you can do here</span>
          <span className="font-body text-[0.85rem] text-sage smallcaps">
            For visitors and host families
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

      {/* Why this place, in plain terms */}
      <section className="mt-24">
        <span className="kicker">Why Al Qua&apos;a</span>
        <h2 className="mt-3 font-display text-[2.1rem] font-medium text-bone">A rare sky, an hour from the city</h2>
        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden border border-sage/15 bg-sage/15 sm:grid-cols-3">
          <div className="bg-raised p-6">
            <h3 className="font-display text-xl text-brass">About {ratio.toFixed(0)} times darker than Dubai</h3>
            <p className="mt-2 font-body text-[1.05rem] leading-relaxed text-bone-muted">
              The Milky Way, the planets, even faint meteors show to the naked eye here.
              In the city, almost none of that is left.
            </p>
            <Link href="/proof" className="mt-3 inline-block font-body text-base text-sage-light smallcaps hover:text-brass">
              See how it compares
            </Link>
          </div>
          <div className="bg-raised p-6">
            <h3 className="font-display text-xl text-brass">Darkest around each new moon</h3>
            <p className="mt-2 font-body text-[1.05rem] leading-relaxed text-bone-muted">
              When the moon is gone the sky is at its blackest. The next window is around
              the {fmtLocalDate(new Date(sampleWindow.newMoon))} new moon.
            </p>
            <Link href="/planner" className="mt-3 inline-block font-body text-base text-sage-light smallcaps hover:text-brass">
              Plan a night
            </Link>
          </div>
          <div className="bg-raised p-6">
            <h3 className="font-display text-xl text-brass">Guided in your language</h3>
            <p className="mt-2 font-body text-[1.05rem] leading-relaxed text-bone-muted">
              Your host walks you through the night in your own language, with the old
              Arabic names for the stars, even if they speak only Arabic.
            </p>
            <Link href="/guide" className="mt-3 inline-block font-body text-base text-sage-light smallcaps hover:text-brass">
              Hear a tour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
