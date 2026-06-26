"use client";

import { useRef, useState } from "react";

interface Reading {
  source: string;
  bortle: number | null;
  bortleLabel: string;
  limitingMagnitude: string;
  milkyWay: string;
  lightPollution: string;
  summary: string;
}

// shrink the photo in the browser so the upload is small and fast
function downscale(file: File, max = 1100): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReadMySky() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function readSample(sample: "landscape" | "portrait") {
    setLoading(true);
    setReading(null);
    setPreview(`/img/alquaa-sky-${sample}.jpg`);
    try {
      const res = await fetch("/api/read-sky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample }),
      });
      const data = await res.json();
      setReading(data.reading);
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setReading(null);
    try {
      const { base64, mediaType } = await downscale(file);
      setPreview(`data:${mediaType};base64,${base64}`);
      const res = await fetch("/api/read-sky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      setReading(data.reading);
    } catch {
      setReading({
        source: "unavailable",
        bortle: null,
        bortleLabel: "",
        limitingMagnitude: "",
        milkyWay: "",
        lightPollution: "",
        summary: "Could not read that image. Try a JPG or PNG photo of the night sky.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      {/* controls + preview */}
      <div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => fileRef.current?.click()} className="btn" disabled={loading}>
            Upload a night photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
        <p className="mt-3 font-body text-sm text-sage-light">
          No photo handy? Read one of ours:
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <button type="button" onClick={() => readSample("landscape")} className="btn-ghost" disabled={loading}>
            The Al Qua&apos;a wide shot
          </button>
          <button type="button" onClick={() => readSample("portrait")} className="btn-ghost" disabled={loading}>
            The Milky Way shot
          </button>
        </div>

        {preview && (
          <div className="surface mt-5 overflow-hidden">
            {/* plain img: this is a user upload or a local file, not next/image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="The sky being read" className="max-h-[320px] w-full object-cover" />
          </div>
        )}
      </div>

      {/* the reading */}
      <div>
        {loading && (
          <p className="font-body text-lg text-accent-bright">Reading the sky...</p>
        )}
        {!loading && !reading && (
          <p className="font-body text-lg leading-relaxed text-bone-muted">
            Anwa looks at your photo and estimates how dark your sky is, what is showing, and how
            much city light is reaching it. Then you can see how it compares with Al Qua&apos;a.
          </p>
        )}
        {!loading && reading && (
          <div>
            {reading.bortle !== null && (
              <div className="flex items-baseline gap-3">
                <span className="figure text-5xl text-brass">{reading.bortle}</span>
                <span className="font-body text-lg text-bone">{reading.bortleLabel}</span>
              </div>
            )}
            <p className="mt-4 font-body text-lg leading-relaxed text-bone">{reading.summary}</p>
            {reading.bortle !== null && (
              <dl className="mt-5 grid grid-cols-1 gap-y-3 border-t border-sage/15 pt-4 sm:grid-cols-2">
                <Row label="Milky Way" value={reading.milkyWay} />
                <Row label="Light pollution" value={reading.lightPollution} />
                <Row label="Faintest stars" value={reading.limitingMagnitude} />
                <Row label="How we read it" value={reading.source === "live" ? "Read by Anwa from your photo" : "An Al Qua'a example"} />
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-body text-sm text-sage smallcaps">{label}</dt>
      <dd className="mt-0.5 font-body text-base leading-relaxed text-bone-muted">{value}</dd>
    </div>
  );
}
