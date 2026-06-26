import type { Metadata, Viewport } from "next";
import { Newsreader, Spectral, IBM_Plex_Mono, Amiri } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Display face: Newsreader, a classic editorial serif with optical sizing.
// Reads like old print rather than a trendy display cut.
const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anwa - the dark sky of Al Qua'a, measured and bookable",
  description:
    "Anwa turns Al Qua'a's dark night sky into a bookable, AI-guided, heritage-rooted experience that local camel-farming families can host and earn from.",
};

export const viewport: Viewport = {
  themeColor: "#0B0F0D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${spectral.variable} ${plexMono.variable} ${amiri.variable}`}
    >
      <body className="grain min-h-screen antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-almanac px-5 sm:px-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
