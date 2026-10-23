import { memo, type ReactElement } from "react";

/* Gold line-art drawings for the wedding timeline, matching the owner's rings illustration. */

export type LineArtKind = "door" | "feast" | "doira";

const STROKE = "#b8924a";
const WASH = "rgba(222, 190, 128, 0.16)";

function Blossoms({ y }: { y: number }) {
  const at = [
    [40, y, 1],
    [58, y + 8, 0.8],
    [142, y + 6, 0.9],
    [160, y - 2, 1],
    [26, y + 10, 0.7],
    [174, y + 10, 0.7],
  ];
  return (
    <g fill="none" stroke={STROKE} strokeWidth="1">
      {at.map(([x, yy, s], i) => (
        <g key={i} transform={`translate(${x} ${yy}) scale(${s})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-4.2" rx="2.6" ry="4" transform={`rotate(${a})`} fill="#fffaf0" />
          ))}
          <circle r="1.4" fill={STROKE} stroke="none" />
        </g>
      ))}
      <path d={`M20,${y + 16} C60,${y + 4} 140,${y + 4} 180,${y + 16}`} />
      {[30, 52, 148, 170].map((x, i) => (
        <path key={x} d={`M${x},${y + 12} q${i % 2 ? 6 : -6},-10 ${i % 2 ? 2 : -2},-16`} />
      ))}
    </g>
  );
}

const DRAW: Record<LineArtKind, () => ReactElement> = {
  /* Guests arriving: a cusped Mughal doorway with its doors open */
  door: () => (
    <g fill="none" stroke={STROKE} strokeWidth="1.4" strokeLinejoin="round">
      <path
        d="M50,176 L50,82 C50,70 56,64 62,60 C60,52 66,46 74,46 C76,38 84,34 92,36 C94,26 100,20 100,14 C100,20 106,26 108,36 C116,34 124,38 126,46 C134,46 140,52 138,60 C144,64 150,70 150,82 L150,176 Z"
        fill={WASH}
      />
      <path d="M62,176 L62,88 C62,78 68,72 74,70 C74,62 80,58 86,58 C88,50 94,46 100,42 C106,46 112,50 114,58 C120,58 126,62 126,70 C132,72 138,78 138,88 L138,176" />
      {/* open door leaves */}
      <path d="M62,176 L40,168 L40,96 C40,88 46,84 62,88" fill="#fffaf0" />
      <path d="M138,176 L160,168 L160,96 C160,88 154,84 138,88" fill="#fffaf0" />
      <path d="M46,160 L46,104 M154,160 L154,104" strokeWidth="0.8" />
      <path d="M48,120 h10 M48,140 h10 M142,120 h10 M142,140 h10" strokeWidth="0.8" />
      {/* lattice glimpse inside */}
      <path d="M86,176 L86,110 C86,100 100,94 100,94 C100,94 114,100 114,110 L114,176" strokeWidth="1" />
      <path d="M90,130 L110,150 M110,130 L90,150 M90,150 L110,170 M110,150 L90,170" strokeWidth="0.6" />
      <path d="M96,20 l4,-8 l4,8" />
      <path d="M44,176 H156 M38,182 H162" />
      <Blossoms y={178} />
    </g>
  ),
  /* The feast: a lagan of plov, a choynak and a piyola */
  feast: () => (
    <g fill="none" stroke={STROKE} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="88" cy="132" rx="66" ry="17" fill={WASH} />
      <ellipse cx="88" cy="128" rx="54" ry="11" fill="#fffaf0" />
      <path d="M44,128 C52,96 124,96 132,128" fill="#fffaf0" />
      {[56, 66, 76, 88, 100, 110, 120].map((x, i) => (
        <path key={x} d={`M${x},${122 - (i % 3) * 3} q4,-${8 + (i % 2) * 4} 8,-${4 + (i % 3) * 3}`} strokeWidth="0.8" />
      ))}
      <path d="M50,140 C70,148 106,148 126,140" strokeWidth="0.8" />
      <path d="M58,124 c6,-2 10,0 14,-2 M96,118 c6,-2 10,0 14,-2" strokeWidth="0.8" />
      {/* choynak */}
      <path d="M150,124 C142,124 140,104 146,96 C150,90 170,90 174,96 C180,104 178,124 170,124 Z" fill="#fffaf0" />
      <path d="M146,98 C146,92 174,92 174,98" />
      <path d="M156,90 C156,84 164,84 164,90" />
      <circle cx="160" cy="82" r="2" />
      <path d="M176,104 C188,100 190,90 194,86" />
      <path d="M144,104 C134,104 134,118 144,118" />
      <path d="M148,108 c6,4 18,4 24,0" strokeWidth="0.8" />
      {/* piyola */}
      <path d="M16,118 C16,128 36,128 36,118 Z" fill="#fffaf0" />
      <path d="M14,118 H38 M22,128 H30" />
      <Blossoms y={160} />
    </g>
  ),
  /* The evening: a doira frame drum with ribbons */
  doira: () => (
    <g fill="none" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round">
      <circle cx="100" cy="92" r="58" fill={WASH} />
      <circle cx="100" cy="92" r="50" fill="#fffaf0" />
      <circle cx="100" cy="92" r="44" strokeWidth="0.8" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={100 + Math.cos(a) * 54} cy={92 + Math.sin(a) * 54} r="3.2" strokeWidth="1" fill="#fffaf0" />;
      })}
      <path d="M78,80 C88,70 112,70 122,80 M74,96 C90,108 110,108 126,96" strokeWidth="0.8" />
      <path d="M100,64 l6,10 l-6,10 l-6,-10 Z M100,100 l6,10 l-6,10 l-6,-10 Z" strokeWidth="0.8" />
      <path d="M58,134 C50,150 56,160 46,174 M64,140 C62,154 70,162 64,178" />
      <path d="M142,134 C150,150 144,160 154,174 M136,140 C138,154 130,162 136,178" />
      <Blossoms y={176} />
    </g>
  ),
};

export const LineArt = memo(function LineArt({ kind, className }: { kind: LineArtKind; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {DRAW[kind]()}
    </svg>
  );
});
