import { ReactNode } from "react";

/** A printed-almanac section header: mono index + small-caps kicker, serif title, hairline. */
export function SectionHeader({
  index,
  kicker,
  title,
  lead,
}: {
  index?: string;
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <div className="border-t border-sage/20 pt-7">
      <div className="flex items-center gap-3">
        {index && (
          <span className="font-mono text-[0.75rem] tracking-[0.2em] text-brass/70">
            {index}
          </span>
        )}
        {kicker && <span className="kicker">{kicker}</span>}
      </div>
      <h2 className="mt-3 font-display text-[2.1rem] font-medium leading-[1.1] text-bone sm:text-[2.6rem]">
        {title}
      </h2>
      {lead && (
        <p className="mt-4 max-w-3xl font-body text-[1.3rem] leading-relaxed text-bone-muted">
          {lead}
        </p>
      )}
    </div>
  );
}

/** A number set in mono with its unit, the instrument readout. */
export function Figure({
  value,
  unit,
  className = "",
  tone = "bone",
}: {
  value: ReactNode;
  unit?: string;
  className?: string;
  tone?: "bone" | "brass" | "sage" | "accent";
}) {
  const toneClass =
    tone === "brass"
      ? "text-brass"
      : tone === "sage"
        ? "text-sage-light"
        : tone === "accent"
          ? "text-accent-bright"
          : "text-bone";
  return (
    <span className={`figure ${toneClass} ${className}`}>
      {value}
      {unit && (
        <span className="ml-1 text-[0.72em] font-normal text-sage">{unit}</span>
      )}
    </span>
  );
}

/** A labelled stat block for ledger grids. */
export function Stat({
  label,
  value,
  unit,
  sub,
  tone = "bone",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  tone?: "bone" | "brass" | "sage" | "accent";
}) {
  return (
    <div className="border-l border-sage/15 pl-3">
      <div className="kicker">{label}</div>
      <div className="mt-1.5">
        <Figure value={value} unit={unit} tone={tone} className="text-xl" />
      </div>
      {sub && <div className="mt-1 font-body text-xs text-sage-light">{sub}</div>}
    </div>
  );
}

/** A source citation chip linking out, used inline next to figures. */
export function Cite({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="cite-link font-mono text-[0.72rem]">
      {children}
    </a>
  );
}
