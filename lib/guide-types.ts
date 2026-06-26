/** Shared shape for a generated or pre-generated guided star tour. */

export interface TourFact {
  label: string;
  value: string; // kept as a string with its unit, rendered in mono
}

export interface TourSegment {
  time: string; // local time, HH:MM (UTC+4)
  phase: string; // what is happening in the sky, e.g. "Astronomical dark begins"
  heading: string;
  facts: TourFact[];
  narration: string; // 2-4 sentences, Arab and Bedouin lore woven in
  stars: string[]; // transliterations referenced, for cross-linking
}

export interface Tour {
  language: string; // ISO-ish code, e.g. "en", "ar"
  languageLabel: string; // human label, e.g. "English", "العربية"
  rtl: boolean;
  title: string;
  intro: string;
  location: string;
  night: string; // human-readable night
  segments: TourSegment[];
  closing: string;
  grounding: string[]; // the dataset facts that grounded this tour
  source: "sample" | "live"; // pre-generated and committed, or generated this session
}

export type TourBundle = Record<string, Tour>;

/** Languages the Guide offers. The first two ship as committed samples; all work live. */
export const GUIDE_LANGUAGES: Array<{ code: string; label: string; rtl: boolean }> = [
  { code: "ar", label: "العربية", rtl: true },
  { code: "en", label: "English", rtl: false },
  { code: "hi", label: "हिन्दी", rtl: false },
  { code: "ur", label: "اردو", rtl: true },
  { code: "fr", label: "Français", rtl: false },
  { code: "de", label: "Deutsch", rtl: false },
  { code: "zh", label: "中文", rtl: false },
  { code: "ru", label: "Русский", rtl: false },
];
