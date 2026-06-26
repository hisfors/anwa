"use client";

import { useState } from "react";
import { GUIDE_LANGUAGES } from "@/lib/guide-types";
import { Select } from "@/components/controls";

interface AvailOption {
  id: string;
  dateISO: string;
  label: string;
  score: number;
  note: string;
}

export default function BookingForm({
  siteId,
  capacity,
  availabilities,
}: {
  siteId: string;
  capacity: number;
  availabilities: AvailOption[];
}) {
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    partySize: 2,
    date: availabilities[0]?.dateISO ?? "",
    language: "en",
    message: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const chosen = availabilities.find((a) => a.dateISO === form.date);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, siteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit the request.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (availabilities.length === 0) {
    return (
      <p className="font-body text-sm text-sage-light">
        This site has no open nights right now. Check back after the next planning run.
      </p>
    );
  }

  if (state === "done") {
    return (
      <div className="panel-deep p-6">
        <span className="tag-brass">Request sent · status REQUESTED</span>
        <h3 className="mt-3 font-display text-2xl text-bone">Your request is in</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-bone-muted">
          The host has received your request for{" "}
          <span className="text-brass">{chosen?.label}</span> for {form.partySize}{" "}
          {form.partySize === 1 ? "guest" : "guests"}. They will confirm from the host
          console. This is a request to book, not a charge.
        </p>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setForm((f) => ({ ...f, guestName: "", guestEmail: "", message: "" }));
          }}
          className="btn-ghost mt-5"
        >
          Make another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel p-5 sm:p-6">
      <h3 className="font-display text-2xl text-bone">Request to book</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input
            required
            value={form.guestName}
            onChange={(e) => setForm({ ...form, guestName: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.guestEmail}
            onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Night">
          <Select
            value={form.date}
            ariaLabel="Night"
            onChange={(v) => setForm({ ...form, date: v })}
            options={availabilities.map((a) => ({
              value: a.dateISO,
              label: a.label,
              hint: `score ${a.score}`,
            }))}
          />
        </Field>
        <Field label={`Party size (max ${capacity})`}>
          <input
            required
            type="number"
            min={1}
            max={capacity}
            value={form.partySize}
            onChange={(e) => setForm({ ...form, partySize: parseInt(e.target.value || "1", 10) })}
            className="input"
          />
        </Field>
        <Field label="Tour language">
          <Select
            value={form.language}
            ariaLabel="Tour language"
            onChange={(v) => setForm({ ...form, language: v })}
            options={GUIDE_LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Message to the host">
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input resize-none"
              placeholder="Anything the host should know."
            />
          </Field>
        </div>
      </div>

      {chosen && (
        <p className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-sage">
          {chosen.note}
        </p>
      )}
      {error && <p className="mt-3 font-body text-sm text-[#C2603A]">{error}</p>}

      <button type="submit" disabled={state === "sending"} className="btn mt-5">
        {state === "sending" ? "Sending..." : "Send request"}
      </button>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #0b0f0d;
          border: 1px solid rgba(110, 139, 122, 0.25);
          color: #e8e6dc;
          padding: 0.6rem 0.75rem;
          font-family: var(--font-spectral), Georgia, serif;
          font-size: 1rem;
          outline: none;
        }
        :global(.input:focus) {
          border-color: #7fa98f;
        }
        :global(.input::placeholder) {
          color: #6e8b7a;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
