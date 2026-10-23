import { memo } from "react";

/*
 * The invitation card, drawn: cream card stock with a fine grain, a double gold-foil border with
 * corner rosettes, a blind-embossed girih lattice in the spandrels, and a Mughal cusped arch pressed
 * into the paper and outlined twice in foil, crowned by a small finial. 600 × 1000 units, so the
 * card is 3:5; the text box in muhr.css sits inside the arch's inner line.
 */

export const CARD = { w: 600, h: 1000 };
/** The arch's pressed edge; the foil lines are drawn inside it. */
const ARCH = { l: 104, r: 496, top: 132, spring: 372, bottom: 904 };

type Pt = [number, number];
const bezier = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
};

/**
 * A multifoil arch: an ogee shoulder from the springing line to the apex, divided into `lobes`
 * arcs on each side that bow outward, so the cusps between them point into the opening.
 */
function cuspedArch(inset: number, lobes = 5) {
  const l = ARCH.l + inset;
  const r = ARCH.r - inset;
  const top = ARCH.top + inset * 1.15;
  const { spring } = ARCH;
  const bottom = ARCH.bottom - inset;
  const cx = (l + r) / 2;
  const w = r - l;
  const h = spring - top;
  const shoulder: Pt[] = [
    [l, spring],
    [l, spring - h * 0.62],
    [cx - w * 0.17, top + h * 0.2],
    [cx, top],
  ];
  const pts = Array.from({ length: lobes + 1 }, (_, i) => bezier(shoulder, i / lobes));
  const arc = (from: Pt, to: Pt) => {
    const rad = Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.62;
    return ` A${rad.toFixed(1)},${rad.toFixed(1)} 0 0 1 ${to[0].toFixed(1)},${to[1].toFixed(1)}`;
  };
  let d = `M${l},${bottom} L${l},${spring}`;
  for (let i = 1; i <= lobes; i++) d += arc(pts[i - 1], pts[i]);
  const mirror = ([x, y]: Pt): Pt => [2 * cx - x, y];
  for (let i = lobes - 1; i >= 0; i--) d += arc(mirror(pts[i + 1]), mirror(pts[i]));
  return `${d} L${r},${bottom} Z`;
}

/** An eight-point star (khatam) centred in a 52-unit tile. */
const STAR = Array.from({ length: 16 }, (_, i) => {
  const a = (i * Math.PI) / 8 - Math.PI / 2;
  const rad = i % 2 ? 7.5 : 13;
  return `${i ? "L" : "M"}${(26 + Math.cos(a) * rad).toFixed(2)},${(26 + Math.sin(a) * rad).toFixed(2)}`;
}).join(" ") + " Z";

const OUTER = cuspedArch(0);
const FOIL = cuspedArch(13);
const HAIR = cuspedArch(21);

/** A four-petal rosette for the border's corners. */
function Rosette({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d="M0,0 C4,-5 4,-11 0,-15 C-4,-11 -4,-5 0,0Z" transform={`rotate(${a + 45})`} fill="url(#ac-foil)" />
      ))}
      <circle r="2.6" fill="url(#ac-foil)" />
    </g>
  );
}

export const ArchCard = memo(function ArchCard() {
  return (
    <svg className="mh-card-art" viewBox={`0 0 ${CARD.w} ${CARD.h}`} aria-hidden="true">
      <defs>
        {/* gold foil: bright and dark bands so it reads as metal as the card moves */}
        <linearGradient id="ac-foil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="1000">
          <stop offset="0" stopColor="#8f6a2a" />
          <stop offset="0.16" stopColor="#e6c982" />
          <stop offset="0.3" stopColor="#b08636" />
          <stop offset="0.47" stopColor="#f6e4ad" />
          <stop offset="0.62" stopColor="#a87c32" />
          <stop offset="0.8" stopColor="#e2c37a" />
          <stop offset="1" stopColor="#8a6428" />
        </linearGradient>
        <linearGradient id="ac-stock" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fdf9f1" />
          <stop offset="1" stopColor="#f3e8d5" />
        </linearGradient>
        <radialGradient id="ac-panel" cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#f8f0e1" />
        </radialGradient>
        {/* cotton card grain */}
        <filter id="ac-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.33  0 0 0 0 0.2  0 0 0 0.09 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="ac-soft" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
        {/* girih: an eight-point star of two squares, blind-embossed (light edge above, shade below) */}
        <pattern id="ac-girih" width="52" height="52" patternUnits="userSpaceOnUse" x="14" y="14">
          <g fill="none" strokeWidth="0.9" strokeLinejoin="round">
            <path d={STAR} stroke="rgba(255,255,255,0.95)" transform="translate(-0.6 -0.6)" />
            <path d={STAR} stroke="rgba(130,98,52,0.13)" transform="translate(0.6 0.6)" />
          </g>
        </pattern>
        {/* the girih lives only in the spandrels: inside the border, outside the arch */}
        <mask id="ac-spandrel">
          <rect x="40" y="40" width="520" height="920" fill="#fff" />
          <path d={OUTER} fill="#000" stroke="#000" strokeWidth="18" />
          <rect x="40" y={ARCH.spring} width="520" height="600" fill="#000" />
        </mask>
      </defs>

      {/* the stock */}
      <rect width={CARD.w} height={CARD.h} fill="url(#ac-stock)" />
      <rect width={CARD.w} height={CARD.h} fill="#fff" filter="url(#ac-grain)" />

      {/* double foil border with rosettes at its corners */}
      <rect x="26" y="26" width="548" height="948" fill="none" stroke="url(#ac-foil)" strokeWidth="1.8" />
      <rect x="35" y="35" width="530" height="930" fill="none" stroke="url(#ac-foil)" strokeWidth="0.7" />
      <Rosette x={26} y={26} />
      <Rosette x={574} y={26} />
      <Rosette x={26} y={974} />
      <Rosette x={574} y={974} />

      <rect x="40" y="40" width="520" height="920" fill="url(#ac-girih)" mask="url(#ac-spandrel)" />

      {/* the arch pressed into the card: a raised lip catching light above, its shade below */}
      <path d={OUTER} fill="url(#ac-panel)" />
      <path d={OUTER} fill="none" stroke="rgba(120,90,48,0.32)" strokeWidth="3" transform="translate(1.4 1.8)" filter="url(#ac-soft)" />
      <path d={OUTER} fill="none" stroke="#fff" strokeWidth="2.4" transform="translate(-1 -1.2)" />
      <path d={OUTER} fill="none" stroke="rgba(150,118,70,0.35)" strokeWidth="0.8" />

      {/* foil: a bold line and a hairline inside it */}
      <path d={FOIL} fill="none" stroke="url(#ac-foil)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d={HAIR} fill="none" stroke="url(#ac-foil)" strokeWidth="0.8" strokeLinejoin="round" />

      {/* finial above the apex */}
      <g transform={`translate(300 ${ARCH.top - 12})`} fill="url(#ac-foil)">
        <path d="M0,-34 C6,-26 7,-18 0,-10 C-7,-18 -6,-26 0,-34Z" />
        <circle cy="-4" r="3.4" />
        <path d="M-16,2 C-9,-2 -4,-2 0,2 C4,-2 9,-2 16,2 C9,0 4,2 0,6 C-4,2 -9,0 -16,2Z" />
      </g>

      {/* the arch's foot: a foil rule joining both jambs */}
      <path d={`M${ARCH.l + 13},${ARCH.bottom - 13} H${ARCH.r - 13}`} stroke="url(#ac-foil)" strokeWidth="2.6" />
      <g transform={`translate(300 ${ARCH.bottom + 20})`} fill="url(#ac-foil)">
        <path d="M-40,0 C-24,-7 -10,-7 0,0 C10,-7 24,-7 40,0 C24,7 10,7 0,0 C-10,7 -24,7 -40,0Z" />
        <circle r="3" />
        <circle cx="-52" r="1.8" />
        <circle cx="52" r="1.8" />
      </g>
    </svg>
  );
});
