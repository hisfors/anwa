"use client";

import { useState } from "react";

interface BookingRow {
  id: string;
  guestName: string;
  guestEmail: string;
  partySize: number;
  dateLabel: string;
  message: string;
  language: string;
  status: string;
  siteName: string;
  familyName: string;
}

const STATUS_TONE: Record<string, string> = {
  REQUESTED: "text-brass border-brass/40",
  CONFIRMED: "text-accent-bright border-accent-bright/40",
  DECLINED: "text-sage border-sage/30",
};

export default function HostConsole({ initial }: { initial: BookingRow[] }) {
  const [rows, setRows] = useState<BookingRow[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="mt-4 font-body text-sm text-sage-light">
        No booking requests yet. They will appear here as guests submit them.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="panel grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-lg text-bone">{r.guestName}</span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sage">
                {r.partySize} guest{r.partySize === 1 ? "" : "s"} · {r.language.toUpperCase()}
              </span>
              <span className={`tag-brass border ${STATUS_TONE[r.status] ?? ""}`}>{r.status}</span>
            </div>
            <p className="mt-1 font-mono text-xs text-sage-light">
              {r.siteName} · {r.familyName} · {r.dateLabel}
            </p>
            <p className="mt-1.5 font-body text-sm text-bone-muted">&ldquo;{r.message}&rdquo;</p>
            <p className="mt-0.5 font-mono text-[0.6rem] text-sage">{r.guestEmail}</p>
          </div>
          <div className="flex gap-2 sm:flex-col">
            <button
              type="button"
              disabled={busy === r.id || r.status === "CONFIRMED"}
              onClick={() => setStatus(r.id, "CONFIRMED")}
              className="btn px-3 py-1.5 text-[0.66rem] disabled:opacity-40"
            >
              Confirm
            </button>
            <button
              type="button"
              disabled={busy === r.id || r.status === "DECLINED"}
              onClick={() => setStatus(r.id, "DECLINED")}
              className="btn-ghost px-3 py-1.5 text-[0.66rem] disabled:opacity-40"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
