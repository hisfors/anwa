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
        kicker="The darkest upcoming nights"
        title="The best nights to stand under this sky"
        lead="The best nights are dark, moonless, and have the Milky Way high overhead. We look at the moon, the hours of full darkness, the height of the Milky Way bright core, and the meteor calendar for each upcoming night, then put them in order. Pick a night to see its sky."
      />

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <ScoreNote
          weight="up to 50"
          title="Moon darkness"
          body="How much of the dark, moonless time you get. A new moon scores near full; a full moon scores near zero."
        />
        <ScoreNote
          weight="up to 30"
          title="Milky Way bright core"
          body="How high the bright core of the Milky Way climbs while the sky is fully dark. From Al Qua'a it reaches about 37 degrees up in the best season."
        />
        <ScoreNote
          weight="up to 20"
          title="Meteor calendar"
          body="A bonus when a meteor shower peaks that night, larger when more meteors per hour are expected, from the International Meteor Organization calendar."
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
    <div className="border-t border-sage/25 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-xl text-bone">{title}</span>
        <span className="kicker text-brass/80">{weight}</span>
      </div>
      <p className="mt-3 font-body text-[1.02rem] leading-relaxed text-bone-muted">{body}</p>
    </div>
  );
}
