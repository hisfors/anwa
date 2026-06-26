/**
 * Generate the committed sample optimal-window result, reproducibly, from a fixed
 * reference date. This is what the no-key demo and the README claims rely on.
 * Run: npx tsx scripts/generate-sample.ts
 */
import fs from "fs";
import path from "path";
import { nextNewMoonWindow } from "@/lib/astronomy";
import { AL_QUAA } from "@/data/locations";

// Fixed reference date so the sample is reproducible and checkable.
const REFERENCE = new Date("2026-06-26T12:00:00.000Z");

const window = nextNewMoonWindow(AL_QUAA.latitude, AL_QUAA.longitude, REFERENCE);

const out = {
  generatedFrom: REFERENCE.toISOString(),
  location: AL_QUAA,
  ...window,
};

const file = path.join(process.cwd(), "data", "sample-window.json");
fs.writeFileSync(file, JSON.stringify(out, null, 2));
console.log("Wrote", file);
console.log("New moon:", window.newMoon);
console.log(
  "Best night:",
  window.best.label,
  "score",
  window.best.score,
  "illum",
  (window.best.moonIllumination * 100).toFixed(1) + "%",
  "GC",
  window.best.gcMaxAltitude + "deg",
);
console.log("GC transit:", window.best.gcTransit);
