import { CSSProperties } from "react";

/**
 * A quiet starfield behind the whole site. Star positions are deterministic
 * (seeded), so server and client render identically, no hydration mismatch.
 * Most stars are still; a few twinkle, and shooting stars cross now and then.
 * Honours prefers-reduced-motion via the global rule.
 */

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle: boolean;
  dur: number;
  delay: number;
}

const rnd = mulberry32(20260712);
const STARS: Star[] = Array.from({ length: 180 }, () => {
  const opacity = +(rnd() * 0.5 + 0.18).toFixed(2);
  return {
    x: +(rnd() * 100).toFixed(2),
    y: +(rnd() * 100).toFixed(2),
    size: +(rnd() * 1.4 + 0.4).toFixed(2),
    opacity,
    twinkle: rnd() > 0.72,
    dur: +(rnd() * 4 + 4).toFixed(1),
    delay: +(rnd() * 6).toFixed(1),
  };
});

// angle 215deg streaks down-right (start upper-left); 330deg streaks down-left
// (start upper-right). translateX is negative so the head leads, tail trails.
const SHOOTING = [
  { top: "7%", left: "6%", angle: "215deg", dur: "9s", delay: "1.5s" },
  { top: "3%", left: "40%", angle: "215deg", dur: "13s", delay: "7s" },
  { top: "9%", left: "92%", angle: "330deg", dur: "11s", delay: "13s" },
  { top: "22%", left: "66%", angle: "330deg", dur: "16s", delay: "20s" },
];

export default function Starfield() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* a faint warmth low on the field, like distant airglow, never a glowing orb */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to top, rgba(34, 57, 45, 0.22), transparent)",
        }}
      />
      {STARS.map((s, i) => {
        const style: CSSProperties = {
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          opacity: s.opacity,
        };
        if (s.twinkle) {
          style.animation = `star-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`;
          (style as Record<string, string>)["--star-min"] = `${s.opacity}`;
          (style as Record<string, string>)["--star-max"] = `${Math.min(1, s.opacity + 0.5)}`;
        }
        return (
          <span
            key={i}
            className="absolute rounded-full bg-bone"
            style={style}
          />
        );
      })}
      {SHOOTING.map((s, i) => (
        <span
          key={`shoot-${i}`}
          className="shooting-star"
          style={
            {
              top: s.top,
              left: s.left,
              "--a": s.angle,
              "--end": "-540px",
              "--shoot-dur": s.dur,
              "--shoot-delay": s.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
