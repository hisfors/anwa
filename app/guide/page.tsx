import GuideView from "@/components/GuideView";
import PhotoPlate from "@/components/PhotoPlate";
import { SectionHeader } from "@/components/ui";
import { AL_QUAA } from "@/data/locations";
import type { Tour } from "@/lib/guide-types";
import sampleTour from "@/data/sample-tour.json";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "The Guide - a star tour in your language | Anwa",
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
  // show the example night by default so the page matches the tour below
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "2026-07-12";

  return (
    <div className="py-10">
      <SectionHeader
        index="03"
        kicker="The Guide"
        title="A guided tour of the night, in your language"
        lead="A walk through the night sky in whatever language you speak, with the old Arab and Bedouin names and stories for the stars you can see. A host who speaks only Arabic can still run the whole session for guests from anywhere, because the platform writes and narrates it for them."
      />

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <PhotoPlate
          src="/img/alquaa-sky-portrait.jpg"
          alt="The Milky Way standing tall over Al Qua'a on a clear night"
          caption="Al Qua'a, looking up · Photographed by the Anwa team"
          note="The kind of sky a guided tour walks you through, hour by hour."
          ratio="portrait"
          sizes="(max-width: 768px) 100vw, 35vw"
        />
        <div className="grid grid-cols-1 gap-7 self-center">
          <Pillar title="True to the heritage" body="Every tour uses the old Arabic star names and the Anwa and Manazil calendars passed down by Bedouin sky-watchers." />
          <Pillar title="Built around your night" body="It follows the real sky for the night you pick: which stars are up, when the Milky Way bright core is highest, where the moon and planets sit." />
          <Pillar title="Any language" body="Pick a language and the whole tour is written and read in it, Arabic first. English and Arabic are ready to read right now." />
        </div>
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
    <div className="border-t border-sage/25 pt-4">
      <span className="font-display text-xl text-bone">{title}</span>
      <p className="mt-2 font-body text-base leading-relaxed text-bone-muted">{body}</p>
    </div>
  );
}
