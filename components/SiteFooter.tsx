import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-sage/15 bg-raised/40">
      <div className="mx-auto grid max-w-almanac grid-cols-1 gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl text-bone">Anwa</span>
            <span className="arabic text-base text-brass/70">أنواء</span>
          </div>
          <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-bone-muted">
            Book a night under the dark sky at Al Qua&apos;a, hosted by the
            camel-farming families who live there, with a guided tour of the stars in
            your own language.
          </p>
          <p className="mt-4 font-body text-[0.8rem] text-sage smallcaps">
            Al Ain region, UAE
          </p>
        </div>

        <div>
          <h4 className="kicker">Explore</h4>
          <ul className="mt-3 space-y-2 font-body text-sm text-bone-muted">
            <li><Link href="/proof" className="hover:text-brass">The Proof</Link></li>
            <li><Link href="/planner" className="hover:text-brass">The Planner</Link></li>
            <li><Link href="/guide" className="hover:text-brass">The Guide</Link></li>
            <li><Link href="/book" className="hover:text-brass">Host &amp; Book</Link></li>
            <li><Link href="/methods" className="hover:text-brass">How we know</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="kicker">Where the numbers come from</h4>
          <p className="mt-3 font-body text-sm leading-relaxed text-bone-muted">
            Our sky darkness readings and the full list of sources are set out on the{" "}
            <Link href="/methods" className="hover:text-brass">how we know</Link> page.
          </p>
        </div>
      </div>

      <div className="rule mx-auto max-w-almanac px-8" />
      <div className="mx-auto flex max-w-almanac flex-col items-start justify-between gap-2 px-5 py-5 font-body text-[0.8rem] text-sage smallcaps sm:flex-row sm:items-center sm:px-8">
        <span>Photographs taken on site at Al Qua&apos;a</span>
        <span>Made for Al Qua&apos;a, UAE</span>
      </div>
    </footer>
  );
}
