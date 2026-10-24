import { memo, type ReactElement } from "react";
import type { TemplateId } from "@shared/schema";

/**
 * Procedural, resolution-independent artwork for the inner card of each template.
 * All drawings share a 400×600 viewBox; `PANELS` describes the calm area where text sits.
 */

export const PANELS: Record<TemplateId, { x0: number; y0: number; x1: number; y1: number }> = {
  rishton: { x0: 78, y0: 112, x1: 322, y1: 488 },
  zumrad: { x0: 74, y0: 120, x1: 326, y1: 500 },
  atlas: { x0: 84, y0: 92, x1: 316, y1: 508 },
  suzani: { x0: 80, y0: 108, x1: 320, y1: 492 },
  oqoltin: { x0: 96, y0: 132, x1: 304, y1: 512 },
  samarqand: { x0: 96, y0: 132, x1: 304, y1: 512 },
};

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ns = (s: string) => s; // marker for ids, keeps them greppable

/* ================================================================== */
/* Rishton — cobalt chinoiserie florals on porcelain                   */
/* ================================================================== */

const PETAL = "M0,0 C-0.42,-0.16 -0.58,-0.78 -0.24,-0.98 C-0.09,-1.06 0.09,-1.06 0.24,-0.98 C0.58,-0.78 0.42,-0.16 0,0Z";
const LEAF = "M0,0 C0.24,-0.34 0.68,-0.38 1,0 C0.68,0.38 0.24,0.34 0,0Z";

function Peony({ x, y, r, rot }: { x: number; y: number; r: number; rot: number }) {
  const ring = (n: number, scale: number, fill: string, offset: number) =>
    Array.from({ length: n }, (_, i) => (
      <path key={`${n}-${i}`} d={PETAL} fill={fill} transform={`rotate(${(360 / n) * i + offset}) scale(${scale})`} />
    ));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`} stroke="#18306b" strokeWidth={0.7 / r}>
      {ring(9, 1, "url(#rs-p1)", 0)}
      {ring(7, 0.74, "url(#rs-p2)", 12)}
      {ring(6, 0.5, "url(#rs-p3)", 30)}
      <circle r={0.2} fill="#1b3375" />
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} r={0.035} cx={Math.cos(i) * 0.12} cy={Math.sin(i) * 0.12} fill="#e6ecf8" stroke="none" />
      ))}
    </g>
  );
}

function Rose({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r})`} stroke="#18306b" strokeWidth={0.6 / r}>
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={PETAL} fill="url(#rs-p2)" transform={`rotate(${i * 60}) scale(1)`} />
      ))}
      <circle r={0.55} fill="url(#rs-p3)" />
      <path d="M-0.35,0.05 C-0.3,-0.35 0.3,-0.4 0.38,0 M-0.2,0.15 C-0.15,-0.15 0.18,-0.18 0.22,0.1" fill="none" stroke="#e7edf9" />
      <circle r={0.12} fill="#1b3375" />
    </g>
  );
}

function Leaf({ x, y, s, rot }: { x: number; y: number; s: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={LEAF} fill="url(#rs-leaf)" stroke="#16295c" strokeWidth={0.5 / s} />
      <path d="M0.04,0 L0.9,0" stroke="#dce4f5" strokeWidth={0.6 / s} />
    </g>
  );
}

function Bud({ x, y, s, rot }: { x: number; y: number; s: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke="#18306b" strokeWidth={0.5 / s}>
      <path d="M0,0 C-0.5,-0.4 -0.4,-1.1 0,-1.3 C0.4,-1.1 0.5,-0.4 0,0Z" fill="url(#rs-p2)" />
      <path d="M0,0 C-0.5,-0.1 -0.6,-0.5 -0.45,-0.7 M0,0 C0.5,-0.1 0.6,-0.5 0.45,-0.7" fill="none" stroke="#1d3a85" />
    </g>
  );
}

function rishtonArt() {
  const rand = rng(7);
  const leaves: ReactElement[] = [];
  const flowers: ReactElement[] = [];
  const stems: ReactElement[] = [];
  const P = PANELS.rishton;
  const inPanel = (x: number, y: number, pad = 10) => x > P.x0 - pad && x < P.x1 + pad && y > P.y0 - pad && y < P.y1 + pad;

  const clusters: [number, number, number][] = [
    [36, 46, 48],
    [364, 42, 44],
    [32, 556, 46],
    [366, 552, 50],
    [26, 300, 32],
    [376, 292, 30],
    [200, 40, 30],
    [206, 562, 32],
    [116, 26, 20],
    [292, 30, 22],
    [110, 574, 22],
    [298, 576, 20],
    [22, 174, 22],
    [378, 420, 24],
    [24, 428, 20],
    [376, 168, 20],
  ];

  // Stems along the frame
  const stemPaths = [
    "M20,70 C30,160 10,220 26,300 C40,380 12,450 28,540",
    "M380,66 C368,150 392,230 374,292 C356,370 390,450 372,540",
    "M60,24 C110,44 150,16 200,30 C250,46 300,14 350,30",
    "M56,578 C110,560 160,586 206,570 C260,556 300,586 352,570",
  ];
  stemPaths.forEach((d, i) =>
    stems.push(<path key={`s${i}`} d={d} fill="none" stroke="#1d3a85" strokeWidth={1.2} strokeLinecap="round" opacity={0.85} />),
  );

  // Leaves hugging each cluster
  clusters.forEach(([cx, cy, r], ci) => {
    const n = 6 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 0.6;
      const d = r * (0.7 + rand() * 0.35);
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d;
      leaves.push(<Leaf key={`cl${ci}-${i}`} x={x} y={y} s={r * (0.55 + rand() * 0.35)} rot={(a * 180) / Math.PI + (rand() - 0.5) * 40} />);
    }
  });

  // Scattered fillers along the band
  for (let i = 0; i < 120; i++) {
    const side = i % 4;
    let x = 0;
    let y = 0;
    if (side === 0) [x, y] = [8 + rand() * 64, 70 + rand() * 460];
    if (side === 1) [x, y] = [328 + rand() * 64, 70 + rand() * 460];
    if (side === 2) [x, y] = [60 + rand() * 280, 6 + rand() * 96];
    if (side === 3) [x, y] = [60 + rand() * 280, 498 + rand() * 96];
    if (inPanel(x, y)) continue;
    const pick = rand();
    if (pick < 0.62) leaves.push(<Leaf key={`f${i}`} x={x} y={y} s={12 + rand() * 12} rot={rand() * 360} />);
    else if (pick < 0.82) flowers.push(<Bud key={`b${i}`} x={x} y={y} s={7 + rand() * 4} rot={rand() * 360} />);
    else if (pick < 0.94) flowers.push(<Rose key={`r${i}`} x={x} y={y} r={8 + rand() * 6} />);
    else
      flowers.push(
        <g key={`d${i}`} fill="#1d3a85">
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={x + Math.cos(k * 2.1) * 4} cy={y + Math.sin(k * 2.1) * 4} r={1.8} />
          ))}
        </g>,
      );
  }

  clusters.forEach(([cx, cy, r], ci) => {
    flowers.push(<Peony key={`p${ci}`} x={cx} y={cy} r={r} rot={rand() * 60} />);
    if (r > 30) {
      const a = rand() * Math.PI * 2;
      flowers.push(<Rose key={`pr${ci}`} x={cx + Math.cos(a) * r * 1.05} y={cy + Math.sin(a) * r * 1.05} r={r * 0.42} />);
    }
  });

  return (
    <>
      <defs>
        <linearGradient id={ns("rs-p1")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3b5db0" />
          <stop offset="0.55" stopColor="#a9bce6" />
          <stop offset="1" stopColor="#f3f6fc" />
        </linearGradient>
        <linearGradient id={ns("rs-p2")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#223f8d" />
          <stop offset="0.6" stopColor="#7590d0" />
          <stop offset="1" stopColor="#dfe7f7" />
        </linearGradient>
        <linearGradient id={ns("rs-p3")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#152e70" />
          <stop offset="1" stopColor="#4c6cbd" />
        </linearGradient>
        <linearGradient id={ns("rs-leaf")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a3274" />
          <stop offset="1" stopColor="#4f6fbf" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="#fbf9f4" />
      {stems}
      {leaves}
      {flowers}
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill="#fdfcf9" stroke="#2b4c9e" strokeWidth={1.1} />
      <rect x={P.x0 + 6} y={P.y0 + 6} width={P.x1 - P.x0 - 12} height={P.y1 - P.y0 - 12} fill="none" stroke="#2b4c9e" strokeWidth={0.5} />
      {[
        [P.x0 + 6, P.y0 + 6],
        [P.x1 - 6, P.y0 + 6],
        [P.x0 + 6, P.y1 - 6],
        [P.x1 - 6, P.y1 - 6],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x - 3},${y} L${x},${y - 3} L${x + 3},${y} L${x},${y + 3}Z`} fill="#2b4c9e" />
      ))}
    </>
  );
}

/* ================================================================== */
/* Zumrad — emerald band with gold girih                               */
/* ================================================================== */

function starPoints(cx: number, cy: number, R: number, r: number, n = 8) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`;
  }).join(" ");
}

function archPath(x0: number, x1: number, spring: number, apex: number, bottom: number) {
  const mid = (x0 + x1) / 2;
  const w = x1 - x0;
  return `M${x0},${bottom} L${x0},${spring} C${x0},${spring - (spring - apex) * 0.55} ${mid - w * 0.22},${apex + (spring - apex) * 0.12} ${mid},${apex} C${mid + w * 0.22},${apex + (spring - apex) * 0.12} ${x1},${spring - (spring - apex) * 0.55} ${x1},${spring} L${x1},${bottom} Z`;
}

function GirihDefs({ id, color, opacity }: { id: string; color: string; opacity: number }) {
  return (
    <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
      <g fill="none" stroke={color} strokeWidth={0.7} opacity={opacity}>
        <polygon points={starPoints(20, 20, 13, 7)} />
        <polygon points={starPoints(20, 20, 6, 3.4)} />
        <path d="M0,0 L7,7 M40,0 L33,7 M0,40 L7,33 M40,40 L33,33 M20,0 L20,7 M20,40 L20,33 M0,20 L7,20 M40,20 L33,20" />
        <polygon points={starPoints(0, 0, 6, 3.4)} />
        <polygon points={starPoints(40, 0, 6, 3.4)} />
        <polygon points={starPoints(0, 40, 6, 3.4)} />
        <polygon points={starPoints(40, 40, 6, 3.4)} />
      </g>
    </pattern>
  );
}

function zumradArt() {
  const P = PANELS.zumrad;
  const arch = archPath(P.x0, P.x1, P.y0 + 90, P.y0 - 8, P.y1);
  const inner = archPath(P.x0 + 8, P.x1 - 8, P.y0 + 94, P.y0 + 2, P.y1 - 8);
  return (
    <>
      <defs>
        <GirihDefs id="zm-girih" color="#d4b46a" opacity={0.8} />
        <radialGradient id="zm-bg" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#14594a" />
          <stop offset="1" stopColor="#0a3529" />
        </radialGradient>
        <linearGradient id="zm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8833a" />
          <stop offset="0.45" stopColor="#f1dc9e" />
          <stop offset="1" stopColor="#a8833a" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#zm-bg)" />
      <rect width="400" height="600" fill="url(#zm-girih)" />
      <rect x="12" y="12" width="376" height="576" fill="none" stroke="url(#zm-gold)" strokeWidth={1.4} />
      <rect x="18" y="18" width="364" height="564" fill="none" stroke="url(#zm-gold)" strokeWidth={0.5} />
      <path d={arch} fill="#f7f1e3" stroke="url(#zm-gold)" strokeWidth={2} />
      <path d={inner} fill="none" stroke="#b08d45" strokeWidth={0.6} />
      <polygon points={starPoints(200, P.y0 - 26, 11, 5)} fill="url(#zm-gold)" />
      <polygon points={starPoints(200, P.y1 + 26, 7, 3.2)} fill="url(#zm-gold)" />
    </>
  );
}

/* ================================================================== */
/* Atlas — Margilan ikat bands with feathered edges                    */
/* ================================================================== */

function IkatColumn({ x, w, seed }: { x: number; w: number; seed: number }) {
  const rand = rng(seed);
  const colors = ["#b0475e", "#2f3f7a", "#d4a64a", "#3e7a64", "#7a2c46"];
  const items: ReactElement[] = [];
  const cx = x + w / 2;
  for (let y = -20, i = 0; y < 640; y += 64, i++) {
    const c1 = colors[(i + seed) % colors.length];
    const c2 = colors[(i + seed + 2) % colors.length];
    const c3 = colors[(i + seed + 1) % colors.length];
    const hw = w * (0.42 + rand() * 0.06);
    items.push(
      <g key={y}>
        <path d={`M${cx},${y} L${cx + hw},${y + 32} L${cx},${y + 64} L${cx - hw},${y + 32}Z`} fill={c1} />
        <path d={`M${cx},${y + 12} L${cx + hw * 0.6},${y + 32} L${cx},${y + 52} L${cx - hw * 0.6},${y + 32}Z`} fill="#f6efe4" />
        <path d={`M${cx},${y + 20} L${cx + hw * 0.36},${y + 32} L${cx},${y + 44} L${cx - hw * 0.36},${y + 32}Z`} fill={c2} />
        <rect x={cx - 2.5} y={y + 29} width={5} height={6} fill={c3} />
        <path d={`M${x},${y + 28} L${x + w * 0.12},${y + 32} L${x},${y + 36}Z M${x + w},${y + 28} L${x + w * 0.88},${y + 32} L${x + w},${y + 36}Z`} fill={c3} />
      </g>,
    );
  }
  return <g>{items}</g>;
}

function atlasArt() {
  const P = PANELS.atlas;
  return (
    <>
      <defs>
        <filter id="at-ikat" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves={2} seed={4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="at-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="#f6efe4" />
      <g filter="url(#at-ikat)">
        <IkatColumn x={-6} w={42} seed={1} />
        <rect x={36} y={0} width={4} height={600} fill="#2f3f7a" />
        <IkatColumn x={40} w={34} seed={3} />
        <rect x={74} y={0} width={2} height={600} fill="#d4a64a" />
        <IkatColumn x={326} w={34} seed={4} />
        <rect x={360} y={0} width={4} height={600} fill="#2f3f7a" />
        <rect x={324} y={0} width={2} height={600} fill="#d4a64a" />
        <IkatColumn x={364} w={42} seed={2} />
      </g>
      <rect x={0} y={0} width={80} height={600} fill="url(#at-sheen)" />
      <rect x={320} y={0} width={80} height={600} fill="url(#at-sheen)" />
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill="#fdfaf5" stroke="#b0475e" strokeWidth={0.9} />
      <rect x={P.x0 + 5} y={P.y0 + 5} width={P.x1 - P.x0 - 10} height={P.y1 - P.y0 - 10} fill="none" stroke="#d4a64a" strokeWidth={0.5} />
      {[P.y0, P.y1].map((y) => (
        <g key={y} transform={`translate(200 ${y})`}>
          <path d="M0,-9 L9,0 L0,9 L-9,0Z" fill="#b0475e" />
          <path d="M0,-4 L4,0 L0,4 L-4,0Z" fill="#f6efe4" />
        </g>
      ))}
    </>
  );
}

/* ================================================================== */
/* Suzani — embroidered rosettes and vines on linen                    */
/* ================================================================== */

function Rosette({ x, y, r, seed }: { x: number; y: number; r: number; seed: number }) {
  const petals = 12;
  const pal = seed % 2 ? ["#a8452f", "#6b1f24", "#2f3f6a", "#c98a3a"] : ["#7c1d2a", "#a8452f", "#2f3f6a", "#c98a3a"];
  return (
    <g transform={`translate(${x} ${y}) scale(${r})`}>
      {Array.from({ length: petals }, (_, i) => (
        <path key={i} d="M0,-0.55 C-0.2,-0.7 -0.16,-0.98 0,-1 C0.16,-0.98 0.2,-0.7 0,-0.55Z" fill={pal[0]} transform={`rotate(${(360 / petals) * i})`} />
      ))}
      <circle r={0.6} fill={pal[1]} />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} r={0.04} cx={Math.cos((i / 16) * Math.PI * 2) * 0.5} cy={Math.sin((i / 16) * Math.PI * 2) * 0.5} fill="#f5eddf" />
      ))}
      <circle r={0.4} fill={pal[2]} />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} rx={0.08} ry={0.2} cy={-0.18} fill={pal[0]} transform={`rotate(${i * 60})`} />
      ))}
      <circle r={0.08} fill={pal[3]} />
    </g>
  );
}

function suzaniArt() {
  const P = PANELS.suzani;
  const rand = rng(11);
  const small: ReactElement[] = [];
  const vines = [
    "M40,90 C70,150 18,210 44,280 C70,350 18,420 44,510",
    "M360,90 C330,150 382,210 356,280 C330,350 382,420 356,510",
    "M90,40 C150,64 170,20 200,46 C230,72 260,22 310,40",
    "M90,560 C150,536 170,580 200,554 C230,528 260,578 310,560",
  ];
  for (let i = 0; i < 46; i++) {
    const side = i % 4;
    let x = 0;
    let y = 0;
    if (side === 0) [x, y] = [14 + rand() * 54, 96 + rand() * 408];
    if (side === 1) [x, y] = [332 + rand() * 54, 96 + rand() * 408];
    if (side === 2) [x, y] = [92 + rand() * 216, 10 + rand() * 84];
    if (side === 3) [x, y] = [92 + rand() * 216, 506 + rand() * 84];
    if (rand() < 0.55) {
      small.push(
        <path
          key={i}
          d={LEAF}
          fill="#5b7342"
          transform={`translate(${x} ${y}) rotate(${rand() * 360}) scale(${10 + rand() * 6})`}
        />,
      );
    } else {
      const c = ["#c56a3b", "#2f3f6a", "#a8452f", "#c98a3a"][Math.floor(rand() * 4)];
      small.push(
        <g key={i} transform={`translate(${x} ${y}) scale(${5 + rand() * 3})`}>
          {Array.from({ length: 5 }, (_, k) => (
            <circle key={k} r={0.42} cx={Math.cos((k / 5) * Math.PI * 2) * 0.55} cy={Math.sin((k / 5) * Math.PI * 2) * 0.55} fill={c} />
          ))}
          <circle r={0.32} fill="#f0d9a8" />
        </g>,
      );
    }
  }
  return (
    <>
      <defs>
        <pattern id="sz-linen" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0,0.5 H4 M0.5,0 V4" stroke="#d8c8ac" strokeWidth={0.35} opacity={0.6} />
        </pattern>
      </defs>
      <rect width="400" height="600" fill="#f5eddf" />
      <rect width="400" height="600" fill="url(#sz-linen)" />
      {vines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#5b7342" strokeWidth={2} strokeLinecap="round" strokeDasharray="5 2.5" />
      ))}
      {small}
      <Rosette x={30} y={36} r={52} seed={1} />
      <Rosette x={370} y={36} r={52} seed={2} />
      <Rosette x={30} y={564} r={52} seed={2} />
      <Rosette x={370} y={564} r={52} seed={1} />
      <Rosette x={22} y={300} r={30} seed={3} />
      <Rosette x={378} y={300} r={30} seed={4} />
      <Rosette x={200} y={26} r={24} seed={5} />
      <Rosette x={200} y={574} r={24} seed={6} />
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill="#faf5ea" stroke="#7c1d2a" strokeWidth={1.2} />
      <rect
        x={P.x0 + 5}
        y={P.y0 + 5}
        width={P.x1 - P.x0 - 10}
        height={P.y1 - P.y0 - 10}
        fill="none"
        stroke="#a8452f"
        strokeWidth={0.6}
        strokeDasharray="3 2"
      />
    </>
  );
}

/* ================================================================== */
/* Oq oltin — white paper, single gold arch                            */
/* ================================================================== */

function oqoltinArt() {
  const P = PANELS.oqoltin;
  const outer = archPath(P.x0 - 10, P.x1 + 10, P.y0 + 92, P.y0 - 44, P.y1 + 10);
  const inner = archPath(P.x0 - 4, P.x1 + 4, P.y0 + 96, P.y0 - 34, P.y1 + 4);
  return (
    <>
      <defs>
        <linearGradient id="oq-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9c7a35" />
          <stop offset="0.5" stopColor="#e8d29a" />
          <stop offset="1" stopColor="#9c7a35" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="#ffffff" />
      <rect x="18" y="18" width="364" height="564" fill="none" stroke="url(#oq-gold)" strokeWidth={0.9} />
      <rect x="24" y="24" width="352" height="552" fill="none" stroke="url(#oq-gold)" strokeWidth={0.4} />
      <path d={outer} fill="none" stroke="url(#oq-gold)" strokeWidth={1.3} />
      <path d={inner} fill="none" stroke="url(#oq-gold)" strokeWidth={0.5} />
      <polygon points={starPoints(200, P.y0 - 66, 9, 4)} fill="url(#oq-gold)" />
      <line x1={P.x0 - 30} x2={P.x1 + 30} y1={P.y1 + 10} y2={P.y1 + 10} stroke="url(#oq-gold)" strokeWidth={1.3} />
      {[
        [18, 18],
        [382, 18],
        [18, 582],
        [382, 582],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x - 4},${y} L${x},${y - 4} L${x + 4},${y} L${x},${y + 4}Z`} fill="url(#oq-gold)" />
      ))}
    </>
  );
}

/* ================================================================== */
/* Samarqand tuni — midnight sky, gold arch with girih lining          */
/* ================================================================== */

function samarqandArt() {
  const P = PANELS.samarqand;
  const rand = rng(23);
  const outer = archPath(P.x0 - 14, P.x1 + 14, P.y0 + 92, P.y0 - 52, P.y1 + 14);
  const inner = archPath(P.x0 - 2, P.x1 + 2, P.y0 + 98, P.y0 - 34, P.y1 + 2);
  const stars = Array.from({ length: 70 }, (_, i) => {
    const x = rand() * 400;
    const y = rand() * 600;
    const r = rand() < 0.1 ? 1.6 : 0.5 + rand() * 0.8;
    return <circle key={i} cx={x} cy={y} r={r} fill={rand() < 0.5 ? "#f1e3bb" : "#d2b265"} opacity={0.25 + rand() * 0.6} />;
  });
  return (
    <>
      <defs>
        <radialGradient id="sm-sky" cx="0.5" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#26365a" />
          <stop offset="1" stopColor="#0e1528" />
        </radialGradient>
        <linearGradient id="sm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9c7a35" />
          <stop offset="0.5" stopColor="#f0dca2" />
          <stop offset="1" stopColor="#9c7a35" />
        </linearGradient>
        <GirihDefs id="sm-girih" color="#d2b265" opacity={0.55} />
        <clipPath id="sm-band">
          <path d={outer} />
        </clipPath>
      </defs>
      <rect width="400" height="600" fill="url(#sm-sky)" />
      {stars}
      <g clipPath="url(#sm-band)">
        <rect width="400" height="600" fill="url(#sm-girih)" />
      </g>
      <path d={inner} fill="#16203a" stroke="url(#sm-gold)" strokeWidth={1.2} />
      <path d={outer} fill="none" stroke="url(#sm-gold)" strokeWidth={1.4} />
      <polygon points={starPoints(200, P.y0 - 74, 9, 4)} fill="url(#sm-gold)" />
      <rect x="16" y="16" width="368" height="568" fill="none" stroke="url(#sm-gold)" strokeWidth={0.6} opacity={0.7} />
    </>
  );
}

const ART: Record<TemplateId, () => ReactElement> = {
  rishton: rishtonArt,
  zumrad: zumradArt,
  atlas: atlasArt,
  suzani: suzaniArt,
  oqoltin: oqoltinArt,
  samarqand: samarqandArt,
};

const cache = new Map<TemplateId, ReactElement>();

export const Artwork = memo(function Artwork({ template, className }: { template: TemplateId; className?: string }) {
  let art = cache.get(template);
  if (!art) {
    art = ART[template]();
    cache.set(template, art);
  }
  return (
    <svg className={className} viewBox="0 0 400 600" preserveAspectRatio="none" aria-hidden="true">
      {art}
    </svg>
  );
});

export function panelStyle(template: TemplateId) {
  const p = PANELS[template];
  return {
    left: `${(p.x0 / 400) * 100}%`,
    top: `${(p.y0 / 600) * 100}%`,
    width: `${((p.x1 - p.x0) / 400) * 100}%`,
    height: `${((p.y1 - p.y0) / 600) * 100}%`,
  };
}
