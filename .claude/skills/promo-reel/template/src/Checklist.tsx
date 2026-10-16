import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/600.css';
import {FONT, clamp} from './kit';

/**
 * Style B: "handwritten checklist" reel. A paper sheet with a serif title and a list of rows
 * (3D pill icon + label); a red pen writes each row's answer, then an optional footer line
 * (brand) gets written and underlined. One continuous shot, no cuts. The first frame already
 * shows the whole list with empty answers: that curiosity gap is the hook.
 */

const SERIF = "'DM Serif Display', Georgia, serif";
const HAND = "'Caveat', 'Comic Sans MS', cursive";
const INK = '#1C1C1C';
const NAVY = '#1F3A7A';
const RED = '#D9362B';
const W = 1080;

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading checklist fonts');
  Promise.all([`400 100px 'DM Serif Display'`, `500 70px 'Caveat'`, `600 70px 'Caveat'`].map((f) => document.fonts.load(f, 'Aa‘Ў')))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}

export type IconKind = 'mic' | 'pen' | 'book' | 'headphones' | 'check' | 'star';
export type ChecklistRow = {label: string; answer: string; icon: IconKind; color: string};
export type ChecklistProps = {
  title: string; // "\n" splits lines
  rows: ChecklistRow[];
  footer?: {lead?: string; brand: string};
  sfx?: boolean;
  music?: string;
  musicVolume?: number;
};

// Layout (1080x1920). Rows sit between the title and the footer; the footer stays above the
// bottom ~20% that Instagram/TikTok cover with captions and buttons.
const ROW_TOP = 590;
const ROW_GAP = 210;
const ANSWER_X = 600;
const ROW_SIZE = 72;
const LEAD_SIZE = 66;
const BRAND_SIZE = 132;

const measure = (() => {
  let ctx: CanvasRenderingContext2D | null = null;
  return (text: string, font: string) => {
    if (typeof document === 'undefined') return text.length * 30;
    ctx = ctx ?? document.createElement('canvas').getContext('2d');
    if (!ctx) return text.length * 30;
    ctx.font = font;
    return ctx.measureText(text).width;
  };
})();

type Seg = {text: string; x: number; y: number; size: number; weight: number; start: number; end: number; w: number};

/** Where and when every handwritten piece is written. Shared by the text, the pen and the sound. */
export const checklistTimeline = (p: ChecklistProps) => {
  const segs: Seg[] = [];
  let t = 10;
  p.rows.forEach((r, i) => {
    const w = measure(r.answer, `500 ${ROW_SIZE}px Caveat`);
    const dur = Math.round(r.answer.length * 3);
    segs.push({text: r.answer, x: ANSWER_X, y: ROW_TOP + i * ROW_GAP, size: ROW_SIZE, weight: 500, start: t, end: t + dur, w});
    t += dur + 12;
  });
  let underline: {x: number; y: number; w: number; start: number; end: number} | null = null;
  if (p.footer) {
    const fy = ROW_TOP + p.rows.length * ROW_GAP - 10;
    if (p.footer.lead) {
      const w = measure(p.footer.lead, `500 ${LEAD_SIZE}px Caveat`);
      const dur = Math.round(p.footer.lead.length * 1.7);
      segs.push({text: p.footer.lead, x: (W - w) / 2, y: fy, size: LEAD_SIZE, weight: 500, start: t, end: t + dur, w});
      t += dur + 10;
    }
    const w = measure(p.footer.brand, `600 ${BRAND_SIZE}px Caveat`);
    const dur = Math.round(p.footer.brand.length * 3.6);
    const by = fy + (p.footer.lead ? 112 : 0);
    segs.push({text: p.footer.brand, x: (W - w) / 2, y: by, size: BRAND_SIZE, weight: 600, start: t, end: t + dur, w});
    t += dur + 4;
    underline = {x: (W - w) / 2 - 16, y: by + BRAND_SIZE * 0.55, w: w + 32, start: t, end: t + 14};
    t += 14;
  }
  return {segs, underline, writingEnd: t, total: t + 50};
};

/** Paper sheet: off-white with soft light falloff and fine grain. */
const Paper: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 35%, #FBFBFA 0%, #F2F2F0 60%, #E6E6E3 100%)'}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'multiply'}}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

const GLYPHS: Record<IconKind, React.ReactNode> = {
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>,
  pen: <><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" /><path d="M14 6l3 3" /></>,
  book: <><path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1V5zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1V5z" /></>,
  headphones: <><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="5" height="7" rx="2" /><rect x="16" y="14" width="5" height="7" rx="2" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
};

/** Glossy 3D capsule with a white glyph (stands in for the reference's pills). */
const PillIcon: React.FC<{kind: IconKind; color: string}> = ({kind, color}) => (
  <div style={{position: 'relative', width: 190, height: 124}}>
    <div style={{position: 'absolute', left: 14, right: 14, bottom: -14, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,.18)', filter: 'blur(10px)'}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: 62, background: `linear-gradient(160deg, color-mix(in srgb, ${color} 55%, white) 0%, ${color} 45%, color-mix(in srgb, ${color} 75%, black) 100%)`, boxShadow: `inset 0 -10px 18px rgba(0,0,0,.18), inset 0 8px 14px rgba(255,255,255,.35)`}} />
    <div style={{position: 'absolute', left: 26, top: 12, width: 90, height: 34, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,0))'}} />
    <svg viewBox="0 0 24 24" width="66" height="66" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', left: 62, top: 29, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.25))'}}>{GLYPHS[kind]}</svg>
  </div>
);

/** Handwritten text revealed left -> right up to `p` (0..1). */
const Hand: React.FC<{seg: Seg; p: number}> = ({seg, p}) => {
  if (p <= 0) return null;
  const edge = p * 100;
  const mask = `linear-gradient(90deg, #000 ${edge - 2}%, transparent ${edge + 0.5}%)`;
  return (
    <div style={{position: 'absolute', left: seg.x, top: seg.y - seg.size * 0.62, fontFamily: HAND, fontWeight: seg.weight, fontSize: seg.size, color: RED, lineHeight: 1.1, whiteSpace: 'nowrap', WebkitMaskImage: mask, maskImage: mask, transform: 'rotate(-1.2deg)', transformOrigin: '0 50%'}}>
      {seg.text}
    </div>
  );
};

/** Red ballpoint pen held like a right hand would: tip at (x, y), body running to the lower right. */
const Pen: React.FC<{x: number; y: number; lift: number}> = ({x, y, lift}) => (
  <div style={{position: 'absolute', left: 0, top: 0, filter: `drop-shadow(${18 + lift * 0.5}px ${22 + lift * 0.8}px ${8 + lift * 0.3}px rgba(0,0,0,.22))`}}>
  <div style={{position: 'absolute', left: x - 45, top: y - 620 - lift, width: 90, height: 620, transformOrigin: '45px 620px', transform: 'rotate(142deg)'}}>
    <svg viewBox="0 0 90 620" width="90" height="620">
      <defs>
        <linearGradient id="barrel" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".45" stopColor="#f2f2f2" stopOpacity=".55" /><stop offset="1" stopColor="#cfcfcf" stopOpacity=".8" /></linearGradient>
        <linearGradient id="metal" x1="0" x2="1"><stop offset="0" stopColor="#e8e8e8" /><stop offset=".5" stopColor="#9a9a9a" /><stop offset="1" stopColor="#d0d0d0" /></linearGradient>
        <linearGradient id="cap" x1="0" x2="1"><stop offset="0" stopColor="#ff6a5e" /><stop offset=".5" stopColor="#e2302a" /><stop offset="1" stopColor="#a81d18" /></linearGradient>
      </defs>
      <rect x="20" y="60" width="50" height="380" rx="10" fill="url(#barrel)" stroke="rgba(0,0,0,.18)" strokeWidth="2" />
      <rect x="41" y="110" width="8" height="440" rx="4" fill="#d8322a" />
      <path d="M22 430h46l-6 120H28z" fill="#3b3b3b" opacity=".85" />
      <path d="M28 548h34l-13 62h-8z" fill="url(#metal)" />
      <circle cx="45" cy="614" r="4" fill="#222" />
      <rect x="16" y="0" width="58" height="80" rx="16" fill="url(#cap)" />
      <rect x="64" y="20" width="10" height="150" rx="5" fill="url(#cap)" />
      <rect x="26" y="70" width="5" height="350" rx="2.5" fill="#fff" opacity=".7" />
    </svg>
  </div>
  </div>
);

/** Pen tip position: follows the writing edge with a small per-letter wobble, lifts and travels between pieces. */
const penAt = (frame: number, segs: Seg[], underline: ReturnType<typeof checklistTimeline>['underline'], writingEnd: number) => {
  const tip = (s: Seg, p: number) => ({x: s.x + s.w * p, y: s.y + s.size * 0.12 + Math.sin(p * s.text.length * Math.PI) * s.size * 0.16, lift: 0});
  const stops: {f: number; x: number; y: number}[] = [];
  segs.forEach((s) => { stops.push({f: s.start, ...tip(s, 0)}); stops.push({f: s.end, ...tip(s, 1)}); });
  if (underline) { stops.push({f: underline.start, x: underline.x, y: underline.y}); stops.push({f: underline.end, x: underline.x + underline.w, y: underline.y - 8}); }
  for (const s of segs) {
    if (frame >= s.start && frame <= s.end) return tip(s, (frame - s.start) / Math.max(1, s.end - s.start));
  }
  if (underline && frame >= underline.start && frame <= underline.end) {
    const k = (frame - underline.start) / (underline.end - underline.start);
    return {x: underline.x + underline.w * k, y: underline.y - 8 * k, lift: 0};
  }
  if (frame < stops[0].f) {
    const k = Easing.out(Easing.cubic)(frame / stops[0].f);
    return {x: stops[0].x + (1 - k) * 420, y: stops[0].y + (1 - k) * 360, lift: 40 * (1 - k)};
  }
  // Travelling between two stops: ease across with a lift arc.
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]; const b = stops[i + 1];
    if (frame > a.f && frame < b.f) {
      const k = Easing.inOut(Easing.cubic)((frame - a.f) / (b.f - a.f));
      return {x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, lift: Math.sin(k * Math.PI) * 50};
    }
  }
  // Done: drift off to the lower right.
  const last = stops[stops.length - 1];
  const k = interpolate(frame, [writingEnd + 6, writingEnd + 30], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return {x: last.x + k * 700, y: last.y + k * 500, lift: 40 * k};
};

export const ChecklistReel: React.FC<ChecklistProps> = (props) => {
  const frame = useCurrentFrame();
  const {segs, underline, writingEnd} = checklistTimeline(props);
  const pen = penAt(frame, segs, underline, writingEnd);
  const lines = props.title.split('\n');
  return (
    <AbsoluteFill style={{fontFamily: FONT, overflow: 'hidden'}}>
      <Paper />
      <div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center', fontFamily: SERIF, color: INK, fontSize: 118, lineHeight: 1.0, letterSpacing: '-0.01em'}}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      {props.rows.map((r, i) => (
        <div key={i} style={{position: 'absolute', top: ROW_TOP + i * ROW_GAP - 62, left: 70, height: 124, display: 'flex', alignItems: 'center', gap: 40}}>
          <PillIcon kind={r.icon} color={r.color} />
          <div style={{color: NAVY, fontSize: 50, fontWeight: 600, letterSpacing: '-0.01em'}}>{r.label}</div>
        </div>
      ))}
      {segs.map((s, i) => <Hand key={i} seg={s} p={interpolate(frame, [s.start, s.end], [0, 1], clamp)} />)}
      {underline && frame >= underline.start && (
        <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={`M ${underline.x} ${underline.y} Q ${underline.x + underline.w * 0.5} ${underline.y + 14} ${underline.x + underline.w} ${underline.y - 8}`} fill="none" stroke={RED} strokeWidth="9" strokeLinecap="round"
            pathLength={1} strokeDasharray="1" strokeDashoffset={1 - interpolate(frame, [underline.start, underline.end], [0, 1], {...clamp, easing: Easing.out(Easing.quad)})} />
        </svg>
      )}
      <Pen x={pen.x} y={pen.y} lift={pen.lift} />
      {props.sfx && segs.map((s, i) => (
        // Pen scribble trimmed to each written piece.
        <Sequence key={i} from={s.start} durationInFrames={Math.max(4, s.end - s.start)} layout="none">
          <Audio src={staticFile('sfx/scribble.wav')} volume={s.size > 100 ? 0.9 : 0.7} />
        </Sequence>
      ))}
      {props.sfx && underline && (
        <Sequence from={underline.start} durationInFrames={underline.end - underline.start + 2} layout="none">
          <Audio src={staticFile('sfx/scribble.wav')} volume={0.8} />
        </Sequence>
      )}
      {props.sfx && underline && (
        <Sequence from={underline.end} durationInFrames={45} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.35} /></Sequence>
      )}
      {props.music && <Audio src={staticFile(props.music)} volume={props.musicVolume ?? 0.3} />}
    </AbsoluteFill>
  );
};

export const checklistDefaults: ChecklistProps = {
  title: 'IELTS 8.0+ uchun\nkunlik reja',
  rows: [
    {label: 'Speaking', answer: '15 daqiqa', icon: 'mic', color: '#8B6CF0'},
    {label: 'Writing', answer: '1 ta essay', icon: 'pen', color: '#3D7BF5'},
    {label: 'Reading', answer: '1 ta passage', icon: 'book', color: '#2FAE66'},
    {label: 'Listening', answer: '1 ta section', icon: 'headphones', color: '#FF8A2B'},
  ],
  footer: {lead: 'Hammasi bitta saytda:', brand: 'goprep.gg'},
  sfx: true,
};
