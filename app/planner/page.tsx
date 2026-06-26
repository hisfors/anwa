import PlannerView from "@/components/PlannerView";
import { SectionHeader } from "@/components/ui";
import { rankNights, nextNewMoonWindow } from "@/lib/astronomy";
import { AL_QUAA } from "@/data/locations";

export const dynamic = "force-dynamic";

function todayISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default function PlannerPage() {
  const start = todayISO();
  const nights = rankNights(AL_QUAA.latitude, AL_QUAA.longitude, start, 30);
  const optimal = nextNewMoonWindow(AL_QUAA.latitude, AL_QUAA.longitude, new Date());

  return (
    <div className="py-10">
      <SectionHeader
        index="02"
        kicker="The Planner · computed, not guessed"
        title="The best nights to stand under this sky"
        lead="The ranking is real astronomy, not a model. Moon phase, astronomical twilight, the altitude of the Milky Way core, the planets up, and the fixed meteor calendar. Every raw value is shown so you can check it against Stellarium or timeanddate. That is the point: a moon phase is falsifiable."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreNote
          weight="up to 50"
          title="Moon darkness"
          body="The share of the astronomical night when the Moon is below the horizon. A new moon scores near full; a full moon scores near zero."
        />
        <ScoreNote
          weight="up to 30"
          title="Milky Way core"
          body="The highest the Galactic Centre reaches during true darkness. From Al Qua'a near the Tropic of Cancer it climbs to about 37 degrees in core season."
        />
        <ScoreNote
          weight="up to 20"
          title="Meteor calendar"
          body="A bonus when a known shower peaks that night, scaled by its zenithal hourly rate from the fixed IMO calendar."
        />
      </div>

      <PlannerView
        initialNights={nights}
        latitude={AL_QUAA.latitude}
        longitude={AL_QUAA.longitude}
        locationName={AL_QUAA.name}
        optimalNewMoon={optimal.newMoon}
      />
    </div>
  );
}

function ScoreNote({ weight, title, body }: { weight: string; title: string; body: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg text-bone">{title}</span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-brass/80">{weight}</span>
      </div>
      <p className="mt-2 font-body text-sm leading-relaxed text-bone-muted">{body}</p>
    </div>
  );
}
