"use client";

import { useEffect, useRef, useState } from "react";
import type { Tour } from "@/lib/guide-types";

// our language codes mapped to speech tags the device understands
const LANG_TAG: Record<string, string> = {
  ar: "ar-SA",
  en: "en-GB",
  hi: "hi-IN",
  ur: "ur-PK",
  fr: "fr-FR",
  de: "de-DE",
  zh: "zh-CN",
  ru: "ru-RU",
};

/** The lines we actually read aloud: headings and narration, not the data chips. */
function buildChunks(tour: Tour): string[] {
  const out: string[] = [];
  out.push(tour.title);
  if (tour.intro) out.push(tour.intro);
  for (const s of tour.segments) {
    out.push(s.heading);
    if (s.narration) out.push(s.narration);
  }
  if (tour.closing) out.push(tour.closing);
  return out;
}

function Icon({ path }: { path: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}
const PLAY = "M8 5v14l11-7z";
const PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z";
const STOP = "M6 6h12v12H6z";

export default function SpeechControls({ tour }: { tour: Tour }) {
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  // stop reading if the tour or language changes underneath us
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
  }, [tour.language, tour.title]);

  function pickVoice(tag: string): SpeechSynthesisVoice | null {
    const vs = voicesRef.current;
    const base = tag.split("-")[0];
    return (
      vs.find((v) => v.lang === tag) ||
      vs.find((v) => v.lang.toLowerCase().startsWith(base)) ||
      null
    );
  }

  function play() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const tag = LANG_TAG[tour.language] || "en-GB";
    const voice = pickVoice(tag);
    const chunks = buildChunks(tour);
    chunks.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = tag;
      if (voice) u.voice = voice;
      u.rate = 0.9;
      u.pitch = 1;
      if (i === chunks.length - 1) {
        u.onend = () => setState("idle");
        u.onerror = () => setState("idle");
      }
      synth.speak(u);
    });
    setState("playing");
  }

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2" dir="ltr">
      {state === "idle" && (
        <button type="button" onClick={play} className="btn-ghost px-4 py-2 text-[0.85rem]">
          <Icon path={PLAY} /> Listen
        </button>
      )}
      {state === "playing" && (
        <>
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis.pause();
              setState("paused");
            }}
            className="btn-ghost px-4 py-2 text-[0.85rem]"
          >
            <Icon path={PAUSE} /> Pause
          </button>
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis.cancel();
              setState("idle");
            }}
            className="btn-ghost px-3 py-2 text-[0.85rem]"
          >
            <Icon path={STOP} /> Stop
          </button>
        </>
      )}
      {state === "paused" && (
        <>
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis.resume();
              setState("playing");
            }}
            className="btn px-4 py-2 text-[0.85rem]"
          >
            <Icon path={PLAY} /> Resume
          </button>
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis.cancel();
              setState("idle");
            }}
            className="btn-ghost px-3 py-2 text-[0.85rem]"
          >
            <Icon path={STOP} /> Stop
          </button>
        </>
      )}
      <span className="font-body text-sm text-sage">Read aloud on your phone</span>
    </div>
  );
}
