import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeader, Figure } from "@/components/ui";
import { fmtLocalLongDate } from "@/lib/astronomy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Host & Book - families earn | Anwa" };

export default async function BookPage() {
  const sites = await prisma.site.findMany({
    include: {
      host: true,
      availabilities: { where: { isOpen: true }, orderBy: { date: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="py-10">
      <SectionHeader
        index="04"
        kicker="Host & Book · families earn"
        title="Book a night with a camel-farming family"
        lead="Every site here is hosted by a local Al Qua'a family. Availability is tied to the Planner's genuinely dark nights, so a booking is always a good night under the sky. Payment is a request-to-book step for this build; the booking lifecycle is real and persists."
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/book/host" className="btn">
          List your site
        </Link>
        <Link href="/book/host#console" className="btn-ghost">
          Host console · manage requests
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {sites.map((s) => {
          const next = s.availabilities[0];
          return (
            <Link
              key={s.id}
              href={`/book/${s.id}`}
              className="panel group flex flex-col p-5 transition-colors hover:border-sage/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-bone group-hover:text-brass">{s.name}</h3>
                  <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sage">
                    {s.host.familyName}
                  </p>
                </div>
                <div className="text-right">
                  <Figure value={s.pricePerPerson} unit="AED pp" tone="brass" />
                </div>
              </div>
              <p className="mt-3 font-body text-base leading-relaxed text-bone-muted">{s.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-sage/12 pt-3 font-mono text-[0.66rem] text-sage">
                <span>Bortle {s.bortleClass}</span>
                <span>{s.skyBrightness.toFixed(1)} mag</span>
                <span>cap {s.capacity}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-body text-xs text-sage-light">
                  {s.availabilities.length} open night{s.availabilities.length === 1 ? "" : "s"}
                </span>
                {next && (
                  <span className="tag-brass">
                    next · {fmtLocalLongDate(next.date).split(" ").slice(0, 3).join(" ")}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
