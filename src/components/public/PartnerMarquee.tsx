import Image from "next/image";

export type PartnerItem = { id: string; name: string; logoUrl: string; websiteUrl: string | null };

function Row({ partners, direction }: { partners: PartnerItem[]; direction: "left" | "right" }) {
  // Track is duplicated so the keyframe translateX(-50%) loops seamlessly
  const track = [...partners, ...partners];
  return (
    <div className="marquee">
      <div className={`marquee-track marquee-track--${direction}`}>
        {track.map((p, i) => {
          const logo = (
            <Image
              src={p.logoUrl}
              alt={p.name}
              width={140}
              height={64}
              className="h-14 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            />
          );
          return p.websiteUrl ? (
            <a
              key={`${p.id}-${i}`}
              href={p.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.name}
              tabIndex={i >= partners.length ? -1 : 0}
              className="flex items-center"
            >
              {logo}
            </a>
          ) : (
            <div key={`${p.id}-${i}`} className="flex items-center" aria-label={p.name}>
              {logo}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Two logo rows moving in opposite directions; pauses on hover, static grid under reduced motion. */
export default function PartnerMarquee({ partners }: { partners: PartnerItem[] }) {
  if (partners.length === 0) return null;
  const half = Math.ceil(partners.length / 2);
  let rowA = partners.slice(0, half);
  let rowB = partners.length > 1 ? partners.slice(half) : partners;
  // Densify: short partner lists would leave visible gaps in the loop
  const densify = (row: PartnerItem[]) => {
    let out = row;
    while (out.length < 8) out = [...out, ...row];
    return out;
  };
  rowA = densify(rowA.length ? rowA : partners);
  rowB = densify(rowB.length ? rowB : partners);

  return (
    <div className="space-y-2">
      <Row partners={rowA} direction="left" />
      <Row partners={rowB} direction="right" />
    </div>
  );
}
