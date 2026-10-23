import { memo, useId, type ReactElement } from "react";

/* Drawn ornaments for the "Oltin muhr" world: wax seal, ganch arch, Samarkand skyline, lanterns, cream roses. */

const clean = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "");

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Wax seal                                                            */
/* ------------------------------------------------------------------ */

function sealOutline(R: number) {
  const pts: string[] = [];
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = R * (1 + 0.032 * Math.sin(5 * t + 1) + 0.022 * Math.sin(9 * t + 2.4) + 0.014 * Math.sin(14 * t) + (Math.abs(Math.sin(t * 1.5 + 0.6)) > 0.985 ? 0.05 : 0));
    pts.push(`${(100 + Math.cos(t) * r).toFixed(2)},${(100 + Math.sin(t) * r).toFixed(2)}`);
  }
  return `M${pts.join(" L")}Z`;
}

export const WaxSeal = memo(function WaxSeal({ initials, className }: { initials: [string, string]; className?: string }) {
  const id = clean(useId());
  const g = (n: string) => `${n}${id}`;
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={g("wax")} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fdf7ea" />
          <stop offset="0.45" stopColor="#efdfbf" />
          <stop offset="0.85" stopColor="#d9bf8f" />
          <stop offset="1" stopColor="#c7a873" />
        </radialGradient>
        <radialGradient id={g("well")} cx="0.62" cy="0.66" r="0.75">
          <stop offset="0" stopColor="#f6ead0" />
          <stop offset="0.7" stopColor="#e7d3ab" />
          <stop offset="1" stopColor="#d2b47f" />
        </radialGradient>
        <linearGradient id={g("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f6a2a" />
          <stop offset="0.38" stopColor="#e9cd86" />
          <stop offset="0.55" stopColor="#fff1c4" />
          <stop offset="0.75" stopColor="#c09543" />
          <stop offset="1" stopColor="#8a6426" />
        </linearGradient>
        <filter id={g("soft")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={g("press")} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0.8" dy="1.2" stdDeviation="0.6" floodColor="#6b4a1c" floodOpacity="0.45" />
        </filter>
      </defs>
      <path d={sealOutline(84)} transform="translate(2 5)" fill="#7a5a2c" opacity="0.28" filter={`url(#${g("soft")})`} />
      <path d={sealOutline(84)} fill={`url(#${g("wax")})`} />
      <circle cx="100" cy="100" r="62" fill={`url(#${g("well")})`} />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#b8945a" strokeOpacity="0.45" strokeWidth="2.5" filter={`url(#${g("soft")})`} />
      <circle cx="100" cy="100" r="63.5" fill="none" stroke="#fffaf0" strokeOpacity="0.8" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="54" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="1.4" />
      <circle cx="100" cy="100" r="50" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="0.6" strokeDasharray="0.1 4.4" strokeLinecap="round" />
      <g filter={`url(#${g("press")})`} fill={`url(#${g("gold")})`} fontFamily="Corinthia, 'Pinyon Script', cursive">
        <text x="78" y="112" fontSize="62" textAnchor="middle">
          {initials[0]}
        </text>
        <text x="100" y="118" fontSize="30" textAnchor="middle" fontFamily="'Bodoni Moda', Georgia, serif" fontStyle="italic">
          &amp;
        </text>
        <text x="124" y="128" fontSize="62" textAnchor="middle">
          {initials[1]}
        </text>
      </g>
      <ellipse cx="70" cy="58" rx="26" ry="12" transform="rotate(-32 70 58)" fill="#fff" opacity="0.42" filter={`url(#${g("soft")})`} />
    </svg>
  );
});

/* ------------------------------------------------------------------ */
/* Lantern                                                             */
/* ------------------------------------------------------------------ */

export const Lantern = memo(function Lantern({ chain, className, style }: { chain: number; className?: string; style?: React.CSSProperties }) {
  const id = clean(useId());
  const g = (n: string) => `${n}${id}`;
  const top = chain;
  return (
    <svg viewBox={`0 0 60 ${top + 92}`} className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={g("m")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d5a22" />
          <stop offset="0.35" stopColor="#e3c27a" />
          <stop offset="0.55" stopColor="#fbe6a8" />
          <stop offset="1" stopColor="#8a6326" />
        </linearGradient>
        <radialGradient id={g("l")} cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="0.45" stopColor="#ffd77a" />
          <stop offset="1" stopColor="#e39a2c" />
        </radialGradient>
      </defs>
      <line x1="30" y1="0" x2="30" y2={top} stroke={`url(#${g("m")})`} strokeWidth="1.6" strokeDasharray="3 1.6" />
      <g transform={`translate(0 ${top})`}>
        <circle cx="30" cy="2" r="2.6" fill="none" stroke="#b08a44" strokeWidth="1.2" />
        <path d="M18,14 C18,7 24,4 30,4 C36,4 42,7 42,14Z" fill={`url(#${g("m")})`} />
        <rect x="15" y="13" width="30" height="3.4" rx="1.4" fill={`url(#${g("m")})`} />
        <path d="M17,16 L43,16 L46,52 L14,52Z" fill={`url(#${g("l")})`} />
        {[22, 30, 38].map((x) => (
          <path key={x} d={`M${x - 3},48 L${x - 3},27 C${x - 3},22 ${x + 3},22 ${x + 3},27 L${x + 3},48`} fill="none" stroke="#9a7330" strokeWidth="1.2" />
        ))}
        <path d="M17,16 L43,16 L46,52 L14,52Z" fill="none" stroke={`url(#${g("m")})`} strokeWidth="2.2" />
        <rect x="12" y="51" width="36" height="4" rx="1.5" fill={`url(#${g("m")})`} />
        <path d="M16,55 L44,55 L33,70 L27,70Z" fill={`url(#${g("m")})`} />
        <path d="M30,70 L30,86" stroke={`url(#${g("m")})`} strokeWidth="2" />
        <circle cx="30" cy="88" r="2.6" fill={`url(#${g("m")})`} />
      </g>
    </svg>
  );
});

/* ------------------------------------------------------------------ */
/* Cream roses (dimensional, used on the arch)                         */
/* ------------------------------------------------------------------ */

const PETAL = "M0,0 C-0.42,-0.16 -0.58,-0.78 -0.24,-0.98 C-0.09,-1.06 0.09,-1.06 0.24,-0.98 C0.58,-0.78 0.42,-0.16 0,0Z";
const LEAF = "M0,0 C0.24,-0.34 0.68,-0.38 1,0 C0.68,0.38 0.24,0.34 0,0Z";

function CreamRose({ x, y, r, rot, gid }: { x: number; y: number; r: number; rot: number; gid: string }) {
  const ring = (n: number, s: number, o: number, fill: string) =>
    Array.from({ length: n }, (_, i) => <path key={`${n}${i}`} d={PETAL} transform={`rotate(${(360 / n) * i + o}) scale(${s})`} fill={fill} />);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`} stroke="#c9a464" strokeWidth={0.6 / r}>
      {ring(8, 1, 0, `url(#${gid}p1)`)}
      {ring(6, 0.72, 24, `url(#${gid}p2)`)}
      {ring(5, 0.46, 46, `url(#${gid}p3)`)}
      <path d="M-0.2,0.02 C-0.18,-0.18 0.16,-0.22 0.2,0 C0.18,0.16 -0.07,0.2 -0.1,0.04" fill="none" stroke="#b48a46" strokeWidth={0.9 / r} />
    </g>
  );
}

function RoseDefs({ gid }: { gid: string }) {
  return (
    <>
      <linearGradient id={`${gid}p1`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#e2c48c" />
        <stop offset="0.55" stopColor="#f8ecd2" />
        <stop offset="1" stopColor="#fffaf0" />
      </linearGradient>
      <linearGradient id={`${gid}p2`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#d6b26f" />
        <stop offset="1" stopColor="#fbf2de" />
      </linearGradient>
      <linearGradient id={`${gid}p3`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#c99d55" />
        <stop offset="1" stopColor="#f3e2bd" />
      </linearGradient>
      <linearGradient id={`${gid}lf`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#a98a4c" />
        <stop offset="1" stopColor="#e4d3a3" />
      </linearGradient>
    </>
  );
}

function Bouquet({ x, y, scale, seed, gid, spread = 1 }: { x: number; y: number; scale: number; seed: number; gid: string; spread?: number }) {
  const rand = rng(seed);
  const leaves: ReactElement[] = [];
  const roses: ReactElement[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.5;
    const d = scale * (0.9 + rand() * 0.5) * spread;
    leaves.push(
      <g key={`l${i}`} transform={`translate(${x + Math.cos(a) * d} ${y + Math.sin(a) * d * 0.8}) rotate(${(a * 180) / Math.PI}) scale(${scale * (0.7 + rand() * 0.4)})`}>
        <path d={LEAF} fill={`url(#${gid}lf)`} stroke="#9c7c40" strokeWidth={0.5 / scale} />
        <path d="M0.06,0 L0.86,0" stroke="#f3e6c4" strokeWidth={0.5 / scale} />
      </g>,
    );
  }
  const spots: [number, number, number][] = [
    [0, 0, 0.62],
    [-0.75, 0.3, 0.42],
    [0.78, 0.25, 0.44],
    [-0.35, -0.55, 0.36],
    [0.42, -0.5, 0.34],
  ];
  spots.forEach(([dx, dy, s], i) =>
    roses.push(<CreamRose key={`r${i}`} x={x + dx * scale * spread} y={y + dy * scale} r={scale * s} rot={rand() * 60} gid={gid} />),
  );
  return (
    <g>
      {leaves}
      {roses}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Arch scene layers (shared 400 × 860 coordinate stage)               */
/* ------------------------------------------------------------------ */

export const STAGE_W = 400;
export const STAGE_H = 860;
const OPEN = "M52,860 L52,332 C52,216 140,150 200,116 C260,150 348,216 348,332 L348,860 Z";
const BAND = "M41,860 L41,330 C41,206 134,136 200,100 C266,136 359,206 359,330 L359,860";

function niche(x: number, y: number, w: number, h: number) {
  return `M${x},${y + h} L${x},${y + h * 0.42} C${x},${y + h * 0.18} ${x + w * 0.36},${y + h * 0.06} ${x + w / 2},${y} C${x + w * 0.64},${y + h * 0.06} ${x + w},${y + h * 0.18} ${x + w},${y + h * 0.42} L${x + w},${y + h}Z`;
}

/** Madrasah portal (pishtaq): tiled frame, deep central arch, two tiers of side niches. */
function Portal({ x, w, base, h, tone, rib }: { x: number; w: number; base: number; h: number; tone: string; rib: string }) {
  const ax = x + w * 0.24;
  const aw = w * 0.52;
  const top = base - h;
  const nw = w * 0.12;
  return (
    <g>
      <rect x={x - w * 0.5} y={top + h * 0.38} width={w * 2} height={h * 0.62} fill={tone} opacity="0.6" />
      <rect x={x} y={top} width={w} height={h} fill={tone} />
      <rect x={x} y={top} width={w} height="5" fill={rib} opacity="0.7" />
      <rect x={x + 4} y={top + 9} width={w - 8} height={h - 9} fill="none" stroke={rib} strokeWidth="1" />
      <path d={niche(ax, top + h * 0.16, aw, h * 0.84)} fill="#c99a52" opacity="0.32" />
      <path d={niche(ax + aw * 0.12, top + h * 0.26, aw * 0.76, h * 0.74)} fill="#c99a52" opacity="0.18" />
      {[x + w * 0.07, x + w - w * 0.07 - nw].map((nx) => (
        <g key={nx} fill="#c99a52" opacity="0.28">
          <path d={niche(nx, top + h * 0.2, nw, h * 0.3)} />
          <path d={niche(nx, top + h * 0.6, nw, h * 0.3)} />
        </g>
      ))}
    </g>
  );
}

function Minaret({ x, base, h, w, tone }: { x: number; base: number; h: number; w: number; tone: string }) {
  const top = base - h;
  return (
    <g fill={tone}>
      <path d={`M${x - w / 2},${base} L${x - w * 0.38},${top + 10} L${x + w * 0.38},${top + 10} L${x + w / 2},${base}Z`} />
      <rect x={x - w * 0.62} y={top + 4} width={w * 1.24} height={7} rx="1.5" />
      <path d={`M${x - w * 0.45},${top + 4} C${x - w * 0.45},${top - 6} ${x + w * 0.45},${top - 6} ${x + w * 0.45},${top + 4}Z`} />
    </g>
  );
}

function RibbedDome({ cx, base, r, drum, tone, rib }: { cx: number; base: number; r: number; drum: number; tone: string; rib: string }) {
  const dt = base - drum;
  const top = dt - r * 1.25;
  return (
    <g>
      <rect x={cx - r * 0.72} y={dt} width={r * 1.44} height={drum} fill={tone} />
      <path d={`M${cx - r * 0.82},${dt} C${cx - r * 1.02},${dt - r * 0.6} ${cx - r * 0.55},${top + r * 0.1} ${cx},${top} C${cx + r * 0.55},${top + r * 0.1} ${cx + r * 1.02},${dt - r * 0.6} ${cx + r * 0.82},${dt}Z`} fill={tone} />
      {[-0.6, -0.3, 0, 0.3, 0.6].map((k) => (
        <path key={k} d={`M${cx + k * r * 0.8},${dt} C${cx + k * r * 1.05},${dt - r * 0.6} ${cx + k * r * 0.5},${top + r * 0.2} ${cx},${top}`} fill="none" stroke={rib} strokeWidth="0.9" />
      ))}
      <path d={`M${cx},${top} L${cx},${top - r * 0.45}`} stroke={tone} strokeWidth="2" />
      <circle cx={cx} cy={top - r * 0.48} r="2.4" fill={tone} />
      <rect x={cx - r * 0.74} y={dt + drum * 0.18} width={r * 1.48} height="3" fill={rib} opacity="0.6" />
    </g>
  );
}

function Skyline({ base }: { base: number }) {
  const far = "#efd3a4";
  const mid = "#e2bb7c";
  const near = "#d7aa64";
  return (
    <g>
      <g opacity="0.55">
        <RibbedDome cx={92} base={base} r={20} drum={34} tone={far} rib="#f6e2bd" />
        <RibbedDome cx={308} base={base} r={20} drum={34} tone={far} rib="#f6e2bd" />
        <Minaret x={20} base={base} h={150} w={8} tone={far} />
        <Minaret x={380} base={base} h={150} w={8} tone={far} />
      </g>
      <g opacity="0.82">
        <RibbedDome cx={200} base={base} r={46} drum={92} tone={mid} rib="#f1d6a4" />
        <Portal x={70} w={84} base={base} h={128} tone={mid} rib="#f1d6a4" />
        <Portal x={246} w={84} base={base} h={128} tone={mid} rib="#f1d6a4" />
        <Minaret x={62} base={base} h={196} w={11} tone={mid} />
        <Minaret x={162} base={base} h={176} w={10} tone={mid} />
        <Minaret x={238} base={base} h={176} w={10} tone={mid} />
        <Minaret x={338} base={base} h={196} w={11} tone={mid} />
      </g>
      {[16, 40, 360, 384].map((x, i) => (
        <path
          key={x}
          d={`M${x},${base} C${x - 9},${base - 30} ${x - 6},${base - 66 - i * 4} ${x},${base - 86 - (i % 2) * 14} C${x + 6},${base - 66 - i * 4} ${x + 9},${base - 30} ${x},${base}Z`}
          fill={near}
          opacity="0.75"
        />
      ))}
    </g>
  );
}

/** The sky, skyline and reflecting pool seen through the arch. */
export const ArchSky = memo(function ArchSky({ className }: { className?: string }) {
  const id = clean(useId());
  const g = (n: string) => `${n}${id}`;
  const base = 606;
  return (
    <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d7a8" />
          <stop offset="0.45" stopColor="#fae6c4" />
          <stop offset="0.7" stopColor="#fff4de" />
          <stop offset="1" stopColor="#f4dcae" />
        </linearGradient>
        <radialGradient id={g("sun")} cx="0.5" cy="0.62" r="0.42">
          <stop offset="0" stopColor="#fffaea" />
          <stop offset="0.4" stopColor="#ffeec7" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffeec7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("pool")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbeacb" />
          <stop offset="1" stopColor="#ecd09c" />
        </linearGradient>
        <linearGradient id={g("mist")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff8ea" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff8ea" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("haze")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6e2" stopOpacity="0" />
          <stop offset="1" stopColor="#fff6e2" stopOpacity="0.55" />
        </linearGradient>
        <filter id={g("blur")}>
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <rect width={STAGE_W} height={STAGE_H} fill={`url(#${g("sky")})`} />
      <rect width={STAGE_W} height={STAGE_H} fill={`url(#${g("sun")})`} />
      <Skyline base={base} />
      <rect y={base - 150} width={STAGE_W} height="150" fill={`url(#${g("haze")})`} />
      <rect y={base} width={STAGE_W} height={STAGE_H - base} fill={`url(#${g("pool")})`} />
      <g transform={`translate(0 ${base * 2}) scale(1 -1)`} opacity="0.22" filter={`url(#${g("blur")})`}>
        <Skyline base={base} />
      </g>
      {[628, 646, 668, 694, 726].map((y, i) => (
        <line key={y} x1={150 - i * 22} x2={250 + i * 22} y1={y} y2={y} stroke="#fffaf0" strokeOpacity={0.5 - i * 0.07} strokeWidth="1" />
      ))}
      <rect y={base - 34} width={STAGE_W} height="64" fill={`url(#${g("mist")})`} />
      <path d={`M120,860 L196,${base + 6} M280,860 L204,${base + 6}`} stroke="#e9cf9e" strokeWidth="1.2" />
    </svg>
  );
});

/** Carved ganch frame around the arch opening, with gilded edge and roses. */
export const ArchFrame = memo(function ArchFrame({ className }: { className?: string }) {
  const id = clean(useId());
  const g = (n: string) => `${n}${id}`;
  const carve: ReactElement[] = [];
  const relief = "#fdf8ef";
  for (const sx of [1, -1]) {
    const X = (x: number) => (sx > 0 ? x : 400 - x);
    // a carved vine climbing the spandrel beside the arch, leaves alternating
    carve.push(
      <path
        key={`v${sx}`}
        d={`M${X(22)},336 C${X(26)},262 ${X(34)},206 ${X(60)},158 C${X(82)},118 ${X(112)},86 ${X(150)},58`}
        fill="none"
        stroke={relief}
        strokeWidth="2.2"
        strokeLinecap="round"
      />,
    );
    const along: [number, number, number][] = [
      [24, 300, -70],
      [28, 252, -60],
      [38, 206, -50],
      [56, 166, -40],
      [80, 128, -30],
      [108, 96, -24],
      [136, 70, -18],
    ];
    along.forEach(([x, y, a], i) => {
      const out = i % 2 ? 1 : -1;
      carve.push(
        <path
          key={`lf${sx}${i}`}
          d={LEAF}
          transform={`translate(${X(x)} ${y}) rotate(${sx > 0 ? a + out * 55 : 180 - a - out * 55}) scale(15)`}
          fill={relief}
          stroke="#efe3cc"
          strokeWidth={0.06}
        />,
      );
    });
    // rosette medallion in the open spandrel
    const rx = X(70);
    carve.push(
      <g key={`ro${sx}`} transform={`translate(${rx} 236)`} fill={relief} stroke="#efe3cc" strokeWidth="0.8">
        <circle r="21" fill="none" stroke={relief} strokeWidth="2" />
        {Array.from({ length: 8 }, (_, k) => (
          <path key={k} d="M0,-4 C5,-8 5,-15 0,-18 C-5,-15 -5,-8 0,-4Z" transform={`rotate(${k * 45})`} />
        ))}
        <circle r="3.4" />
      </g>,
    );
    // pillar: inset panel with a carved diamond lattice
    const px = sx > 0 ? 9 : 367;
    carve.push(<rect key={`pf${sx}`} x={px} y={372} width="24" height="476" rx="2" fill="none" stroke={relief} strokeWidth="1.6" />);
    for (let i = 0; i < 17; i++) {
      const cy = 390 + i * 27.5;
      carve.push(
        <g key={`pd${sx}${i}`} transform={`translate(${px + 12} ${cy})`} fill="none" stroke={relief} strokeWidth="1.5">
          <path d="M0,-12 L9,0 L0,12 L-9,0Z" />
          <circle r="2.4" fill={relief} />
        </g>,
      );
    }
  }
  // small drilled dots along the top band
  for (let i = 0; i < 9; i++) {
    const x = 24 + i * 44;
    if (x > 140 && x < 260) continue;
    carve.push(<circle key={`d${i}`} cx={x} cy="22" r="2" fill={relief} />);
  }

  return (
    <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g("ganch")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf5ea" />
          <stop offset="0.5" stopColor="#f3e8d4" />
          <stop offset="1" stopColor="#ead9bb" />
        </linearGradient>
        <linearGradient id={g("gild")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f6a2a" />
          <stop offset="0.4" stopColor="#e9cd86" />
          <stop offset="0.55" stopColor="#fff1c4" />
          <stop offset="0.8" stopColor="#bf9443" />
          <stop offset="1" stopColor="#8a6426" />
        </linearGradient>
        <filter id={g("relief")} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="b" />
          <feOffset in="b" dx="-1" dy="-1" result="hl" />
          <feOffset in="b" dx="1.2" dy="1.4" result="sh" />
          <feFlood floodColor="#ffffff" floodOpacity="0.95" />
          <feComposite in2="hl" operator="in" result="hlc" />
          <feFlood floodColor="#8a6738" floodOpacity="0.38" />
          <feComposite in2="sh" operator="in" result="shc" />
          <feMerge>
            <feMergeNode in="shc" />
            <feMergeNode in="hlc" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={g("depth")} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <clipPath id={g("open")}>
          <path d={OPEN} />
        </clipPath>
        <RoseDefs gid={g("r")} />
      </defs>
      {/* the thickness of the carved opening: a soft shadow just inside its edge */}
      <g clipPath={`url(#${g("open")})`}>
        <path d={OPEN} fill="none" stroke="#7d5a2a" strokeOpacity="0.4" strokeWidth="16" filter={`url(#${g("depth")})`} />
      </g>
      <path d={`M0,0 H${STAGE_W} V${STAGE_H} H0Z ${OPEN}`} fillRule="evenodd" fill={`url(#${g("ganch")})`} />
      <g filter={`url(#${g("relief")})`}>{carve}</g>
      <path d={BAND} fill="none" stroke={`url(#${g("gild")})`} strokeWidth="1.6" />
      <path d={BAND} fill="none" stroke={`url(#${g("gild")})`} strokeWidth="3" strokeDasharray="0.1 7.5" strokeLinecap="round" transform="translate(0 0)" opacity="0.9" />
      <path d={OPEN} fill="none" stroke={`url(#${g("gild")})`} strokeWidth="2.2" />
      <Bouquet x={200} y={70} scale={34} seed={3} gid={g("r")} spread={1.25} />
      <Bouquet x={30} y={812} scale={40} seed={5} gid={g("r")} />
      <Bouquet x={370} y={816} scale={40} seed={8} gid={g("r")} />
    </svg>
  );
});

/** Small pointed-arch outline used to frame sections (drawn in px to the box it sits in). */
export function archPath(w: number, h: number, inset: number) {
  const x0 = inset;
  const x1 = w - inset;
  const rise = Math.min(w * 0.34, h * 0.4);
  const spring = inset + rise;
  const mid = w / 2;
  const span = x1 - x0;
  // two arcs meeting in a point: the ravoq of Central Asian portals
  return `M${x0},${h - inset} L${x0},${spring} C${x0},${spring - rise * 0.6} ${mid - span * 0.14},${inset + rise * 0.22} ${mid},${inset} C${mid + span * 0.14},${inset + rise * 0.22} ${x1},${spring - rise * 0.6} ${x1},${spring} L${x1},${h - inset} Z`;
}
