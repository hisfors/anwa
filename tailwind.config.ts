import type { Config } from "tailwindcss";

/**
 * Palette is rooted in real phenomena. The green is airglow, the faint oxygen
 * emission a genuinely dark sky gives off, visible in the team's Al Qua'a photos.
 * Brass is for starlight and key figures only. Bone is aged paper, never pure white.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        field: "#0B0F0D", // near-black, green undertone
        raised: "#121A16", // raised surface
        observatory: {
          DEFAULT: "#16241C",
          deep: "#1E3328",
        },
        sage: {
          DEFAULT: "#6E8B7A", // secondary text, hairlines
          light: "#8AA995",
        },
        accent: {
          deep: "#3E6B52", // primary actions
          bright: "#7FA98F", // active states, "up tonight" markers
        },
        bone: {
          DEFAULT: "#E8E6DC", // primary text
          muted: "#C9CEC4",
        },
        brass: {
          DEFAULT: "#D9A864", // starlight, key figures, sparingly
          bright: "#E8B873",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-spectral)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        arabic: ["var(--font-arabic)", "Geeza Pro", "serif"],
      },
      letterSpacing: {
        mono: "0.02em",
      },
      maxWidth: {
        almanac: "78rem",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-6px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.9" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 14s ease-in-out infinite alternate",
        twinkle: "twinkle 6s ease-in-out infinite",
        rise: "rise 900ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
