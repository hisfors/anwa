"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/proof", label: "The Proof", index: "01" },
  { href: "/planner", label: "The Planner", index: "02" },
  { href: "/guide", label: "The Guide", index: "03" },
  { href: "/book", label: "Host & Book", index: "04" },
  { href: "/methods", label: "Methods", index: "05" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-sage/15 bg-field">
      {/* instrument strip */}
      <div className="mx-auto hidden max-w-almanac items-center justify-between px-8 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-sage md:flex">
        <span>Al Qua&apos;a · 23.52&deg;N 55.49&deg;E · UTC+4</span>
        <span>Dark-sky almanac &amp; booking platform</span>
        <span>Tatweer · Challenge 05</span>
      </div>
      <div className="rule mx-auto hidden max-w-almanac px-8 md:block" />

      <div className="mx-auto flex max-w-almanac items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-2xl font-semibold tracking-tight text-bone">
            Anwa
          </span>
          <span className="arabic text-lg text-brass/80">أنواء</span>
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.2em] text-sage sm:inline">
            / the star calendar
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-1.5 font-mono text-[0.74rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
                isActive(item.href)
                  ? "text-brass"
                  : "text-bone-muted hover:text-bone"
              }`}
            >
              <span
                className={`text-[0.6rem] ${
                  isActive(item.href) ? "text-brass/70" : "text-sage/60"
                }`}
              >
                {item.index}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="border border-sage/25 px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-bone-muted lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-sage/15 bg-raised lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 border-b border-sage/10 px-6 py-4 font-mono text-[0.8rem] uppercase tracking-[0.14em] ${
                isActive(item.href) ? "text-brass" : "text-bone-muted"
              }`}
            >
              <span className="text-[0.62rem] text-sage/60">{item.index}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
