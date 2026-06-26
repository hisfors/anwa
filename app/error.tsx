"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <span className="kicker">Instrument fault</span>
      <h1 className="mt-3 font-display text-4xl text-bone">Something went dark</h1>
      <p className="mt-3 max-w-md font-body text-base leading-relaxed text-bone-muted">
        A reading failed to come back. If this is a fresh clone, the database may not be
        seeded yet. Run <code className="font-mono text-brass">npm run db:reset</code> and try again.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="btn">
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Back to the almanac
        </Link>
      </div>
    </div>
  );
}
