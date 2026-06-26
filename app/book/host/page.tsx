import { prisma } from "@/lib/prisma";
import SiteForm from "@/components/SiteForm";
import HostConsole from "@/components/HostConsole";
import { SectionHeader } from "@/components/ui";
import { fmtLocalLongDate } from "@/lib/astronomy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Host console | Anwa" };

export default async function HostPage() {
  const bookings = await prisma.booking.findMany({
    include: { site: { include: { host: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    partySize: b.partySize,
    dateLabel: fmtLocalLongDate(b.date),
    message: b.message,
    language: b.language,
    status: b.status,
    siteName: b.site.name,
    familyName: b.site.host.familyName,
  }));

  return (
    <div className="py-10">
      <SectionHeader
        index="04"
        kicker="Host console"
        title="List a site, take bookings"
        lead="This is the family side of Anwa. List a desert site in a few fields and the platform pre-fills your open nights from the Planner. Booking requests land in the console below, where you confirm or decline. No auth in this build, so the console shows every request for the demo."
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="kicker">List your site</span>
          <h2 className="mt-2 font-display text-2xl text-bone">Add a desert site</h2>
          <div className="mt-4">
            <SiteForm />
          </div>
        </div>

        <div id="console">
          <span className="kicker">Booking requests · {rows.length}</span>
          <h2 className="mt-2 font-display text-2xl text-bone">Manage requests</h2>
          <HostConsole initial={rows} />
        </div>
      </div>
    </div>
  );
}
