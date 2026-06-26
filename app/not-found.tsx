import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <span className="kicker">Off the chart</span>
      <h1 className="mt-3 font-display text-5xl text-bone">Nothing here</h1>
      <p className="mt-3 max-w-md font-body text-base leading-relaxed text-bone-muted">
        This page is below the horizon. Head back to the almanac.
      </p>
      <Link href="/" className="btn mt-6">
        Return to Anwa
      </Link>
    </div>
  );
}
