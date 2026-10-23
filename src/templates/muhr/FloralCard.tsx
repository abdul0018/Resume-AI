import { memo, type ReactNode } from "react";

/*
 * The invitation card, drawn: cream stock under soft watercolour washes, a fine gold rule, and
 * impasto flowers — thick strokes of butter, white and blush paint with sage leaves and beaded gold
 * sprigs. Each petal is a flat shape lit by an SVG lighting filter: a blurred silhouette gives the
 * dome of the paint, stretched noise gives the brush ridges along the petal, a low light from the
 * upper left gives the relief. 600 × 1000 units (3:5); the type is laid out in muhr.css.
 */

export const FLORAL = { w: 600, h: 1000 };

/** Petals and leaves are drawn pointing up from a base at (0, 0), so the brush ridges run along them. */
const HEART = "M0,0 C-22,-18 -58,-60 -50,-104 C-44,-136 -12,-142 0,-118 C12,-142 44,-136 50,-104 C58,-60 22,-18 0,0Z";
/** Palette-knife strokes: curves from the petal's base out to points along its edge, bowing with the petal. */
function strokes(tips: [number, number][]) {
  return tips
    .map(([x, y]) => `M${(x * 0.04).toFixed(1)},-5 C${(x * 0.18).toFixed(1)},${(y * 0.38).toFixed(1)} ${(x * 0.82).toFixed(1)},${(y * 0.66).toFixed(1)} ${x},${y}`)
    .join(" ");
}
const HEART_TIPS: [number, number][] = [
  [-46, -96], [-42, -114], [-33, -127], [-21, -131], [-9, -124], [3, -121], [14, -129], [27, -131], [38, -122], [46, -106], [44, -82], [-44, -78],
];
const HEART_RIDGES = strokes(HEART_TIPS);
const HEART_GROOVES = strokes(HEART_TIPS.slice(0, -1).map(([x, y], i) => [(x + HEART_TIPS[i + 1][0]) / 2, (y + HEART_TIPS[i + 1][1]) / 2 + 6]));
const ROUND = "M0,0 C-30,-14 -44,-52 -32,-72 C-22,-88 -6,-84 0,-76 C6,-84 22,-88 32,-72 C44,-52 30,-14 0,0Z";
const ROUND_TIPS: [number, number][] = [
  [-34, -56], [-29, -70], [-18, -79], [-7, -75], [3, -74], [14, -80], [26, -74], [34, -58],
];
const ROUND_RIDGES = strokes(ROUND_TIPS);
const ROUND_GROOVES = strokes(ROUND_TIPS.slice(0, -1).map(([x, y], i) => [(x + ROUND_TIPS[i + 1][0]) / 2, (y + ROUND_TIPS[i + 1][1]) / 2 + 5]));
const LEAF = "M0,0 C-15,-30 -17,-84 0,-138 C17,-84 15,-30 0,0Z";

type Tint = { base: string; tip: string; rim: string; groove: string };
const BUTTER: Tint = { base: "#e6c977", tip: "#f6e6b2", rim: "#fdf5da", groove: "#c9a654" };
const IVORY: Tint = { base: "#e9e0d0", tip: "#fbf8f1", rim: "#ffffff", groove: "#cfc3ad" };
const BLUSH: Tint = { base: "#e6b2a5", tip: "#f6dbd2", rim: "#fdf0eb", groove: "#cf968a" };
const SAGE: Tint = { base: "#7f8e72", tip: "#b9c4a8", rim: "#d8dfcb", groove: "#6c7a60" };

let gid = 0;

function Paint({
  shape,
  ridges,
  grooves,
  tint,
  at,
  rotate,
  scale = 1,
  gold = false,
  opacity = 1,
}: {
  shape: string;
  ridges?: string;
  grooves?: string;
  tint: Tint;
  at: [number, number];
  rotate: number;
  scale?: number;
  gold?: boolean;
  opacity?: number;
}) {
  const id = `fc-t${gid++}`;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rotate}) scale(${scale})`} filter="url(#fc-impasto)" opacity={opacity}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={tint.base} />
          <stop offset="1" stopColor={tint.tip} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={shape} />
        </clipPath>
      </defs>
      <path d={shape} fill={`url(#${id})`} />
      {/* paint dragged along the petal, and the heavier ridge where the knife lifted at the edge */}
      <g clipPath={`url(#${id}-c)`}>
        {grooves && <path d={grooves} fill="none" stroke={tint.groove} strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />}
        {ridges && <path d={ridges} fill="none" stroke={tint.rim} strokeOpacity="0.62" strokeWidth="3.4" strokeLinecap="round" />}
        {/* the heavy lip of paint the knife leaves at the edge */}
        <path d={shape} fill="none" stroke={tint.rim} strokeOpacity="0.85" strokeWidth="9" />
        <path d={shape} fill="none" stroke={tint.groove} strokeOpacity="0.14" strokeWidth="1.6" transform="scale(0.86)" />
      </g>
      {gold && <path d={shape} fill="none" stroke="url(#fc-foil)" strokeWidth="1.3" strokeOpacity="0.85" />}
    </g>
  );
}

function Leaf({ at, rotate, scale = 1 }: { at: [number, number]; rotate: number; scale?: number }) {
  return (
    <g>
      <Paint shape={LEAF} tint={SAGE} at={at} rotate={rotate} scale={scale} />
      <path d="M0,-4 C1,-50 1,-90 0,-128" transform={`translate(${at[0]} ${at[1]}) rotate(${rotate}) scale(${scale})`} fill="none" stroke="#e6ebdc" strokeOpacity="0.7" strokeWidth="1.4" />
    </g>
  );
}

/** A fine gold stem with a few leaflets and beads, as the reference's sprigs. */
function Sprig({ d, beads, leaflets = [] }: { d: string; beads: [number, number, number][]; leaflets?: [number, number, number][] }) {
  return (
    <g>
      <path d={d} fill="none" stroke="url(#fc-foil)" strokeWidth="1.3" strokeLinecap="round" />
      {leaflets.map(([x, y, a]) => (
        <path key={`${x},${y}`} d="M0,0 C-3,-5 -3,-11 0,-15 C3,-11 3,-5 0,0Z" transform={`translate(${x} ${y}) rotate(${a})`} fill="url(#fc-foil)" />
      ))}
      {beads.map(([x, y, r]) => (
        <circle key={`${x},${y}`} cx={x} cy={y} r={r} fill="url(#fc-foil)" />
      ))}
    </g>
  );
}

function Wash({ children, opacity }: { children: ReactNode; opacity: number }) {
  return (
    <g filter="url(#fc-wash)" opacity={opacity}>
      {children}
    </g>
  );
}

export const FloralCard = memo(function FloralCard() {
  gid = 0;
  return (
    <svg className="mh-card-art" viewBox={`0 0 ${FLORAL.w} ${FLORAL.h}`} aria-hidden="true">
      <defs>
        <linearGradient id="fc-foil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="1000">
          <stop offset="0" stopColor="#a9802f" />
          <stop offset="0.22" stopColor="#e5c67c" />
          <stop offset="0.4" stopColor="#b88c3e" />
          <stop offset="0.6" stopColor="#f0d99a" />
          <stop offset="0.8" stopColor="#ad8236" />
          <stop offset="1" stopColor="#d9b866" />
        </linearGradient>
        <linearGradient id="fc-stock" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#fbf4ea" />
          <stop offset="1" stopColor="#f5ebdd" />
        </linearGradient>
        {/* watercolour: soft shapes pushed into ragged, bleeding edges */}
        <filter id="fc-wash" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="70" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="14" />
        </filter>
        {/* impasto: dome from the silhouette + brush ridges from stretched noise, lit from the upper left */}
        <filter id="fc-impasto" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.17 0.022" numOctaves="3" seed="4" result="noise" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="dome" />
          <feComposite in="noise" in2="dome" operator="arithmetic" k1="0" k2="0.8" k3="1" k4="0" result="height" />
          <feDiffuseLighting in="height" surfaceScale="3.8" diffuseConstant="1" lightingColor="#fffaf2" result="diffuse">
            <feDistantLight azimuth="225" elevation="56" />
          </feDiffuseLighting>
          <feSpecularLighting in="height" surfaceScale="3.8" specularConstant="0.62" specularExponent="11" lightingColor="#fffaf0" result="spec">
            <feDistantLight azimuth="225" elevation="46" />
          </feSpecularLighting>
          <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic" k1="0.42" k2="0.64" k3="0" k4="0" result="shaded" />
          <feComposite in="shaded" in2="SourceAlpha" operator="in" result="body" />
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="gloss" />
          <feComposite in="gloss" in2="body" operator="arithmetic" k1="0" k2="0.4" k3="1" k4="0" result="lit" />
          <feDropShadow in="lit" dx="2" dy="4" stdDeviation="6" floodColor="#9a7a50" floodOpacity="0.2" />
        </filter>
        <filter id="fc-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.33  0 0 0 0 0.2  0 0 0 0.07 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      <rect width={FLORAL.w} height={FLORAL.h} fill="url(#fc-stock)" />

      {/* washes: butter and peach behind the left stem, sage low on the left, blush in the lower right */}
      <Wash opacity={0.46}>
        <ellipse cx="70" cy="240" rx="120" ry="230" fill="#f2dcc0" />
        <ellipse cx="40" cy="560" rx="110" ry="220" fill="#d9dfc8" />
        <ellipse cx="150" cy="120" rx="110" ry="90" fill="#f3e2b0" />
        <ellipse cx="560" cy="780" rx="150" ry="170" fill="#f1d0c4" />
        <ellipse cx="90" cy="860" rx="140" ry="90" fill="#f0dcc8" />
      </Wash>
      <rect width={FLORAL.w} height={FLORAL.h} fill="#fff" filter="url(#fc-grain)" />

      <rect x="16" y="16" width="568" height="968" fill="none" stroke="url(#fc-foil)" strokeWidth="1.3" />

      <g transform="translate(-14 4) scale(0.84)">
      {/* the left stem, rising from the lower margin to the flower head */}
      <path d="M22,720 C60,600 90,470 118,360 C134,296 150,236 168,186" fill="none" stroke="url(#fc-foil)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M118,360 C150,330 170,318 196,312" fill="none" stroke="url(#fc-foil)" strokeWidth="1.6" strokeLinecap="round" />
      <Leaf at={[100, 452]} rotate={-14} scale={0.95} />
      <Leaf at={[70, 560]} rotate={-32} scale={0.85} />
      <Leaf at={[96, 548]} rotate={22} scale={0.7} />
      <Paint shape={HEART} ridges={HEART_RIDGES} grooves={HEART_GROOVES} tint={IVORY} at={[44, 690]} rotate={-58} scale={0.8} opacity={0.6} />

      <Sprig
        d="M168,190 C200,168 232,150 270,120"
        beads={[
          [272, 118, 3.2],
          [254, 128, 2.4],
          [240, 116, 2.6],
          [222, 150, 2.2],
          [262, 104, 2.2],
        ]}
        leaflets={[
          [214, 156, -60],
          [236, 140, -30],
        ]}
      />
      <Sprig
        d="M104,520 C140,500 170,488 206,470"
        beads={[
          [208, 468, 3],
          [192, 474, 2.2],
          [178, 466, 2.4],
          [196, 456, 2.2],
        ]}
        leaflets={[[160, 490, -50]]}
      />

      {/* the flower head: butter petals with gilt edges, an ivory one turned away, a blush one below */}
      <Paint shape={HEART} ridges={HEART_RIDGES} grooves={HEART_GROOVES} tint={IVORY} at={[150, 232]} rotate={-62} scale={0.95} />
      <Paint shape={HEART} ridges={HEART_RIDGES} grooves={HEART_GROOVES} tint={BUTTER} at={[162, 196]} rotate={-8} scale={1.08} gold />
      <Paint shape={HEART} ridges={HEART_RIDGES} grooves={HEART_GROOVES} tint={BUTTER} at={[168, 214]} rotate={52} scale={0.95} gold />
      <Paint shape={HEART} ridges={HEART_RIDGES} grooves={HEART_GROOVES} tint={BLUSH} at={[128, 330]} rotate={78} scale={0.92} gold />
      </g>

      {/* lower left: a second, paler stem rising from the corner */}
      <path d="M14,990 C40,906 62,842 92,770" fill="none" stroke="url(#fc-foil)" strokeWidth="1.8" strokeLinecap="round" />
      <Leaf at={[58, 880]} rotate={-28} scale={0.62} />
      <Leaf at={[74, 846]} rotate={30} scale={0.5} />
      <Paint shape={HEART} ridges={HEART_RIDGES} grooves={HEART_GROOVES} tint={IVORY} at={[92, 772]} rotate={18} scale={0.62} opacity={0.85} />
      <Paint shape={HEART} ridges={HEART_RIDGES} grooves={HEART_GROOVES} tint={BLUSH} at={[90, 778]} rotate={-42} scale={0.5} opacity={0.7} />
      <Sprig
        d="M36,930 C70,912 100,904 130,890"
        beads={[
          [132, 889, 2.6],
          [118, 894, 2],
          [106, 884, 2.2],
        ]}
        leaflets={[[90, 906, -60]]}
      />

      {/* lower right: an open blush flower with a gold heart, a sprig and two leaves */}
      <Sprig
        d="M486,986 C504,944 528,904 552,870"
        beads={[
          [554, 866, 3],
          [540, 876, 2.2],
          [564, 880, 2.4],
          [550, 854, 2.2],
        ]}
        leaflets={[
          [530, 902, -20],
          [514, 934, 30],
        ]}
      />
      <Leaf at={[498, 990]} rotate={-64} scale={0.55} />
      <Leaf at={[526, 996]} rotate={-26} scale={0.5} />
      {[0, 72, 144, 216, 288].map((a, i) => (
        <Paint key={a} shape={ROUND} ridges={ROUND_RIDGES} grooves={ROUND_GROOVES} tint={i % 2 ? IVORY : BLUSH} at={[566, 936]} rotate={a - 10} scale={0.92} />
      ))}
      <g fill="url(#fc-foil)">
        <circle cx="566" cy="936" r="9" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle key={a} cx={566 + Math.cos((a * Math.PI) / 180) * 15} cy={936 + Math.sin((a * Math.PI) / 180) * 15} r="2.4" />
        ))}
      </g>
    </svg>
  );
});
