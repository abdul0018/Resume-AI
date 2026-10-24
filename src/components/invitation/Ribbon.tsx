import { memo } from "react";

/** Satin bow drawn in SVG; colors come from --rb1..--rb5 on the card. */
export const Bow = memo(function Bow({ uid }: { uid: string }) {
  const g = (name: string) => `${name}-${uid}`;
  const stop = (offset: number, v: number) => <stop offset={offset} style={{ stopColor: `var(--rb${v})` }} />;
  return (
    <svg className="gf-bow" viewBox="0 0 400 280" aria-hidden="true">
      <defs>
        <linearGradient id={g("loop")} x1="0" y1="0" x2="0.25" y2="1">
          {stop(0, 3)}
          {stop(0.3, 2)}
          {stop(0.55, 5)}
          {stop(0.8, 4)}
          {stop(1, 1)}
        </linearGradient>
        <linearGradient id={g("loopin")} x1="0" y1="0" x2="0" y2="1">
          {stop(0, 1)}
          {stop(0.6, 4)}
          {stop(1, 2)}
        </linearGradient>
        <linearGradient id={g("tail")} x1="0" y1="0" x2="1" y2="0.2">
          {stop(0, 4)}
          {stop(0.35, 3)}
          {stop(0.6, 2)}
          {stop(0.85, 5)}
          {stop(1, 1)}
        </linearGradient>
        <linearGradient id={g("knot")} x1="0" y1="0" x2="0" y2="1">
          {stop(0, 2)}
          {stop(0.32, 3)}
          {stop(0.62, 4)}
          {stop(1, 1)}
        </linearGradient>
      </defs>

      <g className="bw-tail-l">
        <path d="M192,94 C176,140 140,200 90,262 L117,253 L122,284 C168,224 198,158 208,100 Z" fill={`url(#${g("tail")})`} />
        <path d="M194,104 C178,146 150,196 112,246" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={2} />
      </g>
      <g className="bw-tail-r">
        <path d="M208,94 C226,140 260,196 316,250 L289,249 L286,280 C238,224 202,158 192,100 Z" fill={`url(#${g("tail")})`} />
        <path d="M206,104 C222,146 252,192 296,238" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={2} />
      </g>

      <g className="bw-loop-l">
        <path d="M190,72 C160,30 100,-8 50,8 C10,22 14,98 52,124 C90,150 156,118 190,96 Z" fill={`url(#${g("loop")})`} />
        <path
          d="M184,78 C156,50 110,26 76,38 C48,48 52,100 82,114 C116,128 156,106 184,92 Z"
          fill={`url(#${g("loopin")})`}
          opacity={0.75}
        />
        <path d="M180,66 C152,32 104,6 62,18" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth={3} strokeLinecap="round" />
        <path d="M58,122 C100,142 152,118 186,98" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth={2} />
      </g>
      <g className="bw-loop-r">
        <g transform="matrix(-1 0 0 1 400 0)">
          <path d="M190,72 C160,32 102,-4 54,12 C16,26 20,96 56,120 C94,146 156,116 190,96 Z" fill={`url(#${g("loop")})`} />
          <path
            d="M184,78 C156,52 112,30 80,42 C54,52 58,98 86,112 C118,124 156,104 184,92 Z"
            fill={`url(#${g("loopin")})`}
            opacity={0.75}
          />
          <path d="M180,66 C152,34 106,10 66,22" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={3} strokeLinecap="round" />
        </g>
      </g>

      <g className="bw-knot">
        <rect x="177" y="55" width="46" height="52" rx="14" fill={`url(#${g("knot")})`} />
        <path d="M184,62 C191,74 191,90 184,100 M216,62 C209,74 209,90 216,100" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth={1.5} />
        <rect x="188" y="60" width="11" height="18" rx="5.5" fill="rgba(255,255,255,.55)" />
      </g>
    </svg>
  );
});
