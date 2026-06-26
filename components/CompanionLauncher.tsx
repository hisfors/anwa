"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Companion from "@/components/Companion";

export default function CompanionLauncher({ live }: { live: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // the full companion already lives on its own page
  if (pathname === "/companion") return null;

  return (
    <>
      {/* click anywhere outside to close */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
      )}

      {/* the drawer */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[32rem] max-h-[calc(100dvh-7rem)] w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-sage/25 bg-raised shadow-2xl sm:right-6">
          <div className="flex shrink-0 items-center justify-between border-b border-sage/15 bg-observatory/60 px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg text-bone">Ask the Sky</span>
              <span className="arabic text-sm text-brass/70">أنواء</span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="font-body text-sm text-sage smallcaps hover:text-bone"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <Companion live={live} compact />
          </div>
        </div>
      )}

      {/* the floating button */}
      <button
        type="button"
        aria-label={open ? "Close the companion" : "Ask the sky"}
        onClick={() => setOpen((v) => !v)}
        className="group fixed bottom-5 right-4 z-50 flex items-center gap-2.5 rounded-full border border-brass/40 bg-accent-deep px-5 py-3.5 text-bone shadow-2xl transition-colors hover:bg-accent-deep/90 sm:right-6"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <>
              <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" strokeLinejoin="round" />
              <circle cx="8.5" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="12" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
            </>
          )}
        </svg>
        {!open && (
          <span className="font-body text-[0.95rem] smallcaps tracking-[0.06em]">Ask the sky</span>
        )}
      </button>
    </>
  );
}
