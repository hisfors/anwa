import Image from "next/image";

/**
 * A team photograph treated like a plate in a field guide: dark, faintly graded to
 * the green palette, never glossy, always captioned in mono. Aspect ratio is honoured.
 */
export default function PhotoPlate({
  src,
  alt,
  caption,
  note,
  ratio = "landscape",
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  caption: string;
  note?: string;
  ratio?: "landscape" | "portrait";
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <figure className="panel overflow-hidden">
      <div
        className={`relative w-full ${
          ratio === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="photo-treated object-cover"
        />
        {/* gentle floor gradient so captions sit, never a decorative wash over the sky */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-field/80 to-transparent" />
      </div>
      <figcaption className="border-t border-sage/15 px-4 py-3">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-sage">
          {caption}
        </p>
        {note && (
          <p className="mt-1.5 font-body text-sm leading-snug text-bone-muted">
            {note}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
