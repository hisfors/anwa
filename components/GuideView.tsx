"use client";

import { useState } from "react";
import { GUIDE_LANGUAGES, type Tour } from "@/lib/guide-types";

interface Props {
  initialTour: Tour;
  live: boolean;
  date: string;
  latitude: number;
  longitude: number;
}

export default function GuideView({
  initialTour,
  live,
  date,
  latitude,
  longitude,
}: Props) {
  const [tour, setTour] = useState<Tour>(initialTour);
  const [language, setLanguage] = useState<string>(initialTour.language);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function generate(lang: { code: string; label: string; rtl: boolean }) {
    setLanguage(lang.code);
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          latitude,
          longitude,
          language: lang.code,
          languageLabel: lang.label,
          rtl: lang.rtl,
        }),
      });
      const data = await res.json();
      if (data.tour) setTour(data.tour);
      if (data.note) setNote(data.note);
      else if (data.servedLanguage && data.servedLanguage !== lang.code) {
        setNote(
          `Live generation is off, so the committed ${data.servedLanguage.toUpperCase()} sample is shown. Add an API key to generate in ${lang.label}.`,
        );
      }
    } catch {
      setNote("Could not reach the generator. Showing the last tour.");
    } finally {
      setLoading(false);
    }
  }

  const rtl = tour.rtl;

  return (
    <div>
      {/* status + language picker */}
      <div className="mt-6 flex flex-col gap-4 border-y border-sage/15 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="kicker">
            Tour language · {live ? "live generation on" : "no key · committed samples"}
          </span>
          <span className={`tag-${live ? "brass" : "sage"}`}>
            {live ? "API key detected" : "no-key demo mode"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GUIDE_LANGUAGES.map((l) => {
            const active = l.code === language;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => generate(l)}
                disabled={loading}
                className={`border px-3.5 py-1.5 font-body text-[0.95rem] transition-colors disabled:opacity-50 ${
                  active
                    ? "border-brass/60 bg-observatory text-brass"
                    : "border-sage/25 text-bone-muted hover:border-sage/50 hover:text-bone"
                } ${l.rtl ? "arabic" : ""}`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
        {note && (
          <p className="font-body text-xs leading-relaxed text-sage-light">{note}</p>
        )}
      </div>

      {/* the tour */}
      <article
        dir={rtl ? "rtl" : "ltr"}
        className={`mt-8 ${rtl ? "arabic text-right" : ""}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={`font-display text-3xl text-bone ${rtl ? "arabic" : ""}`}>
            {tour.title}
          </h2>
          <span className={`tag-${tour.source === "live" ? "brass" : "sage"} ${rtl ? "arabic" : ""}`}>
            {tour.source === "live" ? "generated live" : "committed sample"}
          </span>
        </div>
        <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-sage" dir="ltr">
          {tour.location} · {tour.night}
        </p>
        <p className={`mt-4 max-w-3xl font-body text-base leading-relaxed text-bone-muted ${rtl ? "text-lg leading-loose" : ""}`}>
          {tour.intro}
        </p>

        {loading && (
          <p className="mt-6 font-mono text-sm text-accent-bright" dir="ltr">
            generating tour...
          </p>
        )}

        <div className="mt-8 space-y-8">
          {tour.segments.map((seg, i) => (
            <section
              key={i}
              className="grid grid-cols-1 gap-4 border-t border-sage/15 pt-5 sm:grid-cols-[auto_1fr]"
            >
              <div className={rtl ? "sm:order-2 sm:text-right" : ""} dir="ltr">
                <div className="font-mono text-xl text-brass">{seg.time}</div>
                <div className="mt-0.5 max-w-[8rem] font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">
                  {seg.phase}
                </div>
              </div>
              <div className={rtl ? "sm:order-1" : ""}>
                <h3 className={`font-display text-xl text-bone ${rtl ? "arabic" : ""}`}>
                  {seg.heading}
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5" dir="ltr">
                  {seg.facts.map((f, j) => (
                    <span key={j} className="font-mono text-xs">
                      <span className="text-sage">{f.label}: </span>
                      <span className="text-bone-muted">{f.value}</span>
                    </span>
                  ))}
                </div>
                <p className={`mt-3 font-body leading-relaxed text-bone ${rtl ? "text-lg leading-loose" : "text-base"}`}>
                  {seg.narration}
                </p>
              </div>
            </section>
          ))}
        </div>

        <p className={`mt-8 border-t border-sage/15 pt-5 font-body italic text-bone-muted ${rtl ? "text-lg leading-loose" : ""}`}>
          {tour.closing}
        </p>
      </article>

      {/* grounding, the falsifiability of the AI part */}
      <div className="mt-10 panel p-5" dir="ltr">
        <span className="kicker">How this tour was grounded</span>
        <ul className="mt-3 space-y-2">
          {tour.grounding.map((g, i) => (
            <li key={i} className="font-body text-sm leading-relaxed text-bone-muted">
              <span className="text-brass/70">·</span> {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
