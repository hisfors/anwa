"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EMPTY = {
  hostName: "",
  familyName: "",
  phone: "",
  bio: "",
  siteName: "",
  description: "",
  latitude: "23.52",
  longitude: "55.49",
  capacity: "8",
  offerings: "Bedouin tea and dates, dinner, floor seating and blankets",
  pricePerPerson: "200",
  bortleClass: "2",
  skyBrightness: "21.8",
};

export default function SiteForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; name: string; openNights: number } | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create the site.");
        setState("error");
        return;
      }
      setCreated({ id: data.site.id, name: data.site.name, openNights: data.openNights });
      setState("done");
      setForm(EMPTY);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "done" && created) {
    return (
      <div className="panel-deep p-6">
        <span className="tag-brass">Site listed</span>
        <h3 className="mt-3 font-display text-2xl text-bone">{created.name} is live</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-bone-muted">
          We set {created.openNights} open night
          {created.openNights === 1 ? "" : "s"} for you, matched to the darkest upcoming
          nights at your site. Visitors can request to book now.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/book/${created.id}`} className="btn">View the listing</Link>
          <button type="button" onClick={() => setState("idle")} className="btn-ghost">
            List another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <F label="Your name"><I v={form.hostName} on={(v) => set("hostName", v)} req /></F>
        <F label="Family name (shown to guests)"><I v={form.familyName} on={(v) => set("familyName", v)} req /></F>
        <F label="Phone"><I v={form.phone} on={(v) => set("phone", v)} req /></F>
        <F label="Price per person (AED)"><I v={form.pricePerPerson} on={(v) => set("pricePerPerson", v)} type="number" /></F>
        <div className="sm:col-span-2">
          <F label="About your family"><I v={form.bio} on={(v) => set("bio", v)} /></F>
        </div>
        <F label="Site name"><I v={form.siteName} on={(v) => set("siteName", v)} req /></F>
        <F label="Capacity (guests)"><I v={form.capacity} on={(v) => set("capacity", v)} type="number" /></F>
        <div className="sm:col-span-2">
          <F label="Description"><I v={form.description} on={(v) => set("description", v)} req /></F>
        </div>
        <div className="sm:col-span-2">
          <F label="What you provide (comma separated)"><I v={form.offerings} on={(v) => set("offerings", v)} /></F>
        </div>
        <F label="Latitude"><I v={form.latitude} on={(v) => set("latitude", v)} type="number" /></F>
        <F label="Longitude"><I v={form.longitude} on={(v) => set("longitude", v)} type="number" /></F>
      </div>

      <details className="mt-4 border-t border-sage/12 pt-4">
        <summary className="cursor-pointer font-body text-sm text-sage-light">
          Advanced: sky readings (optional)
        </summary>
        <p className="mt-2 font-body text-sm text-bone-muted">
          Leave these as they are unless you have your own measurements. They describe how
          dark your sky is. A lower Bortle number means a darker sky (1 is the darkest), and a
          higher sky-darkness number means a darker sky too.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <F label="Bortle (1 darkest to 9)"><I v={form.bortleClass} on={(v) => set("bortleClass", v)} type="number" /></F>
          <F label="Sky darkness (higher is darker)"><I v={form.skyBrightness} on={(v) => set("skyBrightness", v)} type="number" /></F>
        </div>
      </details>

      {error && <p className="mt-3 font-body text-sm text-[#C2603A]">{error}</p>}

      <button type="submit" disabled={state === "sending"} className="btn mt-5">
        {state === "sending" ? "Listing..." : "List this site"}
      </button>

      <style jsx>{`
        :global(.sinput) {
          width: 100%;
          background: #0b0f0d;
          border: 1px solid rgba(110, 139, 122, 0.25);
          color: #e8e6dc;
          padding: 0.6rem 0.75rem;
          border-radius: 6px;
          font-family: var(--font-spectral), Georgia, serif;
          font-size: 1rem;
          outline: none;
        }
        :global(.sinput:focus) {
          border-color: #7fa98f;
        }
        :global(.sinput::placeholder) {
          color: #6e8b7a;
        }
      `}</style>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function I({
  v,
  on,
  type = "text",
  req = false,
}: {
  v: string;
  on: (v: string) => void;
  type?: string;
  req?: boolean;
}) {
  return (
    <input
      className="sinput"
      type={type}
      value={v}
      required={req}
      step={type === "number" ? "any" : undefined}
      onChange={(e) => on(e.target.value)}
    />
  );
}
