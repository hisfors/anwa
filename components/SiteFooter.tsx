import Link from "next/link";
import { SOURCES } from "@/data/darkness";

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
            A dark-sky almanac and booking platform built for Al Qua&apos;a, so the
            camel-farming families who hold this rare dark land can prove it, protect
            it, and earn from it.
          </p>
          <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sage">
            Tatweer hackathon · Challenge 05 · Al Ain region, UAE
          </p>
        </div>

        <div>
          <h4 className="kicker">Platform</h4>
          <ul className="mt-3 space-y-2 font-body text-sm text-bone-muted">
            <li><Link href="/proof" className="hover:text-brass">The Proof, darkness measured</Link></li>
            <li><Link href="/planner" className="hover:text-brass">The Planner, best nights</Link></li>
            <li><Link href="/guide" className="hover:text-brass">The Guide, AI star tour</Link></li>
            <li><Link href="/book" className="hover:text-brass">Host &amp; Book</Link></li>
            <li><Link href="/methods" className="hover:text-brass">Methods &amp; Sources</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="kicker">Primary sources</h4>
          <ul className="mt-3 space-y-2 font-body text-sm text-bone-muted">
            {SOURCES.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brass"
                >
                  {s.label.split(",")[0]}
                </a>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/astronexus/HYG-Database"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brass"
              >
                HYG star catalogue
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="rule mx-auto max-w-almanac px-8" />
      <div className="mx-auto flex max-w-almanac flex-col items-start justify-between gap-2 px-5 py-5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sage sm:flex-row sm:items-center sm:px-8">
        <span>Photographs shot on site at Al Qua&apos;a · team original</span>
        <span>Astronomy computed with astronomy-engine · no fabricated values</span>
      </div>
    </footer>
  );
}
