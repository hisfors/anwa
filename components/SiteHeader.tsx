"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/proof", label: "The Proof", index: "01" },
  { href: "/planner", label: "The Planner", index: "02" },
  { href: "/guide", label: "The Guide", index: "03" },
  { href: "/companion", label: "Ask the Sky", index: "04" },
  { href: "/book", label: "Host & Book", index: "05" },
  { href: "/methods", label: "Methods", index: "06" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-sage/15 bg-field">
      <div className="mx-auto flex max-w-almanac items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-display text-[2.15rem] leading-none text-bone">Anwa</span>
          <span className="arabic text-[1.6rem] text-brass/85">أنواء</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-baseline gap-1.5 font-body text-[0.98rem] smallcaps transition-colors duration-300 ${
                isActive(item.href)
                  ? "text-brass"
                  : "text-bone-muted hover:text-bone"
              }`}
            >
              <span
                className={`figure text-[0.62rem] [font-variant-caps:normal] ${
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
          className="border border-sage/25 px-4 py-2 font-body text-[0.9rem] text-bone-muted smallcaps lg:hidden"
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
              className={`flex items-baseline gap-3 border-b border-sage/10 px-6 py-4 font-body text-[1rem] smallcaps ${
                isActive(item.href) ? "text-brass" : "text-bone-muted"
              }`}
            >
              <span className="figure text-[0.66rem] text-sage/60 [font-variant-caps:normal]">{item.index}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
