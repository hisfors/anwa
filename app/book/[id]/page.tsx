import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";
import { Figure, Stat } from "@/components/ui";
import { fmtLocalLongDate } from "@/lib/astronomy";

export const dynamic = "force-dynamic";

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      host: true,
      availabilities: { where: { isOpen: true }, orderBy: { date: "asc" } },
    },
  });

  if (!site) notFound();

  const offerings = site.offerings.split(",").map((o) => o.trim()).filter(Boolean);
  const availOptions = site.availabilities.map((a) => ({
    id: a.id,
    dateISO: a.date.toISOString(),
    label: fmtLocalLongDate(a.date),
    score: a.score,
    note: a.note,
  }));

  return (
    <div className="py-10">
      <Link href="/book" className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-sage hover:text-brass">
        &larr; All sites
      </Link>

      <div className="mt-4 border-t border-sage/20 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl text-bone">{site.name}</h1>
            <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-sage">
              Hosted by {site.host.familyName} · {site.host.name}
            </p>
          </div>
          <Figure value={site.pricePerPerson} unit="AED per person" tone="brass" className="text-xl" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-body text-lg leading-relaxed text-bone">{site.description}</p>
          <p className="mt-4 font-body text-base leading-relaxed text-bone-muted">{site.host.bio}</p>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-sage/15 py-5 sm:grid-cols-3">
            <Stat label="Sky darkness" value={site.skyBrightness.toFixed(1)} sub="higher is darker" tone="brass" />
            <Stat label="Bortle" value={`${site.bortleClass} of 9`} sub="1 is the darkest" />
            <Stat label="Capacity" value={site.capacity} sub="guests" />
          </div>
          <p className="mt-2 font-body text-xs text-sage-light">
            Location {site.latitude.toFixed(2)}N, {site.longitude.toFixed(2)}E
          </p>

          <div className="mt-6">
            <span className="kicker">What the host provides</span>
            <ul className="mt-3 flex flex-wrap gap-2">
              {offerings.map((o) => (
                <li key={o} className="tag-sage">{o}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <span className="kicker">The darkest upcoming nights</span>
            <ul className="mt-3 divide-y divide-sage/10 border-y border-sage/15">
              {site.availabilities.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5">
                  <span className="font-body text-sm text-bone">{fmtLocalLongDate(a.date)}</span>
                  <span className="font-body text-xs text-sage-light">{a.note} · score <span className="font-mono">{a.score}</span>/100</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <BookingForm siteId={site.id} capacity={site.capacity} availabilities={availOptions} />
        </div>
      </div>
    </div>
  );
}
