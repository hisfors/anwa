"use client";

import { useEffect, useRef, useState } from "react";
import StarChart from "@/components/StarChart";

interface Fact {
  label: string;
  value: string;
}

export default function KeepsakeCard({
  date,
  latitude,
  longitude,
  initialName = "",
}: {
  date: string;
  latitude: number;
  longitude: number;
  initialName?: string;
}) {
  const [name, setName] = useState(initialName);
  const [story, setStory] = useState<string>("");
  const [facts, setFacts] = useState<Fact[]>([]);
  const [chartISO, setChartISO] = useState<string>(`${date}T19:00:00Z`);
  const [longDate, setLongDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function load(withName: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/keepsake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, latitude, longitude, name: withName }),
      });
      const data = await res.json();
      setStory(data.story || "");
      setFacts(data.facts || []);
      if (data.chartISO) setChartISO(data.chartISO);
      if (data.date) setLongDate(data.date);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(initialName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function download() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0B100D",
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `anwa-night-${date}.png`;
      a.click();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* the poster */}
      <div
        ref={cardRef}
        className="mx-auto w-full max-w-[460px] rounded-lg border border-brass/25 bg-[#0B100D] p-7"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-display text-2xl text-bone">Anwa</span>
          <span className="arabic text-lg text-brass/80">أنواء</span>
        </div>
        <p className="mt-1 font-body text-sm text-sage smallcaps">A night under the sky at Al Qua&apos;a</p>

        <div className="mt-5 surface p-3">
          <StarChart latitude={latitude} longitude={longitude} dateISO={chartISO} showLabels={false} />
        </div>

        <p className="mt-5 font-body text-[1.05rem] italic leading-relaxed text-bone">
          {loading ? "Writing your keepsake..." : story}
        </p>

        {name && (
          <p className="mt-4 font-display text-lg text-brass">for {name}</p>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-sage/15 pt-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="font-body text-xs text-sage smallcaps">{f.label}</dt>
              <dd className="mt-0.5 font-body text-sm text-bone-muted">{f.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 border-t border-sage/15 pt-3 text-center font-body text-xs text-sage smallcaps">
          Al Qua&apos;a, UAE
        </p>
      </div>

      {/* controls */}
      <div className="self-center">
        <h3 className="font-display text-2xl text-bone">Make it yours</h3>
        <p className="mt-2 font-body text-base leading-relaxed text-bone-muted">
          Add your name, then save the card as an image to keep or share. The sky on it is the
          real sky over Al Qua&apos;a for {longDate || "your night"}.
        </p>
        <label className="kicker mt-6 block">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="optional"
          className="mt-1.5 w-full rounded-md border border-sage/25 bg-field px-3 py-2.5 font-body text-base text-bone outline-none focus:border-accent-bright"
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={download} disabled={saving || loading} className="btn">
            {saving ? "Saving..." : "Save as image"}
          </button>
          <button type="button" onClick={() => load(name)} disabled={loading} className="btn-ghost">
            Rewrite the story
          </button>
        </div>
      </div>
    </div>
  );
}
