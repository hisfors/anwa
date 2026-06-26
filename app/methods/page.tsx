import { SectionHeader, Cite } from "@/components/ui";
import { SOURCES } from "@/data/darkness";
import { METEOR_SHOWERS } from "@/data/meteorShowers";
import sampleWindow from "@/data/sample-window.json";
import { fmtLocalDate, fmtLocalTime } from "@/lib/astronomy";

export const metadata = { title: "Methods & Sources | Anwa" };

const PROVENANCE = [
  {
    kind: "Photographed at Al Qua'a",
    tone: "brass",
    items: [
      "The two long-exposure photographs of the night sky. Photographed by the Anwa team.",
    ],
  },
  {
    kind: "Published, cited",
    tone: "sage",
    items: [
      "How dark each location is (its Bortle class), from published light-pollution maps.",
      "The meteor shower calendar, with peak dates and how many meteors per hour to expect.",
      "Star positions and brightness, covering the stars you can see with the naked eye.",
      "Arabic star names and their meanings, from the standard star-name references.",
    ],
  },
  {
    kind: "Calculated for each night",
    tone: "accent",
    items: [
      "The Moon's phase and how lit up it is, plus dusk, dawn and the planets on view.",
      "How high the Milky Way bright core climbs, and when it reaches its highest point.",
      "A sky-darkness figure for each site, from the published range for its Bortle class.",
      "The night score, from how dark the Moon leaves the sky, the core height, and meteors.",
    ],
  },
  {
    kind: "AI generated",
    tone: "sage",
    items: [
      "Only the narrated guided tour is written by AI.",
      "It draws on our curated heritage notes about the sky and the stars above Al Qua'a.",
      "Every other figure on the site is photographed, published, or calculated, never written by AI.",
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
        kicker="How it works"
        title="Where the numbers come from"
        lead="For anyone who wants the detail: where each figure comes from, and which ones are photographed at Al Qua'a, published, calculated for each night, or written by AI. Where a figure is an estimate rather than a direct measurement, it says so."
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
        <span className="kicker">How each figure is worked out</span>
        <div className="mt-4 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
          <Method title="The hours of full darkness">
            Full darkness is the stretch of night when the Sun sits well below the horizon and
            no glow is left in the sky. We work out when it begins and ends each night.
          </Method>
          <Method title="How high the Milky Way core climbs">
            The bright core of the Milky Way rises and sets like the Sun and Moon. We track how
            high it gets above the horizon and when it reaches its highest point. From Al Qua'a
            it climbs to about 37 degrees, roughly a third of the way up the sky.
          </Method>
          <Method title="How dark the sky is">
            Each site has a Bortle rating from published light-pollution maps, where 1 is the
            darkest sky and 9 the brightest. From that we give a sky-darkness figure, shown with
            its range. It is an estimate for the area, not a reading taken at the spot.
          </Method>
          <Method title="Comparing two skies">
            When we say one sky is a number of times darker than another, that follows directly
            from the difference in their darkness figures.
          </Method>
          <Method title="The night score (out of 100)">
            Up to 50 points for how much of the dark hours the Moon leaves the sky truly dark,
            up to 30 for how high the Milky Way core climbs, and up to 20 if a meteor shower
            peaks that night. Every part is shown for each night.
          </Method>
          <Method title="The star chart">
            A round map of the whole sky as you would see it lying back and looking up, with the
            point overhead at the centre and the horizon around the edge. Brighter stars are
            drawn larger, and the soft band of the Milky Way is drawn in too.
          </Method>
        </div>
        <p className="mt-5 font-body text-sm text-sage-light">
          The exact trigonometry behind the core height and the star map uses the standard
          equations astronomers use; we have kept the plain version above.
        </p>
      </div>

      {/* reproduce */}
      <div className="mt-16 border-t border-sage/20 pt-5">
        <span className="kicker">A worked example</span>
        <h3 className="mt-2 font-display text-2xl text-bone">The next dark-night window</h3>
        <div className="panel-deep mt-4 p-5">
          <p className="font-body text-base leading-relaxed text-bone">
            Worked out from a fixed reference date,{" "}
            {fmtLocalDate(new Date(sampleWindow.generatedFrom))}. Here are the numbers, and you
            can check them against any sky app.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-sage/15 pt-4 sm:grid-cols-4">
            <RV label="New moon" value={fmtLocalDate(new Date(sampleWindow.newMoon))} />
            <RV label="Best night" value={best.label} />
            <RV label="Moonlight" value={`${(best.moonIllumination * 100).toFixed(1)}%`} />
            <RV label="Core at its highest" value={`${fmtLocalTime(best.gcTransit ? new Date(best.gcTransit) : null)} local`} />
          </dl>
          <p className="mt-4 font-body text-base leading-relaxed text-bone-muted">
            If you want to check for yourself, open any sky app, set the place to Al Qua&apos;a
            and the date to the best night above, and the moon phase, the hours of full
            darkness, and the height of the Milky Way core will line up.
          </p>
        </div>
      </div>

      {/* meteor calendar */}
      <div className="mt-16 border-t border-sage/20 pt-5">
        <span className="kicker">Meteor shower calendar</span>
        <p className="mt-2 font-body text-sm text-sage-light">
          Peak date and how many meteors per hour to expect, from the International Meteor
          Organization.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-3">
          {METEOR_SHOWERS.map((m) => (
            <div key={m.id} className="flex items-baseline justify-between border-b border-sage/10 py-1.5">
              <span className="font-body text-sm text-bone">{m.name}</span>
              <span className="font-body text-xs text-sage-light">
                {String(m.peakDay).padStart(2, "0")}/{String(m.peakMonth).padStart(2, "0")} · <span className="font-mono">{m.zhr}</span>/hr
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* sources */}
      <div className="mt-16 border-t border-sage/20 pt-5">
        <span className="kicker">Primary sources</span>
        <ul className="mt-3 grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.id} className="border-b border-sage/12 pb-3">
              <p className="font-body text-sm text-bone">{s.label}</p>
              <p className="mt-0.5 font-body text-xs text-sage-light">{s.detail}</p>
              <Cite href={s.url}>view source</Cite>
            </li>
          ))}
        </ul>
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
      <dt className="font-body text-xs text-sage">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm tabular-nums text-brass">{value}</dd>
    </div>
  );
}
