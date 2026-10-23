import { memo } from "react";

/*
 * A satin bow drawn in SVG, knot centred at (200, 108) in a 400 × 300 box.
 * Colours come from --rb1 (deepest shadow) … --rb5 (specular highlight) on an ancestor.
 * Each loop shows its outer face, the darker inside of the ribbon through its opening,
 * a long specular streak and the pinch where it is gathered into the knot.
 */

const stop = (offset: number, v: number, opacity = 1) => <stop offset={offset} style={{ stopColor: `var(--rb${v})`, stopOpacity: opacity }} />;

function Loop({ id }: { id: (n: string) => string }) {
  return (
    <>
      <path
        d="M192,100 C160,66 108,24 64,26 C26,28 10,66 18,102 C26,136 66,152 112,146 C148,141 174,128 192,118 Z"
        fill={`url(#${id("loop")})`}
      />
      {/* the inside of the ribbon, seen through the loop */}
      <path
        d="M180,106 C154,84 112,56 78,58 C54,60 42,82 50,104 C58,124 92,130 122,124 C148,119 166,112 180,110 Z"
        fill={`url(#${id("inside")})`}
      />
      {/* the far edge of the opening catches light */}
      <path d="M176,107 C150,90 112,66 80,66 C62,67 52,80 54,96" fill="none" stroke="var(--rb5)" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
      {/* specular streak along the crown of the loop */}
      <path d="M186,98 C156,68 110,34 70,34 C44,35 28,56 26,80" fill="none" stroke="var(--rb5)" strokeOpacity="0.9" strokeWidth="5" strokeLinecap="round" />
      <path d="M182,96 C154,70 112,40 76,40" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      {/* the lower rim turning under */}
      <path d="M24,110 C38,138 78,150 118,142 C150,136 174,124 190,116" fill="none" stroke="var(--rb1)" strokeOpacity="0.55" strokeWidth="2.4" />
      {/* gathered folds at the pinch */}
      <path d="M192,100 C178,104 170,108 162,116 M192,118 C180,114 170,112 160,104" fill="none" stroke="var(--rb1)" strokeOpacity="0.4" strokeWidth="1.4" />
    </>
  );
}

function Tail({ id, d, crease }: { id: (n: string) => string; d: string; crease: string }) {
  return (
    <>
      <path d={d} fill={`url(#${id("tail")})`} />
      <path d={crease} fill="none" stroke="var(--rb5)" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export const SatinBow = memo(function SatinBow({ uid }: { uid: string }) {
  const id = (n: string) => `${n}-${uid}`;
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <linearGradient id={id("loop")} x1="0" y1="0" x2="0.35" y2="1">
          {stop(0, 4)}
          {stop(0.18, 5)}
          {stop(0.34, 2)}
          {stop(0.52, 3)}
          {stop(0.68, 5)}
          {stop(0.84, 4)}
          {stop(1, 1)}
        </linearGradient>
        <linearGradient id={id("inside")} x1="0" y1="0" x2="0" y2="1">
          {stop(0, 1)}
          {stop(0.55, 4)}
          {stop(1, 3)}
        </linearGradient>
        <linearGradient id={id("tail")} x1="0" y1="0" x2="1" y2="0.25">
          {stop(0, 1)}
          {stop(0.25, 4)}
          {stop(0.45, 5)}
          {stop(0.62, 2)}
          {stop(0.8, 4)}
          {stop(1, 1)}
        </linearGradient>
        <linearGradient id={id("knot")} x1="0" y1="0" x2="0" y2="1">
          {stop(0, 3)}
          {stop(0.3, 5)}
          {stop(0.55, 2)}
          {stop(0.8, 4)}
          {stop(1, 1)}
        </linearGradient>
      </defs>

      <g className="bw-tail-l">
        <Tail
          id={id}
          d="M190,116 C178,158 150,214 112,272 L136,264 L144,294 C172,238 198,176 208,120 Z"
          crease="M198,124 C186,166 164,214 136,258"
        />
      </g>
      <g className="bw-tail-r">
        <Tail
          id={id}
          d="M210,116 C224,160 254,212 294,266 L268,264 L262,294 C236,238 204,178 194,120 Z"
          crease="M204,126 C216,168 238,212 268,252"
        />
      </g>

      <g className="bw-loop-l">
        <Loop id={id} />
      </g>
      <g className="bw-loop-r">
        <g transform="matrix(-1 0 0 1 400 0)">
          <Loop id={id} />
        </g>
      </g>

      <g className="bw-knot">
        <path d="M181,92 C181,84 219,84 219,92 L222,124 C222,133 178,133 178,124 Z" fill={`url(#${id("knot")})`} />
        <path d="M187,90 C192,102 192,116 186,128 M213,90 C208,102 208,116 214,128" fill="none" stroke="var(--rb1)" strokeOpacity="0.45" strokeWidth="1.6" />
        <path d="M195,90 C197,100 197,112 194,124" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
});
