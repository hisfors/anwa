import GuideView from "@/components/GuideView";
import { SectionHeader } from "@/components/ui";
import { AL_QUAA } from "@/data/locations";
import type { Tour } from "@/lib/guide-types";
import sampleTour from "@/data/sample-tour.json";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "The Guide - an AI star tour in any language | Anwa",
};

const samples = sampleTour as Record<string, Tour>;

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; lat?: string; lon?: string }>;
}) {
  const sp = await searchParams;
  const live = Boolean(process.env.ANTHROPIC_API_KEY);
  const latitude = sp.lat ? parseFloat(sp.lat) : AL_QUAA.latitude;
  const longitude = sp.lon ? parseFloat(sp.lon) : AL_QUAA.longitude;
  // default to the committed sample night so the no-key view matches the shown tour
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "2026-07-12";

  return (
    <div className="py-10">
      <SectionHeader
        index="03"
        kicker="The Guide · AI that earns its place"
        title="A full guided tour, in any language, true to the heritage"
        lead="This is where AI genuinely belongs: turning the real sky and real Arab star lore into a narrated session in whatever language the guest speaks. The model is grounded in a curated heritage dataset, so it tells true stories, not invented ones. The point made plainly: a host who speaks only Arabic can run a full session for visitors from anywhere, because Anwa builds and narrates it."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Pillar title="Grounded, not guessed" body="The model is given only the curated star names, meanings, and the Anwa and Manazil calendars. It is told not to invent lore." />
        <Pillar title="Tied to the real night" body="The stars-up, the Galactic Centre transit, the moon and planets are computed first, then passed in as the tour's backbone." />
        <Pillar title="Arabic-first, any language" body="One API covers generation and translation. The committed sample ships in English and Arabic so the demo works with no key." />
      </div>

      <GuideView
        initialTour={samples.en}
        live={live}
        date={date}
        latitude={latitude}
        longitude={longitude}
      />
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel p-4">
      <span className="font-display text-lg text-bone">{title}</span>
      <p className="mt-2 font-body text-base leading-relaxed text-bone-muted">{body}</p>
    </div>
  );
}
