"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", key);
    };
  }, [ref, onClose]);
}

/** A chevron drawn to the palette, no emoji, no native arrow. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      className={`shrink-0 text-sage transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

/** Custom listbox select, styled to the almanac, no native browser chrome. */
export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));
  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-sage/25 bg-field px-3 py-2.5 text-left font-body text-[0.95rem] text-bone transition-colors hover:border-sage/50 focus:border-accent-bright focus:outline-none"
      >
        <span className="truncate">{current?.label ?? "Select"}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-30 mt-1 max-h-72 w-full min-w-max overflow-auto rounded-md border border-sage/30 bg-raised"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-baseline justify-between gap-4 px-3 py-2 text-left font-body text-[0.95rem] transition-colors ${
                    active
                      ? "bg-observatory text-brass"
                      : "text-bone-muted hover:bg-observatory/50 hover:text-bone"
                  }`}
                >
                  <span className="whitespace-nowrap">{o.label}</span>
                  {o.hint && <span className="figure text-xs text-sage">{o.hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function parseISO(v: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  return { y: +m[1], m: +m[2] - 1, d: +m[3] };
}
function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Custom calendar date field, no native date input, styled to the almanac. */
export function DateField({
  value,
  onChange,
  ariaLabel,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  const sel = parseISO(value);
  const [view, setView] = useState<{ y: number; m: number }>(
    sel ? { y: sel.y, m: sel.m } : { y: 2026, m: 0 },
  );

  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function step(delta: number) {
    setView((v) => {
      let m = v.m + delta;
      let y = v.y;
      if (m < 0) {
        m = 11;
        y -= 1;
      } else if (m > 11) {
        m = 0;
        y += 1;
      }
      return { y, m };
    });
  }

  const label = sel
    ? `${sel.d} ${MONTHS_SHORT[sel.m]} ${sel.y}`
    : "Pick a date";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-sage/25 bg-field px-3 py-2.5 text-left transition-colors hover:border-sage/50 focus:border-accent-bright focus:outline-none"
      >
        <span className="figure text-[0.95rem] text-bone">{label}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div
          role="dialog"
          className="absolute left-0 z-30 mt-1 w-[17rem] rounded-md border border-sage/30 bg-raised p-3"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => step(-1)}
              className="border border-sage/25 px-2 py-1 text-sage hover:border-sage/50 hover:text-bone"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden><path d="M8 2 L4 6 L8 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="font-body text-[0.95rem] text-bone smallcaps">
              {MONTHS_SHORT[view.m]} {view.y}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => step(1)}
              className="border border-sage/25 px-2 py-1 text-sage hover:border-sage/50 hover:text-bone"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden><path d="M4 2 L8 6 L4 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-0.5">
            {WEEK.map((w, i) => (
              <div key={i} className="pb-1 text-center font-mono text-[0.6rem] uppercase tracking-[0.1em] text-sage/70">
                {w}
              </div>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const iso = toISO(view.y, view.m, d);
              const isSel = value === iso;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`aspect-square rounded text-center font-mono text-[0.82rem] tabular-nums transition-colors ${
                    isSel
                      ? "bg-accent-deep text-bone"
                      : "text-bone-muted hover:bg-observatory hover:text-bone"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
