export default function Loading() {
  return (
    <div className="py-10">
      <div className="border-t border-sage/20 pt-5">
        <span className="kicker">The Planner · computed, not guessed</span>
        <div className="mt-4 h-9 w-2/3 animate-pulse bg-raised" />
      </div>
      <p className="mt-8 font-mono text-sm text-accent-bright">computing the upcoming nights...</p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse border border-sage/12 bg-raised/50" />
        ))}
      </div>
    </div>
  );
}
