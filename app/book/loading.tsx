export default function Loading() {
  return (
    <div className="py-10">
      <div className="border-t border-sage/20 pt-5">
        <span className="kicker">Host &amp; Book · families earn</span>
        <div className="mt-4 h-9 w-1/2 animate-pulse bg-raised" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse border border-sage/12 bg-raised/50" />
        ))}
      </div>
    </div>
  );
}
