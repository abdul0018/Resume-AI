import { memo, type CSSProperties, type ReactNode } from "react";

/*
 * Gulzor's drawn botanicals: the line icons (one stroke weight, drawn in when they scroll into view), the
 * white garden flowers of the closed card's flower line, and the small blossom marks.
 */

/* ------------------------------------------------------------------ */
/* Line icons                                                          */
/* ------------------------------------------------------------------ */

export type IconKind =
  | "calendar"
  | "pin"
  | "bouquet"
  | "rings"
  | "camera"
  | "feast"
  | "cake"
  | "music"
  | "heart"
  | "phone"
  | "telegram"
  | "whatsapp"
  | "arrow"
  | "clock"
  | "crescent"
  | "gift";

/** Every stroke is measured as 1, so CSS can draw it in with a dash offset. */
const P = ({ d }: { d: string }) => <path d={d} pathLength={1} />;

const ICONS: Record<IconKind, ReactNode> = {
  calendar: (
    <>
      <P d="M5.5 5h13a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <P d="M3.5 9.6h17" />
      <P d="M8 3v4M16 3v4" />
      <P d="M7.6 13h.1M12 13h.1M16.4 13h.1M7.6 16.6h.1M12 16.6h.1" />
    </>
  ),
  pin: (
    <>
      <P d="M12 21s-6.6-6.1-6.6-11.2a6.6 6.6 0 0 1 13.2 0C18.6 14.9 12 21 12 21z" />
      <P d="M12 7.4a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z" />
    </>
  ),
  bouquet: (
    <>
      <P d="M12 3.2a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6z" />
      <P d="M7.6 5.8a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6z" />
      <P d="M16.4 5.8a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6z" />
      <P d="M12 7.8v6.4M8.4 10.3l2.6 4M15.6 10.3l-2.6 4" />
      <P d="M9.2 14.2h5.6l-1.3 6.6h-3z" />
    </>
  ),
  rings: (
    <>
      <P d="M9.4 9.2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
      <P d="M14.6 9.2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
      <P d="M14.6 8.6l-1.7-2 1.7-2.2 1.7 2.2z" />
    </>
  ),
  camera: (
    <>
      <P d="M5 7.2h14a2 2 0 0 1 2 2v8.6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.2a2 2 0 0 1 2-2z" />
      <P d="M8.4 7.2l1.5-2.6h4.2l1.5 2.6" />
      <P d="M12 9.8a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2z" />
      <P d="M17.6 10.2h.1" />
    </>
  ),
  feast: (
    <>
      <P d="M12.2 7a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4z" />
      <P d="M12.2 9.4a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z" />
      <P d="M3.6 4v4.2c0 .9.6 1.6 1.4 1.6s1.4-.7 1.4-1.6V4M5 4v16" />
      <P d="M19.6 20V4c1.5 1.2 2 3.2 2 5.8 0 .9-.6 1.6-1.4 1.6h-.6" />
    </>
  ),
  cake: (
    <>
      <P d="M4.5 20.5h15" />
      <P d="M6 20.5v-5.2h12v5.2" />
      <P d="M7.8 15.3v-4h8.4v4" />
      <P d="M6 17.4c1 .9 2 .9 3 0s2-.9 3 0 2 .9 3 0 2-.9 3 0" />
      <P d="M12 11.3V8.6" />
      <P d="M12 8.4c-.9-.8-.9-2 0-3.2.9 1.2.9 2.4 0 3.2z" />
    </>
  ),
  music: (
    <>
      <P d="M9 17.6V6.2l10-2.1v11.4" />
      <P d="M9 9.3l10-2.1" />
      <P d="M7 15.6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
      <P d="M17 13.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
    </>
  ),
  heart: <P d="M12 20s-7.2-4.5-7.2-9.8A4 4 0 0 1 12 8a4 4 0 0 1 7.2 2.2C19.2 15.5 12 20 12 20z" />,
  phone: <P d="M6.7 3.6h2.5l1.4 4-1.9 1.3a11 11 0 0 0 6.4 6.4l1.3-1.9 4 1.4v2.5a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.7 5.8a2 2 0 0 1 2-2.2z" />,
  telegram: (
    <>
      <P d="M20.6 4.4L3.4 11.1l5.8 2.1 2.1 6.1 3.2-3.7 4.7 3.4z" />
      <P d="M9.2 13.2l11.4-8.8" />
    </>
  ),
  whatsapp: (
    <>
      <P d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z" />
      <P d="M9.1 8.5c.3-.4.8-.4 1.1-.1l.9 1.3c.2.3.1.7-.1.9l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.6-.3.9-.1l1.3.9c.3.3.3.8-.1 1.1-.6.6-1.5.9-2.3.6a8 8 0 0 1-4.8-4.8c-.3-.8 0-1.7.6-2.3z" />
    </>
  ),
  arrow: <P d="M4 12h15M14.2 7.2L19 12l-4.8 4.8" />,
  gift: (
    <>
      <P d="M4 10.5h16v3H4z" />
      <P d="M5.5 13.5v7h13v-7" />
      <P d="M12 10.5v10" />
      <P d="M12 10.5c-2.6 0-5-1-5-3a2 2 0 0 1 3.4-1.4C11.6 7.3 12 10.5 12 10.5zM12 10.5c2.6 0 5-1 5-3a2 2 0 0 0-3.4-1.4C12.4 7.3 12 10.5 12 10.5z" />
    </>
  ),
  crescent: (
    <>
      <P d="M14.6 4.2a8 8 0 1 0 5.2 13.6A6.6 6.6 0 0 1 14.6 4.2z" />
      <P d="M17.6 7.2l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" />
    </>
  ),
  clock: (
    <>
      <P d="M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8z" />
      <P d="M12 7.4V12l3 2" />
    </>
  ),
};

export function Icon({ kind, size = 24, className = "gz-ico", style }: { kind: IconKind; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.15}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {ICONS[kind]}
    </svg>
  );
}

/** Chooses a programme icon from the event's wording, cycling through the set when nothing matches. */
export function iconFor(title: string, index: number): IconKind {
  const t = title.toLowerCase();
  if (/duo|fotiha|namoz|qur.?on|xatm/.test(t)) return "crescent";
  if (/nikoh|fotiha|unashtiruv|marosim|ahd/.test(t)) return "rings";
  if (/kutib|kelish|yig‘il|yig'il|xush/.test(t)) return "bouquet";
  if (/foto|surat|kadr/.test(t)) return "camera";
  if (/tort|shirinlik/.test(t)) return "cake";
  if (/raqs|bazm|musiqa|kuy|qo‘shiq/.test(t)) return "music";
  if (/ziyofat|dasturxon|osh|kechki|banket|tushlik/.test(t)) return "feast";
  return (["bouquet", "rings", "camera", "feast", "cake", "music"] as const)[index % 6];
}

/* ------------------------------------------------------------------ */
/* Small marks                                                         */
/* ------------------------------------------------------------------ */

/** A five-petalled blossom in outline, for the lines on the photograph. */
export function BlossomMark({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true">
      <g fill="currentColor" fillOpacity="0.9">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M0,0 C-3.6,-2.6 -4,-7.6 0,-10 C4,-7.6 3.6,-2.6 0,0Z" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r="1.8" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

/** A leafy sprig set between two hairlines: the sections' divider. */
export function Sprig({ className = "gz-sprig", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style} aria-hidden="true">
      <i />
      <svg viewBox="0 0 32 20" width="32" height="20" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <path d="M4 15.5C10 13 17 9.5 28 4.5" pathLength={1} />
        <g fill="currentColor" fillOpacity="0.16">
          <path d="M9.5 13.2c-.4-2.3.6-4 2.6-4.8.5 2.1-.5 3.9-2.6 4.8z" pathLength={1} />
          <path d="M10.6 13.1c2.2-.9 4.1-.6 5.3.9-1.9 1.1-3.9.9-5.3-.9z" pathLength={1} />
          <path d="M16.2 10.2c-.3-2.3.8-3.9 2.8-4.6.4 2.1-.7 3.8-2.8 4.6z" pathLength={1} />
          <path d="M17.2 10.1c2.2-.7 4.1-.3 5.2 1.2-2 1-3.9.6-5.2-1.2z" pathLength={1} />
          <path d="M22.8 7.1c.2-2 1.6-3.2 3.4-3.3-.1 1.9-1.4 3.1-3.4 3.3z" pathLength={1} />
        </g>
      </svg>
      <i />
    </div>
  );
}

/** An eight-pointed star of two interlaced squares (the khatam), in outline with a filled heart. */
export function StarMark({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <rect x="-7.4" y="-7.4" width="14.8" height="14.8" />
        <rect x="-7.4" y="-7.4" width="14.8" height="14.8" transform="rotate(45)" />
      </g>
      <circle r="2.6" fill="currentColor" />
    </svg>
  );
}

/** Two hairlines with a small mark between: the closing divider. */
export function HeartRule({ className = "gz-heart-rule", star = false }: { className?: string; star?: boolean }) {
  return (
    <div className={className} aria-hidden="true">
      <i />
      {star ? (
        <StarMark size={15} />
      ) : (
        <svg viewBox="0 0 24 24" width="13" height="13">
          <path d="M12 20s-7.2-4.5-7.2-9.8A4 4 0 0 1 12 8a4 4 0 0 1 7.2 2.2C19.2 15.5 12 20 12 20z" fill="currentColor" />
        </svg>
      )}
      <i />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Garden flowers                                                      */
/* ------------------------------------------------------------------ */

/** A small seeded random generator, so every render lays the flowers the same way. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Piece =
  | { k: "leaf"; x: number; y: number; a: number; l: number; w: number; tone: number }
  | { k: "round"; x: number; y: number; r: number; tone: number }
  | { k: "blossom"; x: number; y: number; r: number; a: number }
  | { k: "rose"; x: number; y: number; r: number; a: number }
  | { k: "bud"; x: number; y: number; r: number; a: number }
  | { k: "gyp"; x: number; y: number; a: number; l: number };

/** Lays a slim line of garden flowers along y = 0, from x = 0 to `len`: leaves first, then the flowers on them. */
function layLine(len: number, seed: number, thick: number, big = 1): Piece[] {
  const rnd = seeded(seed);
  const r = (a: number, b: number) => a + rnd() * (b - a);
  const leaves: Piece[] = [];
  const airy: Piece[] = [];
  const flowers: Piece[] = [];
  for (let x = 2; x < len - 2; x += r(6, 10)) {
    const side = rnd() < 0.5 ? -1 : 1;
    const tone = Math.floor(r(0, 3));
    if (rnd() < 0.08) leaves.push({ k: "round", x, y: side * r(3, thick * 0.42), r: r(3, 4.6), tone: 2 });
    else leaves.push({ k: "leaf", x, y: side * r(0, thick * 0.18), a: side * r(22, 64) + (rnd() < 0.55 ? 0 : 180), l: r(15 * big, 24 * big), w: r(3.2 * big, 4.8 * big), tone });
  }
  // baby's breath: sprays of tiny white florets that keep the line airy
  for (let x = r(4, 10); x < len - 4; x += r(13, 22)) {
    const side = rnd() < 0.5 ? -1 : 1;
    airy.push({ k: "gyp", x, y: side * r(1, 4), a: side * r(30, 80) - 90 + (rnd() < 0.5 ? 0 : 180), l: r(10, 16) });
  }
  let x = r(8, 14);
  while (x < len - 8) {
    const pick = rnd();
    const y = r(-thick * 0.14, thick * 0.14);
    if (pick < 0.24) flowers.push({ k: "rose", x, y, r: r(8, 11) * big, a: r(0, 360) });
    else if (pick < 0.74) flowers.push({ k: "blossom", x, y: y + r(-3, 3), r: r(4.6, 7.6) * big, a: r(0, 72) });
    else flowers.push({ k: "bud", x, y: y + r(-5, 5), r: r(2.4, 3.4) * big, a: r(-50, 50) });
    x += r(9, 15) * big;
  }
  return [...leaves, ...airy, ...flowers];
}

const DEPTH: Record<Piece["k"], number> = { leaf: 0, round: 0, gyp: 1, bud: 2, blossom: 3, rose: 3 };
const byDepth = (pieces: Piece[]) => pieces.sort((a, b) => DEPTH[a.k] - DEPTH[b.k]);

const LEAF_TONES = [
  ["#aebb9f", "#7d8e6b"],
  ["#bcc6ae", "#8c9b7a"],
  ["#c3cbbd", "#97a593"],
];

function PieceArt({ p, id }: { p: Piece; id: (n: string) => string }) {
  switch (p.k) {
    case "leaf": {
      const { l, w } = p;
      return (
        <g transform={`translate(${p.x} ${p.y}) rotate(${p.a})`}>
          <path d={`M0,0 C${l * 0.3},${-w} ${l * 0.75},${-w * 0.9} ${l},0 C${l * 0.75},${w * 0.9} ${l * 0.3},${w} 0,0Z`} fill={`url(#${id(`leaf${p.tone}`)})`} />
          <path d={`M0.5,0 L${l * 0.88},0`} stroke="#6d7d5c" strokeOpacity="0.4" strokeWidth="0.5" />
        </g>
      );
    }
    case "round":
      return (
        <g transform={`translate(${p.x} ${p.y})`}>
          <circle r={p.r} fill={`url(#${id(`leaf${p.tone}`)})`} opacity="0.92" />
          <path d={`M0,${p.r * 0.85} L0,${-p.r * 0.5}`} stroke="#6d7d5c" strokeOpacity="0.3" strokeWidth="0.4" />
        </g>
      );
    case "blossom":
      return (
        <g transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${p.r / 10})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} d="M0,0 C-5.4,-2.8 -6.6,-8.6 -1.4,-10.2 Q0,-9.2 1.4,-10.2 C6.6,-8.6 5.4,-2.8 0,0Z" transform={`rotate(${a})`} fill={`url(#${id("petal")})`} stroke="#b9bca8" strokeWidth="0.45" />
          ))}
          <circle r="2.1" fill="#d9cd94" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <circle key={a} cx="0" cy="-3" r="0.55" fill="#b3a45f" transform={`rotate(${a})`} />
          ))}
        </g>
      );
    case "rose":
      return (
        <g transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${p.r / 10})`}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path key={a} d="M0,-2 C-7,-3 -8.6,-8.6 -3.6,-10.4 C-1.6,-11 1.6,-11 3.6,-10.4 C8.6,-8.6 7,-3 0,-2Z" transform={`rotate(${a})`} fill={`url(#${id("rose")})`} stroke="#c4c0ad" strokeWidth="0.4" />
          ))}
          {[30, 120, 210, 300].map((a) => (
            <path key={a} d="M0,-1 C-4.6,-1.6 -5.6,-5.6 -2.2,-6.8 C-0.8,-7.2 0.8,-7.2 2.2,-6.8 C5.6,-5.6 4.6,-1.6 0,-1Z" transform={`rotate(${a})`} fill={`url(#${id("rose")})`} stroke="#c4c0ad" strokeWidth="0.4" />
          ))}
          <circle r="3.4" fill={`url(#${id("heart")})`} />
          <path d="M-1.8,0.6 C-2.2,-1.6 -0.4,-2.8 1.2,-2 C2.4,-1.2 1.8,0.8 0.2,1 C-0.8,1.1 -1.2,0.2 -0.6,-0.4" fill="none" stroke="#c9c2ac" strokeWidth="0.5" strokeLinecap="round" />
        </g>
      );
    case "gyp": {
      const rnd = seeded(Math.round(p.x * 31 + p.l * 7));
      const tips = Array.from({ length: 7 }, (_, i) => {
        const t = 0.45 + (i / 6) * 0.55;
        return [p.l * t, (rnd() - 0.5) * p.l * 0.7, 0.9 + rnd() * 0.7] as const;
      });
      return (
        <g transform={`translate(${p.x} ${p.y}) rotate(${p.a})`}>
          {tips.map(([tx, ty], i) => (
            <path key={i} d={`M0,0 Q${tx * 0.5},${ty * 0.2} ${tx},${ty}`} fill="none" stroke="#9aa78a" strokeWidth="0.35" />
          ))}
          {tips.map(([tx, ty, tr], i) => (
            <circle key={`f${i}`} cx={tx} cy={ty} r={tr} fill="#fffefb" stroke="#c8cbb9" strokeWidth="0.3" />
          ))}
        </g>
      );
    }
    case "bud":
      return (
        <g transform={`translate(${p.x} ${p.y}) rotate(${p.a})`}>
          <path d={`M0,${p.r * 1.6} C${-p.r * 0.4},${p.r * 0.6} ${-p.r},${-p.r * 0.2} 0,${-p.r * 1.3} C${p.r},${-p.r * 0.2} ${p.r * 0.4},${p.r * 0.6} 0,${p.r * 1.6}Z`} fill={`url(#${id("petal")})`} stroke="#b9bca8" strokeWidth="0.4" />
          <path d={`M0,${p.r * 1.6} C${-p.r * 0.9},${p.r * 1.1} ${-p.r * 0.8},${p.r * 0.3} ${-p.r * 0.3},${p.r * 0.2} M0,${p.r * 1.6} C${p.r * 0.9},${p.r * 1.1} ${p.r * 0.8},${p.r * 0.3} ${p.r * 0.3},${p.r * 0.2}`} fill="none" stroke="#8a9a78" strokeWidth="0.7" />
        </g>
      );
  }
}

function FlowerDefs({ id }: { id: (n: string) => string }) {
  return (
    <defs>
      <radialGradient id={id("petal")} cx="0.5" cy="0.95" r="1">
        <stop offset="0" stopColor="#ece6d2" />
        <stop offset="0.45" stopColor="#faf8f1" />
        <stop offset="1" stopColor="#ffffff" />
      </radialGradient>
      <radialGradient id={id("rose")} cx="0.5" cy="1" r="1.1">
        <stop offset="0" stopColor="#e7dccb" />
        <stop offset="0.5" stopColor="#f8f3ea" />
        <stop offset="1" stopColor="#fffdf9" />
      </radialGradient>
      <radialGradient id={id("heart")}>
        <stop offset="0" stopColor="#e9d9c3" />
        <stop offset="1" stopColor="#f6efe3" />
      </radialGradient>
      {LEAF_TONES.map(([a, b], i) => (
        <linearGradient key={a} id={id(`leaf${i}`)} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      ))}
      <filter id={id("lift")} x="-10%" y="-40%" width="120%" height="180%">
        <feDropShadow dx="0" dy="1.1" stdDeviation="1.1" floodColor="#3f4a34" floodOpacity="0.22" />
      </filter>
    </defs>
  );
}

/**
 * Half of the closed card's flower line: white roses, blossoms, buds, olive and eucalyptus leaves, laid from
 * the card's edge to its seam. The right half is the left one turned about the seam, so the line is whole.
 */
export const FlowerLine = memo(function FlowerLine({ uid, side, w = 160, h = 66 }: { uid: string; side: "l" | "r"; w?: number; h?: number }) {
  const id = (n: string) => `gz-${n}-${uid}`;
  // two passes laid over each other make the line full; leaves always go under the flowers
  const pieces = byDepth([...layLine(w, side === "l" ? 11 : 23, h * 0.55, 1.25), ...layLine(w, side === "l" ? 37 : 41, h * 0.4, 1)]);
  return (
    <svg viewBox={`0 ${-h / 2} ${w} ${h}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={side === "r" ? { transform: "scaleX(-1)" } : undefined}>
      <FlowerDefs id={id} />
      <g filter={`url(#${id("lift")})`}>
        {pieces.map((p, i) => (
          <PieceArt key={i} p={p} id={id} />
        ))}
      </g>
    </svg>
  );
});

/** A thin silk bow in sage, tied where the two halves of the flower line meet. */
export const SilkBow = memo(function SilkBow({ uid }: { uid: string }) {
  const id = (n: string) => `gz-${n}-${uid}`;
  return (
    <svg viewBox="-40 -24 80 56" aria-hidden="true">
      <defs>
        <linearGradient id={id("silk")} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#c5ceb7" />
          <stop offset="0.35" stopColor="#e3e8da" />
          <stop offset="0.6" stopColor="#a9b69a" />
          <stop offset="1" stopColor="#8a9a7a" />
        </linearGradient>
        <filter id={id("bowlift")} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodColor="#3f4a34" floodOpacity="0.32" />
        </filter>
      </defs>
      <g filter={`url(#${id("bowlift")})`}>
        <g className="gz-bow-tail l">
          <path d="M-2,2 C-6,10 -10,18 -16,28 L-10,27 L-8,31 C-4,20 -1,10 2,3Z" fill={`url(#${id("silk")})`} />
        </g>
        <g className="gz-bow-tail r">
          <path d="M2,2 C5,10 9,18 13,29 L8,27 L5,31 C3,20 1,10 -2,3Z" fill={`url(#${id("silk")})`} />
        </g>
        <g className="gz-bow-loop l">
          <path d="M-3,0 C-12,-10 -26,-16 -31,-9 C-35,-2 -26,6 -3,3Z" fill={`url(#${id("silk")})`} />
          <path d="M-6,0 C-13,-6 -22,-10 -26,-6" fill="none" stroke="#f4f6ef" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
        </g>
        <g className="gz-bow-loop r">
          <path d="M3,0 C12,-10 26,-16 31,-9 C35,-2 26,6 3,3Z" fill={`url(#${id("silk")})`} />
          <path d="M6,0 C13,-6 22,-10 26,-6" fill="none" stroke="#f4f6ef" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
        </g>
        <rect className="gz-bow-knot" x="-4.2" y="-3.6" width="8.4" height="8" rx="3" fill="#9fad90" />
      </g>
    </svg>
  );
});

/**
 * A spray of garden flowers along a gentle arc, for the corners of the sections until the photographs of
 * the real flowers take their place.
 */
export const FlowerSpray = memo(function FlowerSpray({ uid, seed = 5, w = 220 }: { uid: string; seed?: number; w?: number }) {
  const id = (n: string) => `gz-${n}-${uid}`;
  const pieces = layLine(w, seed, 30);
  return (
    <svg viewBox={`0 -26 ${w} 52`} aria-hidden="true">
      <FlowerDefs id={id} />
      <g filter={`url(#${id("lift")})`}>
        {pieces.map((p, i) => (
          <PieceArt key={i} p={p} id={id} />
        ))}
      </g>
    </svg>
  );
});
