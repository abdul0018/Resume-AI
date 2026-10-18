import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import {svgPathBbox} from 'svg-path-bbox';
import {clamp, src} from './kit';

/**
 * Style D: hand-drawn story ("whiteboard on charcoal"). A narrated story told with white line-art
 * stick figures and objects that draw themselves on, stroke by stroke, with orange accents, on a
 * charcoal background. Each scene erases (strokes undraw) before the next one draws. Elements are
 * timed to the voiceover's word timestamps. Ends on a title card with a speech bubble.
 *
 * Scenes are JSON: every element names a builder (`b`) from BUILDERS plus its params and the second
 * (`at`) it starts drawing, so new stories need no new code unless they need a new object.
 */

const FPS = 30;
const BG = '#4B4A4F';
const W = '#F4F4F2';
const O = '#F7A325';
const HAND = "'Caveat', 'Comic Sans MS', cursive";
export const GROUND = 1120;

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading story font');
  Promise.all([`600 80px 'Caveat'`, `700 80px 'Caveat'`].map((f) => document.fonts.load(f, 'Aa‘')))
    .then(() => continueRender(handle)).catch(() => continueRender(handle));
}

type P = {d: string; c?: 'w' | 'o'; fill?: boolean; width?: number};
type Txt = {text: string; x: number; y: number; size?: number; c?: 'w' | 'o'; anchor?: 'start' | 'middle'};
type Built = {paths: P[]; texts?: Txt[]};
export type El = {b: string; at: number; dur?: number; sfx?: SfxName | 'none'; [k: string]: unknown};
type SfxName = 'chime' | 'pop' | 'impact' | 'scratch';
export type StoryScene = {start: number; end: number; els: El[]};
export type StoryProps = {voice?: string; // omit for an SFX-only cut (the user adds their own voice later)
  scenes: StoryScene[]; end: number; sfx?: boolean; music?: string; musicVolume?: number};

/* ---------------- builders (1080x1920 space, ground at GROUND) ---------------- */

const circle = (x: number, y: number, r: number) => `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x: number, y: number, w: number, h: number) => `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
const heart = (x: number, y: number, s: number) => `M ${x} ${y + s * 0.9} C ${x - s * 1.4} ${y - s * 0.1} ${x - s * 0.6} ${y - s * 1.1} ${x} ${y - s * 0.35} C ${x + s * 0.6} ${y - s * 1.1} ${x + s * 1.4} ${y - s * 0.1} ${x} ${y + s * 0.9} Z`;
const rays = (x: number, y: number, r1: number, r2: number, n = 6, from = -150, to = -30) =>
  Array.from({length: n}, (_, i) => {
    const a = ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180;
    return {d: `M ${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1} L ${x + Math.cos(a) * r2} ${y + Math.sin(a) * r2}`, c: 'o' as const};
  });

type Pose = 'down' | 'up' | 'point' | 'sad' | 'type';
const person = (x: number, s: number, opts: {pose?: Pose; cap?: boolean; woman?: boolean; face?: -1 | 1}): Built => {
  const h = 340 * s; const r = 25 * s; const pose = opts.pose ?? 'down';
  const sad = pose === 'sad';
  const hx = x + (sad ? 10 * s : 0);
  const top = GROUND - h + (sad ? 14 * s : 0);
  const hcy = top + r;
  const sy = GROUND - h + 2 * r + 12 * s; // shoulders
  const hy = GROUND - h * 0.44; // hips
  const w = 66 * s;
  const paths: P[] = [];
  if (opts.woman) {
    // Hijab arch + long robe, like the reference.
    paths.push({d: `M ${x - r * 1.1} ${hcy + r * 0.9} C ${x - r * 1.3} ${hcy - r * 1.5} ${x + r * 1.3} ${hcy - r * 1.5} ${x + r * 1.1} ${hcy + r * 0.9}`});
    paths.push({d: circle(x, hcy + r * 0.15, r * 0.62)});
    paths.push({d: `M ${x - r * 1.1} ${hcy + r * 0.9} L ${x - w * 0.55} ${sy} L ${x - w * 0.62} ${GROUND} L ${x + w * 0.62} ${GROUND} L ${x + w * 0.55} ${sy} L ${x + r * 1.1} ${hcy + r * 0.9}`});
  } else {
    paths.push({d: circle(hx, hcy, r)});
    paths.push({d: rect(x - w / 2, sy, w, hy - sy)});
    paths.push({d: `M ${x - w / 4} ${hy} L ${x - w / 4} ${GROUND} M ${x + w / 4} ${hy} L ${x + w / 4} ${GROUND}`});
  }
  const L = x - w / 2 - 7 * s; const R = x + w / 2 + 7 * s;
  if (pose === 'up') paths.push({d: `M ${L} ${sy + 6 * s} L ${L - 46 * s} ${sy - 92 * s} M ${R} ${sy + 6 * s} L ${R + 46 * s} ${sy - 92 * s}`});
  else if (pose === 'point') paths.push({d: `M ${L} ${sy + 8 * s} L ${L - 4 * s} ${hy + 6 * s} M ${R} ${sy + 8 * s} L ${R + 96 * (opts.face ?? 1) * s} ${sy + 26 * s}`});
  else if (pose === 'type') paths.push({d: `M ${L} ${sy + 8 * s} L ${L + 40 * s} ${hy - 20 * s} M ${R} ${sy + 8 * s} L ${R + 70 * s} ${hy - 30 * s}`});
  else paths.push({d: `M ${L} ${sy + 8 * s} L ${L - 5 * s} ${hy + 8 * s} M ${R} ${sy + 8 * s} L ${R + 5 * s} ${hy + 8 * s}`});
  if (opts.cap) {
    const t = top - 2 * s;
    paths.push({d: `M ${hx - 44 * s} ${t + 4 * s} L ${hx} ${t - 16 * s} L ${hx + 44 * s} ${t + 4 * s} L ${hx} ${t + 20 * s} Z`});
    paths.push({d: `M ${hx + 44 * s} ${t + 4 * s} L ${hx + 46 * s} ${t + 40 * s}`, c: 'o'});
  }
  return {paths};
};

const university = (x: number, w: number, flag: boolean): Built => {
  const h = w * 0.62; const top = GROUND - h;
  const paths: P[] = [
    {d: `M ${x - w / 2 - 14} ${GROUND} L ${x + w / 2 + 14} ${GROUND} M ${x - w / 2} ${GROUND - 14} L ${x + w / 2} ${GROUND - 14}`},
    {d: `M ${x - w / 2 - 10} ${top} L ${x} ${top - w * 0.3} L ${x + w / 2 + 10} ${top} Z`},
    {d: [0, 1, 2, 3, 4].map((i) => { const cx = x - w / 2 + 16 + (i * (w - 32)) / 4; return `M ${cx} ${top + 8} L ${cx} ${GROUND - 14}`; }).join(' ')},
  ];
  if (flag) paths.push({d: `M ${x} ${top - w * 0.3} L ${x} ${top - w * 0.3 - 90} M ${x} ${top - w * 0.3 - 90} L ${x + 62} ${top - w * 0.3 - 72} L ${x} ${top - w * 0.3 - 54} Z`, c: 'o', fill: true});
  return {paths};
};

export const BUILDERS: Record<string, (e: El) => Built> = {
  ground: (e) => { const a = (e.x1 as number) ?? 80; const b = (e.x2 as number) ?? 1000; return {paths: [{d: `M ${a} ${GROUND} C ${a + (b - a) / 3} ${GROUND + 3} ${a + (2 * (b - a)) / 3} ${GROUND - 3} ${b} ${GROUND}`}]}; },
  person: (e) => person(e.x as number, (e.s as number) ?? 1, {pose: e.pose as Pose, cap: !!e.cap, woman: !!e.woman, face: e.face as 1 | -1}),
  university: (e) => university(e.x as number, (e.w as number) ?? 260, !!e.flag),
  glow: (e) => ({paths: [{d: `M ${(e.x as number) - 34} ${e.y} C ${(e.x as number) - 30} ${(e.y as number) - 40} ${(e.x as number) + 30} ${(e.y as number) - 40} ${(e.x as number) + 34} ${e.y}`, c: 'o'}, ...rays(e.x as number, (e.y as number) - 14, 50, 70, 5)]}),
  door: (e) => {
    const x = e.x as number;
    return {paths: [{d: rect(x - 70, GROUND - 270, 140, 270)}, {d: circle(x + 44, GROUND - 130, 7)}, {d: rect(x - 120, GROUND - 380, 240, 76)}],
      texts: [{text: (e.label as string) ?? 'Repetitor', x, y: GROUND - 326, size: 58, c: 'w', anchor: 'middle'}]};
  },
  cross: (e) => { const x = e.x as number; const y = e.y as number; const r = (e.r as number) ?? 120; return {paths: [{d: `M ${x - r} ${y - r} L ${x + r} ${y + r}`, c: 'o', width: 12}, {d: `M ${x + r} ${y - r} L ${x - r} ${y + r}`, c: 'o', width: 12}]}; },
  board: (e) => {
    const x = e.x as number; const w = 460; const h = 280; const y = GROUND - 520;
    return {paths: [{d: rect(x - w / 2, y, w, h)}, {d: `M ${x - w / 2 + 40} ${y + h} L ${x - w / 2 + 20} ${GROUND} M ${x + w / 2 - 40} ${y + h} L ${x + w / 2 - 20} ${GROUND}`}]};
  },
  text: (e) => ({paths: [], texts: [{text: e.text as string, x: e.x as number, y: e.y as number, size: (e.size as number) ?? 90, c: (e.c as 'w' | 'o') ?? 'o', anchor: (e.anchor as 'start' | 'middle') ?? 'middle'}]}),
  certificate: (e) => {
    const x = e.x as number; const y = e.y as number; const w = 420; const h = 290;
    return {paths: [
      {d: rect(x - w / 2, y - h / 2, w, h)}, {d: rect(x - w / 2 + 16, y - h / 2 + 16, w - 32, h - 32)},
      {d: `M ${x - 140} ${y + 30} L ${x + 60} ${y + 30} M ${x - 140} ${y + 70} L ${x + 30} ${y + 70}`},
      {d: circle(x + 130, y + 70, 36), c: 'o'}, {d: `M ${x + 112} ${y + 100} L ${x + 100} ${y + 160} L ${x + 120} ${y + 146} L ${x + 134} ${y + 166} L ${x + 146} ${y + 104}`, c: 'o'},
    ], texts: [{text: (e.title as string) ?? 'IELTS', x, y: y - 40, size: 96, c: 'o', anchor: 'middle'}]};
  },
  desk: (e) => {
    const x = e.x as number; const top = GROUND - 190;
    return {paths: [
      {d: `M ${x - 210} ${top} L ${x + 210} ${top} M ${x - 180} ${top} L ${x - 180} ${GROUND} M ${x + 180} ${top} L ${x + 180} ${GROUND}`},
      {d: `${rect(x - 160, top - 34, 150, 34)} ${rect(x - 150, top - 64, 130, 30)} ${rect(x - 165, top - 92, 140, 28)}`},
      {d: `M ${x + 120} ${top} L ${x + 120} ${top - 150} L ${x + 40} ${top - 200} M ${x + 10} ${top - 175} C ${x + 20} ${top - 230} ${x + 90} ${top - 220} ${x + 70} ${top - 175} Z`},
      {d: `M ${x + 30} ${top - 165} L ${x - 10} ${top - 120} M ${x + 55} ${top - 160} L ${x + 50} ${top - 110}`, c: 'o'},
    ]};
  },
  chart: (e) => {
    const x = e.x as number; const base = GROUND - 40; const ceil = base - 300;
    const bars = (e.bars as number[]) ?? [0.8, 0.95, 1, 0.97];
    return {paths: [
      {d: `M ${x - 230} ${base - 360} L ${x - 230} ${base} L ${x + 230} ${base}`},
      {d: bars.map((v, i) => rect(x - 190 + i * 105, base - 300 * v, 70, 300 * v)).join(' ')},
      {d: `M ${x - 250} ${ceil} L ${x + 250} ${ceil}`, c: 'o', width: 8},
    ], texts: [{text: (e.label as string) ?? '5.0', x: x + 260, y: ceil - 20, size: 92, c: 'o', anchor: 'middle'}]};
  },
  laptop: (e) => {
    const x = e.x as number; const s = (e.s as number) ?? 1; const base = (e.y as number) ?? GROUND - 10;
    const w = 380 * s; const h = 240 * s;
    return {paths: [
      {d: rect(x - w / 2, base - h - 20 * s, w, h)},
      {d: `M ${x - w / 2 - 40 * s} ${base} L ${x + w / 2 + 40 * s} ${base} L ${x + w / 2} ${base - 20 * s} L ${x - w / 2} ${base - 20 * s} Z`},
    ], texts: e.screen ? [{text: e.screen as string, x, y: base - h / 2 - 8 * s, size: 74 * s, c: 'o', anchor: 'middle'}] : []};
  },
  table: (e) => { const x = e.x as number; const top = GROUND - 170; return {paths: [{d: `M ${x - 260} ${top} L ${x + 260} ${top} M ${x - 230} ${top} L ${x - 230} ${GROUND} M ${x + 230} ${top} L ${x + 230} ${GROUND}`}]}; },
  bulb: (e) => {
    const x = e.x as number; const y = e.y as number;
    return {paths: [{d: `M ${x - 18} ${y + 40} C ${x - 60} ${y} ${x - 40} ${y - 60} ${x} ${y - 60} C ${x + 40} ${y - 60} ${x + 60} ${y} ${x + 18} ${y + 40} Z M ${x - 16} ${y + 52} L ${x + 16} ${y + 52}`, c: 'o'}, ...rays(x, y - 14, 74, 104, 7, -180, 0)]};
  },
  cards: (e) => {
    const x = e.x as number; const y = e.y as number;
    return {paths: [0, 1, 2].map((i) => ({d: rect(x - 210 + i * 150, y - 70, 120, 150)})), texts: [0, 1, 2].map((i) => ({text: String(i + 1), x: x - 150 + i * 150, y: y + 30, size: 84, c: 'o' as const, anchor: 'middle' as const}))};
  },
  roadmap: () => {
    // Smooth Catmull-Rom curve through the milestones, so the dots sit exactly on the road.
    const pts = [[140, GROUND - 20], [420, GROUND - 90], [330, GROUND - 250], [640, GROUND - 300], [900, GROUND - 460]];
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]; const p1 = pts[i]; const p2 = pts[i + 1]; const p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
    }
    const [fx, fy] = pts[pts.length - 1];
    return {paths: [
      {d},
      ...pts.slice(1, 4).map(([px, py]) => ({d: circle(px, py, 16), c: 'o' as const, fill: true})),
      {d: `M ${fx} ${fy} L ${fx} ${fy - 110} L ${fx + 70} ${fy - 88} L ${fx} ${fy - 66}`, c: 'o', fill: true},
    ]};
  },
  tag: (e) => {
    const x = e.x as number; const y = e.y as number;
    return {paths: [{d: `M ${x - 130} ${y - 55} L ${x + 90} ${y - 55} L ${x + 140} ${y} L ${x + 90} ${y + 55} L ${x - 130} ${y + 55} Z`, c: 'o'}, {d: circle(x + 88, y, 10), c: 'o'}],
      texts: [{text: (e.text as string) ?? 'arzon', x: x - 25, y: y + 22, size: 70, c: 'o', anchor: 'middle'}]};
  },
  jar: (e) => {
    const x = e.x as number;
    return {paths: [
      {d: `M ${x - 90} ${GROUND - 260} L ${x - 100} ${GROUND - 20} Q ${x - 100} ${GROUND} ${x - 80} ${GROUND} L ${x + 80} ${GROUND} Q ${x + 100} ${GROUND} ${x + 100} ${GROUND - 20} L ${x + 90} ${GROUND - 260} M ${x - 104} ${GROUND - 262} L ${x + 104} ${GROUND - 262}`},
      {d: [[-45, 50], [10, 46], [55, 52], [-20, 100], [35, 100], [-50, 148], [5, 150], [50, 150]].map(([dx, dy]) => circle(x + dx, GROUND - dy, 22)).join(' '), c: 'o'},
    ]};
  },
  arrow: (e) => {
    const x1 = e.x1 as number; const y1 = e.y1 as number; const x2 = e.x2 as number; const y2 = e.y2 as number;
    const mx = (x1 + x2) / 2; const my = Math.min(y1, y2) - 120;
    const a = Math.atan2(y2 - my, x2 - mx);
    const hx = (k: number) => x2 - Math.cos(a + k) * 36; const hy = (k: number) => y2 - Math.sin(a + k) * 36;
    return {paths: [{d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2} M ${hx(0.5)} ${hy(0.5)} L ${x2} ${y2} L ${hx(-0.5)} ${hy(-0.5)}`, c: 'o'}]};
  },
  calendar: (e) => {
    const x = e.x as number; const y = e.y as number;
    return {paths: [{d: rect(x - 130, y - 120, 260, 250)}, {d: `M ${x - 130} ${y - 60} L ${x + 130} ${y - 60}`}, {d: `M ${x - 70} ${y - 140} L ${x - 70} ${y - 100} M ${x + 70} ${y - 140} L ${x + 70} ${y - 100}`}],
      texts: [{text: (e.text as string) ?? '4 oy', x, y: y + 60, size: 96, c: 'o', anchor: 'middle'}]};
  },
  burst: (e) => ({paths: rays(e.x as number, e.y as number, (e.r1 as number) ?? 110, (e.r2 as number) ?? 150, 9, -200, 20)}),
  scroll: (e) => {
    const x = e.x as number; const y = e.y as number;
    return {paths: [{d: `M ${x - 120} ${y - 150} L ${x + 120} ${y - 150} L ${x + 120} ${y + 150} L ${x - 120} ${y + 150} Z`}, {d: `M ${x - 80} ${y + 30} L ${x + 80} ${y + 30} M ${x - 80} ${y + 70} L ${x + 50} ${y + 70}`}, {d: circle(x + 70, y + 115, 24), c: 'o'}],
      texts: [{text: (e.text as string) ?? 'GRANT', x, y: y - 50, size: 76, c: 'o', anchor: 'middle'}]};
  },
  hearts: (e) => {
    const xs = (e.xs as number[]) ?? [e.x as number]; const y = e.y as number;
    return {paths: xs.flatMap((x) => [{d: heart(x, y, 30), c: 'o' as const, fill: true}, ...rays(x, y - 6, 48, 66, 5)])};
  },
  bubble: (e) => {
    const x = e.x as number; const y = e.y as number; const w = (e.w as number) ?? 420; const h = 200;
    return {paths: [{d: `M ${x - w / 2 + 20} ${y - h / 2} L ${x + w / 2 - 20} ${y - h / 2} Q ${x + w / 2} ${y - h / 2} ${x + w / 2} ${y - h / 2 + 20} L ${x + w / 2} ${y + h / 2 - 20} Q ${x + w / 2} ${y + h / 2} ${x + w / 2 - 20} ${y + h / 2} L ${x - w / 2 + 100} ${y + h / 2} L ${x - w / 2 + 40} ${y + h / 2 + 60} L ${x - w / 2 + 50} ${y + h / 2} L ${x - w / 2 + 20} ${y + h / 2} Q ${x - w / 2} ${y + h / 2} ${x - w / 2} ${y + h / 2 - 20} L ${x - w / 2} ${y - h / 2 + 20} Q ${x - w / 2} ${y - h / 2} ${x - w / 2 + 20} ${y - h / 2} Z`}],
      texts: [{text: e.text as string, x, y: y + 34, size: 104, c: 'o', anchor: 'middle'}]};
  },
};

/* ---------------- rendering ---------------- */

const col = (c?: 'w' | 'o') => (c === 'o' ? O : W);

// `zoom` is the scene camera scale: strokes are divided by it so they keep a constant on-screen width
// (vector-effect: non-scaling-stroke breaks pathLength-based draw-on in Chrome).
const DrawnEl: React.FC<{el: El; built: Built; frame: number; erase: number; zoom: number}> = ({el, built, frame, erase, zoom}) => {
  const start = Math.round(el.at * FPS);
  const dur = Math.max(6, Math.round((el.dur ?? 0.7) * FPS));
  const n = built.paths.length + (built.texts?.length ?? 0);
  const slot = dur / Math.max(1, n);
  return (
    <g>
      {built.paths.map((p, i) => {
        const k = interpolate(frame, [start + i * slot, start + (i + 1) * slot], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)}) * erase;
        if (k <= 0) return null;
        return (
          <g key={i}>
            {p.fill && <path d={p.d} fill={col(p.c)} opacity={interpolate(k, [0.85, 1], [0, 0.95], clamp)} />}
            <path d={p.d} fill="none" stroke={col(p.c)} strokeWidth={((p.width ?? 6) * 0.85) / zoom} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
          </g>
        );
      })}
      {built.texts?.map((t, j) => {
        const i = built.paths.length + j;
        const k = interpolate(frame, [start + i * slot, start + (i + 1) * slot + 4], [0, 1], clamp) * erase;
        if (k <= 0) return null;
        const size = t.size ?? 90;
        // Over-estimate the width so the wipe never cuts the tail; drop the clip once fully written.
        const approxW = t.text.length * size * 0.55;
        const left = t.anchor === 'middle' ? t.x - approxW / 2 : t.x;
        return (
          <g key={`t${j}`}>
            <clipPath id={`clip-${el.b}-${start}-${j}`}><rect x={left - 20} y={t.y - size} width={(approxW + 40) * k} height={size * 1.4} /></clipPath>
            <text x={t.x} y={t.y} textAnchor={t.anchor ?? 'start'} fontFamily={HAND} fontWeight={700} fontSize={size} fill={col(t.c)} opacity={erase < 1 ? erase : 1} clipPath={k >= 1 ? undefined : `url(#clip-${el.b}-${start}-${j})`}>{t.text}</text>
          </g>
        );
      })}
    </g>
  );
};

const ERASE = 9;

/** Content box of a scene in drawing space (ground excluded: it is re-fitted to the content). */
const sceneBox = (els: El[]) => {
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
  const add = (a: number, b: number, c: number, d: number) => { x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); };
  els.filter((el) => el.b !== 'ground').forEach((el) => {
    const built = BUILDERS[el.b]?.(el);
    built?.paths.forEach((p) => { const [a, b, c, d] = svgPathBbox(p.d); add(a, b, c, d); });
    built?.texts?.forEach((tx) => {
      const size = tx.size ?? 90; const w = tx.text.length * size * 0.5;
      const left = tx.anchor === 'middle' ? tx.x - w / 2 : tx.x;
      add(left, tx.y - size * 0.8, left + w, tx.y + size * 0.2);
    });
  });
  return Number.isFinite(x0) ? {x0, y0, x1, y1} : {x0: 140, y0: 600, x1: 940, y1: GROUND};
};

/**
 * Camera per scene, like the reference: the drawing fills the frame (≈90% of the width, figures about
 * a third of the height) with the ground line at ≈67% of the height, plus a slow 3% push-in.
 */
const SCREEN_GROUND = 1290;
const sceneCamera = (els: El[], progress: number) => {
  const box = sceneBox(els);
  const grounded = els.some((el) => el.b === 'ground');
  const bw = box.x1 - box.x0 + (grounded ? 140 : 80);
  const cx = (box.x0 + box.x1) / 2;
  let k: number; let fromY: number; let toY: number;
  if (grounded) {
    k = Math.min(1.9, 960 / bw, (SCREEN_GROUND - 260) / (GROUND - box.y0));
    fromY = GROUND; toY = SCREEN_GROUND;
  } else {
    k = Math.min(1.9, 960 / bw, 1050 / (box.y1 - box.y0));
    fromY = (box.y0 + box.y1) / 2; toY = 980;
  }
  k *= 1 + 0.03 * progress;
  return {transform: `translate(540 ${toY}) scale(${k}) translate(${-cx} ${-fromY})`, box, k};
};

const ORANGE_ACCENT = new Set(['glow', 'hearts', 'burst', 'bulb', 'tag']);

/** Sound design: pencil while drawing, swish on scene change, chime on orange accents, scratch on crosses. */
const storySfx = (scenes: StoryScene[]) => {
  const ev: {f: number; d: number; file: string; vol: number}[] = [];
  const F = (s: number) => Math.round(s * FPS);
  scenes.forEach((sc, si) => {
    if (si > 0) ev.push({f: F(sc.start) - ERASE - 3, d: 20, file: 'whoosh', vol: 0.45});
    sc.els.forEach((el) => {
      const dur = Math.max(6, F(el.dur ?? 0.7));
      if (el.sfx === 'none') return;
      if (el.b !== 'ground') ev.push({f: F(el.at), d: dur, file: 'scribble', vol: el.b === 'text' ? 0.32 : 0.26});
      const accentAt = F(el.at) + Math.round(dur * 0.65);
      const big = el.b === 'text' && el.c !== 'w' && ((el.size as number) ?? 90) >= 150;
      const kind: SfxName | undefined = el.sfx as SfxName | undefined
        ?? (el.b === 'cross' ? 'scratch' : ORANGE_ACCENT.has(el.b) || (el.b === 'university' && el.flag) || big || el.b === 'bubble' ? 'chime' : undefined);
      if (kind) ev.push({f: kind === 'scratch' ? F(el.at) : accentAt, d: 45, file: kind, vol: kind === 'chime' ? 0.4 : 0.6});
      if (big) ev.push({f: accentAt - 2, d: 30, file: 'impact', vol: 0.35});
    });
  });
  return ev;
};

export const StoryReel: React.FC<StoryProps> = (p) => {
  const frame = useCurrentFrame();
  const scene = p.scenes.find((sc) => frame >= Math.round(sc.start * FPS) && frame < Math.round(sc.end * FPS));
  const startF = scene ? Math.round(scene.start * FPS) : 0;
  const endF = scene ? Math.round(scene.end * FPS) : 1;
  const erase = scene ? interpolate(frame, [endF - ERASE, endF], [1, 0], {...clamp, easing: Easing.in(Easing.quad)}) : 0;
  const cam = scene ? sceneCamera(scene.els, (frame - startF) / Math.max(1, endF - startF)) : null;
  return (
    <AbsoluteFill style={{background: BG}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          {/* Slight wobble so strokes read as hand-drawn (applied in screen space). */}
          <filter id="sketch"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
        </defs>
        {scene && cam && (
          <g filter="url(#sketch)">
            <g transform={cam.transform}>
              {scene.els.map((el, i) => {
                // The ground line spans just the drawing, like the reference.
                const e = el.b === 'ground' ? {...el, x1: cam.box.x0 - 70, x2: cam.box.x1 + 70} : el;
                const builder = BUILDERS[e.b];
                return builder ? <DrawnEl key={i} el={e} built={builder(e)} frame={frame} erase={erase} zoom={cam.k} /> : null;
              })}
            </g>
          </g>
        )}
      </svg>
      {p.voice && <Audio src={src(p.voice)} />}
      {p.music && <Audio src={staticFile(p.music)} volume={p.musicVolume ?? 0.12} />}
      {p.sfx && storySfx(p.scenes).map((e, i) => (
        <Sequence key={i} from={Math.max(0, e.f)} durationInFrames={e.d} layout="none">
          <Audio src={staticFile(`sfx/${e.file}.wav`)} volume={e.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const storyDuration = (p: StoryProps) => Math.round(p.end * FPS);
