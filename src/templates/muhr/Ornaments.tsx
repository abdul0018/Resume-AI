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
      <g filter={`url(#${g("press")})`} fill={`url(#${g("gold")})`} fontFamily="Corinthia, 'Pinyon Script', cursive" textAnchor="middle">
        <text x="72" y="118" fontSize="64">
          {initials[0]}
        </text>
        <circle cx="100" cy="104" r="2.6" />
        <text x="128" y="118" fontSize="64">
          {initials[1]}
        </text>
      </g>
      {/* matte wax: a broad, soft sheen rather than a glossy spot */}
      <ellipse cx="80" cy="70" rx="46" ry="28" transform="rotate(-30 80 70)" fill="#fffaf0" opacity="0.22" filter={`url(#${g("soft")})`} />
      <circle cx="100" cy="100" r="66" fill="none" stroke="#a88650" strokeOpacity="0.35" strokeWidth="1" />
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

/** Two cream rose bouquets flanking a centre point (around the closing seal). */
export const RoseSpray = memo(function RoseSpray({ className }: { className?: string }) {
  const gid = `rs${clean(useId())}`;
  return (
    <svg viewBox="0 0 320 120" className={className} aria-hidden="true">
      <defs>
        <RoseDefs gid={gid} />
      </defs>
      <Bouquet x={74} y={64} scale={30} seed={12} gid={gid} spread={1.15} />
      <Bouquet x={246} y={64} scale={30} seed={21} gid={gid} spread={1.15} />
    </svg>
  );
});

/* ------------------------------------------------------------------ */
/* Arch scene layers (shared 400 × 860 coordinate stage)               */
/* ------------------------------------------------------------------ */

export const STAGE_W = 400;
export const STAGE_H = 860;

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
  const far = "#e6c690";
  const mid = "#d4a65f";
  const near = "#c4964f";
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

/* Arch geometry: the opening's edge sampled into points with outward normals. */
type Pt = { x: number; y: number; nx: number; ny: number };

function bez(p0: number, p1: number, p2: number, p3: number, t: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function archSamples(): Pt[] {
  const raw: { x: number; y: number }[] = [];
  for (let y = 860; y > 332; y -= 4) raw.push({ x: 52, y });
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    raw.push({ x: bez(52, 52, 140, 200, t), y: bez(332, 216, 150, 116, t) });
  }
  for (let i = 1; i <= 80; i++) {
    const t = i / 80;
    raw.push({ x: bez(200, 260, 348, 348, t), y: bez(116, 150, 216, 332, t) });
  }
  for (let y = 336; y <= 860; y += 4) raw.push({ x: 348, y });
  // resample at an even spacing along the edge
  const out: Pt[] = [];
  const step = 17;
  let acc = 0;
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1];
    const b = raw[i];
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    acc += d;
    if (acc >= step || i === 1) {
      acc = 0;
      const tx = (b.x - a.x) / (d || 1);
      const ty = (b.y - a.y) / (d || 1);
      out.push({ x: b.x, y: b.y, nx: ty, ny: -tx }); // walking up the left side, the outward normal points left
    }
  }
  return out;
}

const SAMPLES = archSamples();
const off = (p: Pt, d: number) => `${(p.x + p.nx * d).toFixed(1)},${(p.y + p.ny * d).toFixed(1)}`;

/** Cusped opening: small scallops between edge samples, bulging into the opening. */
const CUSPED = (() => {
  let d = `M${off(SAMPLES[0], 0)}`;
  for (let i = 1; i < SAMPLES.length; i++) {
    const a = SAMPLES[i - 1];
    const b = SAMPLES[i];
    const mx = (a.x + b.x) / 2 - ((a.nx + b.nx) / 2) * 5.5;
    const my = (a.y + b.y) / 2 - ((a.ny + b.ny) / 2) * 5.5;
    d += ` Q${mx.toFixed(1)},${my.toFixed(1)} ${off(b, 0)}`;
  }
  return `${d} Z`;
})();
const outline = (dist: number) => `M${SAMPLES.map((p) => off(p, dist)).join(" L")}`;

/** Y of the opening's edge at a given x on its curved head (for hanging lanterns). */
export function archEdgeY(x: number) {
  let best = SAMPLES[0];
  for (const p of SAMPLES) if (p.y < 332 && Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
  return best.y;
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
          <stop offset="0" stopColor="#efcf98" />
          <stop offset="0.42" stopColor="#f9e3bb" />
          <stop offset="0.68" stopColor="#fff1d6" />
          <stop offset="1" stopColor="#f1d6a2" />
        </linearGradient>
        <radialGradient id={g("sun")} cx="0.5" cy="0.6" r="0.46">
          <stop offset="0" stopColor="#fffbef" />
          <stop offset="0.3" stopColor="#ffefc8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffefc8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("disc")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="0.7" stopColor="#fff4d6" />
          <stop offset="1" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("pool")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9e5bf" />
          <stop offset="0.55" stopColor="#f1d6a2" />
          <stop offset="1" stopColor="#e6c487" />
        </linearGradient>
        <linearGradient id={g("haze")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff5df" stopOpacity="0" />
          <stop offset="0.62" stopColor="#fff5df" stopOpacity="0.62" />
          <stop offset="1" stopColor="#fff5df" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("fade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={g("reflect")}>
          <rect y={base} width={STAGE_W} height="190" fill={`url(#${g("fade")})`} />
        </mask>
        <filter id={g("blur")} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={g("ripple")} x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <rect width={STAGE_W} height={STAGE_H} fill={`url(#${g("sky")})`} />
      <rect width={STAGE_W} height={STAGE_H} fill={`url(#${g("sun")})`} />
      <circle cx="200" cy="500" r="58" fill={`url(#${g("disc")})`} />
      <Skyline base={base} />
      <rect y={base} width={STAGE_W} height={STAGE_H - base} fill={`url(#${g("pool")})`} />
      <g mask={`url(#${g("reflect")})`}>
        <g transform={`translate(0 ${base * 2}) scale(1 -1)`} opacity="0.32" filter={`url(#${g("blur")})`}>
          <circle cx="200" cy="500" r="58" fill={`url(#${g("disc")})`} />
          <Skyline base={base} />
        </g>
      </g>
      <g filter={`url(#${g("ripple")})`} fill="#fffaf0">
        {[
          [200, 640, 70, 0.5],
          [176, 662, 46, 0.35],
          [232, 676, 52, 0.3],
          [200, 704, 90, 0.22],
          [150, 734, 40, 0.18],
          [262, 748, 44, 0.16],
        ].map(([cx, cy, rx, o]) => (
          <ellipse key={`${cx}${cy}`} cx={cx} cy={cy} rx={rx} ry="1.4" opacity={o} />
        ))}
      </g>
      <rect y={base - 170} width={STAGE_W} height="260" fill={`url(#${g("haze")})`} />
    </svg>
  );
});

/** Carved ganch frame: a thick archivolt with a cusped inner edge, tone-on-tone relief, gilded lines and roses. */
export const ArchFrame = memo(function ArchFrame({ className }: { className?: string }) {
  const id = clean(useId());
  const g = (n: string) => `${n}${id}`;
  const relief = "#000";
  const carve: ReactElement[] = [];

  // archivolt: bead row, running line, diamond chain
  SAMPLES.forEach((p, i) => {
    carve.push(<circle key={`b${i}`} cx={p.x + p.nx * 10} cy={p.y + p.ny * 10} r="2.6" fill={relief} fillOpacity="0.5" />);
    if (i % 2 === 0) {
      const cx = p.x + p.nx * 22;
      const cy = p.y + p.ny * 22;
      const ang = (Math.atan2(p.ny, p.nx) * 180) / Math.PI;
      carve.push(
        <path key={`dm${i}`} d="M0,-5.5 L4,0 L0,5.5 L-4,0Z" transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${ang.toFixed(0)})`} fill={relief} fillOpacity="0.5" />,
      );
    }
  });
  carve.push(<path key="l1" d={outline(16)} fill="none" stroke={relief} strokeWidth="1.4" />);
  carve.push(<path key="l2" d={outline(28)} fill="none" stroke={relief} strokeWidth="1.4" />);

  for (const sx of [1, -1]) {
    const X = (x: number) => (sx > 0 ? x : 400 - x);
    // spandrel: a vine carved into the ganch, leaves alternating, rosette in the field
    carve.push(
      <path key={`v${sx}`} d={`M${X(12)},300 C${X(12)},240 ${X(18)},196 ${X(34)},160 C${X(52)},122 ${X(84)},88 ${X(124)},60`} fill="none" stroke={relief} strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />,
    );
    (
      [
        [13, 270, -80],
        [16, 228, -70],
        [24, 192, -60],
        [40, 152, -48],
        [62, 118, -38],
        [90, 88, -30],
      ] as const
    ).forEach(([x, y, a], i) => {
      const out = i % 2 ? 1 : -1;
      carve.push(
        <path key={`lf${sx}${i}`} d={LEAF} transform={`translate(${X(x)} ${y}) rotate(${sx > 0 ? a + out * 55 : 180 - a - out * 55}) scale(13)`} fill={relief} fillOpacity="0.5" stroke={relief} strokeWidth={0.07} />,
      );
    });
    carve.push(
      <g key={`ro${sx}`} transform={`translate(${X(34)} 92)`} fill={relief} fillOpacity="0.5" stroke={relief} strokeWidth="0.9">
        <circle r="17" fill="none" strokeWidth="1.6" />
        {Array.from({ length: 8 }, (_, k) => (
          <path key={k} d="M0,-3.5 C4,-7 4,-12 0,-14.5 C-4,-12 -4,-7 0,-3.5Z" transform={`rotate(${k * 45})`} />
        ))}
        <circle r="2.8" />
      </g>,
    );
    // pillar: inset panel with a carved diamond lattice
    const px = sx > 0 ? 3 : 373;
    carve.push(<rect key={`pf${sx}`} x={px} y={384} width="22" height="466" rx="2" fill="none" stroke={relief} strokeWidth="1.4" />);
    for (let i = 0; i < 17; i++) {
      carve.push(
        <g key={`pd${sx}${i}`} transform={`translate(${px + 11} ${400 + i * 27})`} fill="none" stroke={relief} strokeWidth="1.4">
          <path d="M0,-11 L8,0 L0,11 L-8,0Z" />
          <circle r="2.2" fill={relief} fillOpacity="0.5" />
        </g>,
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g("ganch")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf5ea" />
          <stop offset="0.5" stopColor="#f3e8d4" />
          <stop offset="1" stopColor="#ebdbbf" />
        </linearGradient>
        <linearGradient id={g("gild")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f6a2a" />
          <stop offset="0.4" stopColor="#e9cd86" />
          <stop offset="0.55" stopColor="#fff1c4" />
          <stop offset="0.8" stopColor="#bf9443" />
          <stop offset="1" stopColor="#8a6426" />
        </linearGradient>
        <filter id={g("relief")} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="b" />
          <feOffset in="b" dx="1.2" dy="1.4" result="o" />
          <feComposite in="b" in2="o" operator="arithmetic" k2="1" k3="-1" result="hl" />
          <feComposite in="o" in2="b" operator="arithmetic" k2="1" k3="-1" result="sh" />
          <feFlood floodColor="#ffffff" floodOpacity="1" />
          <feComposite in2="hl" operator="in" result="hlc" />
          <feFlood floodColor="#7d5a2c" floodOpacity="0.6" />
          <feComposite in2="sh" operator="in" result="shc" />
          <feMerge>
            <feMergeNode in="shc" />
            <feMergeNode in="hlc" />
          </feMerge>
        </filter>
        <filter id={g("depth")} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <clipPath id={g("open")}>
          <path d={CUSPED} />
        </clipPath>
        <RoseDefs gid={g("r")} />
      </defs>
      {/* the depth of the carved opening: a soft shadow just inside its edge */}
      <g clipPath={`url(#${g("open")})`}>
        <path d={CUSPED} fill="none" stroke="#7d5a2a" strokeOpacity="0.38" strokeWidth="16" filter={`url(#${g("depth")})`} />
      </g>
      <path d={`M0,0 H${STAGE_W} V${STAGE_H} H0Z ${CUSPED}`} fillRule="evenodd" fill={`url(#${g("ganch")})`} />
      <g filter={`url(#${g("relief")})`}>{carve}</g>
      <path d={CUSPED} fill="none" stroke={`url(#${g("gild")})`} strokeWidth="1.6" />
      <path d={outline(33)} fill="none" stroke={`url(#${g("gild")})`} strokeWidth="1.8" />
      <Bouquet x={200} y={64} scale={32} seed={3} gid={g("r")} spread={1.25} />
      <Bouquet x={28} y={812} scale={40} seed={5} gid={g("r")} />
      <Bouquet x={372} y={816} scale={40} seed={8} gid={g("r")} />
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
