import KeepsakeCard from "@/components/KeepsakeCard";
import { SectionHeader } from "@/components/ui";
import { AL_QUAA } from "@/data/locations";

export const dynamic = "force-dynamic";
export const metadata = { title: "A keepsake of your night | Anwa" };

export default async function KeepsakePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; name?: string; lat?: string; lon?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "2026-07-12";
  const latitude = sp.lat ? parseFloat(sp.lat) : AL_QUAA.latitude;
  const longitude = sp.lon ? parseFloat(sp.lon) : AL_QUAA.longitude;
  const name = (sp.name || "").slice(0, 40);

  return (
    <div className="py-14">
      <SectionHeader
        index=""
        kicker="A keepsake"
        title="Take the night home"
        lead="A card of the real sky over Al Qua'a on your night, with a short story of what stood above you and the old names for it. Add your name and save it to keep or share."
      />
      <KeepsakeCard date={date} latitude={latitude} longitude={longitude} initialName={name} />
    </div>
  );
}
