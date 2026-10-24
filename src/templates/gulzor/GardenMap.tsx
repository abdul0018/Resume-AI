import { useId } from "react";

/**
 * The way to the venue as an illustrated garden map in a soft organic shape, the venue's house pinned at its
 * centre. With `src` (the owner's watercolour map) the picture is used; otherwise the garden is drawn here in
 * watercolour washes.
 */
export function GardenMap({ venue, src, href }: { venue: string; src?: string; href: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `gzm-${n}-${uid}`;
  const label = venue.length > 26 ? `${venue.slice(0, 25)}…` : venue;
  return (
    <a className="gz-map" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Xaritada ochish: ${venue}`} data-reveal="map">
      <div className="gz-map-shape">
        {src ? <img className="gz-map-img" src={src} alt="" loading="lazy" decoding="async" /> : <DrawnGarden id={id} />}
      </div>
      <span className="gz-map-pin" aria-hidden="true">
        <i className="gz-map-ring" />
        <svg viewBox="0 0 32 42" width="30" height="40">
          <path d="M16 41c-1.8-3.6-14-14.8-14-25.4a14 14 0 0 1 28 0C30 26.2 17.8 37.4 16 41z" fill="#5f6d53" />
          <circle cx="16" cy="15.6" r="5.4" fill="#f7f4ee" />
        </svg>
      </span>
      <span className="gz-map-label">{label}</span>
    </a>
  );
}

/** Watercolour garden: lawns, paths, trees, a pond and the house, washed in with a soft wet edge. */
function DrawnGarden({ id }: { id: (n: string) => string }) {
  const trees = [
    [48, 52, 26], [92, 34, 20], [140, 46, 24], [262, 40, 22], [306, 62, 26], [336, 30, 18],
    [34, 120, 22], [30, 196, 26], [58, 252, 20], [70, 312, 24], [120, 336, 20], [330, 140, 24],
    [348, 210, 20], [318, 262, 26], [286, 330, 22], [232, 348, 18], [96, 214, 16], [276, 196, 14],
    [118, 96, 14], [246, 104, 15], [182, 30, 16], [212, 300, 14],
  ];
  const tones = ["#9fae86", "#b3bf98", "#8d9e78", "#c1c9a4"];
  return (
    <svg className="gz-map-svg" viewBox="0 0 380 380" aria-hidden="true">
      <defs>
        <filter id={id("wet")} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
        <filter id={id("bleed")}>
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <radialGradient id={id("lawn")} cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#e6ead2" />
          <stop offset="1" stopColor="#d3dabb" />
        </radialGradient>
        <radialGradient id={id("pond")} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#d3e2e0" />
          <stop offset="1" stopColor="#a9c3c4" />
        </radialGradient>
      </defs>
      <rect width="380" height="380" fill="#f4f0e4" />
      <g filter={`url(#${id("wet")})`}>
        <path d="M20,30 C120,6 260,10 360,34 C380,140 376,260 352,356 C240,378 120,376 22,352 C6,250 4,130 20,30Z" fill={`url(#${id("lawn")})`} opacity="0.95" />
        {/* paths */}
        <g fill="none" stroke="#ead8cd" strokeLinecap="round">
          <path d="M-10,250 C70,236 120,214 166,196 C210,180 252,190 300,214 C330,230 360,236 400,230" strokeWidth="16" />
          <path d="M190,400 C186,330 196,262 190,206 C186,160 168,120 176,60 C180,30 196,10 200,-10" strokeWidth="13" />
          <path d="M60,400 C80,340 104,296 140,262" strokeWidth="9" />
          <path d="M230,190 C262,150 300,120 360,96" strokeWidth="8" />
        </g>
        <g fill="none" stroke="#f6eee6" strokeLinecap="round" opacity="0.8">
          <path d="M-10,250 C70,236 120,214 166,196 C210,180 252,190 300,214 C330,230 360,236 400,230" strokeWidth="6" />
          <path d="M190,400 C186,330 196,262 190,206 C186,160 168,120 176,60 C180,30 196,10 200,-10" strokeWidth="5" />
        </g>
        {/* pond */}
        <path d="M236,272 C258,252 304,256 314,280 C322,302 292,320 262,316 C236,312 220,292 236,272Z" fill={`url(#${id("pond")})`} />
        {/* flower beds */}
        {[
          [150, 150], [232, 150], [150, 246], [124, 120], [256, 236],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse rx="16" ry="9" fill="#cbd3b3" />
            {[-8, -2, 4, 9].map((dx, k) => (
              <circle key={k} cx={dx} cy={(k % 2) * 3 - 1.5} r="2.4" fill={k % 2 ? "#e8bdb6" : "#fbf7f1"} />
            ))}
          </g>
        ))}
      </g>
      {/* trees: layered washes, each with a darker wet edge */}
      <g filter={`url(#${id("bleed")})`}>
        {trees.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x + 3} cy={y + 4} r={r} fill="#6f7f5c" opacity="0.18" />
            <circle cx={x} cy={y} r={r} fill={tones[i % tones.length]} opacity="0.85" />
            <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.55} fill="#d5dcbf" opacity="0.45" />
          </g>
        ))}
      </g>
      {/* the house */}
      <g transform="translate(190 196)">
        <ellipse cy="20" rx="34" ry="7" fill="#6f7f5c" opacity="0.18" />
        <rect x="-28" y="-6" width="56" height="24" rx="1.5" fill="#fbf9f4" stroke="#cfc9bb" strokeWidth="0.8" />
        <path d="M-32,-5 L-20,-20 L20,-20 L32,-5Z" fill="#a9aca4" />
        <path d="M-12,-20 L-6,-28 L6,-28 L12,-20Z" fill="#9b9e96" />
        {[-20, -10, 0, 10, 20].map((x) => (
          <rect key={x} x={x - 2.4} y="0" width="4.8" height="7" fill="#c7cfc6" />
        ))}
        <rect x="-3.5" y="9" width="7" height="9" fill="#b9bfb2" />
      </g>
    </svg>
  );
}
