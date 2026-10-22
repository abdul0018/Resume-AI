import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import '@fontsource/dm-serif-display/400.css';
import {clamp, src} from './kit';

/**
 * Style F: product showcase edit over real footage (furniture / interiors / retail).
 * Motion language from the "5 ta viral Reels" reference: 3D kinetic typography with depth extrusion,
 * letters flying through Z with motion trails, light sweeps, whip / zoom-blur transitions with flashes,
 * beat-synced punch-ins. Re-dressed for premium furniture: champagne gold + cream + ink, Oswald +
 * DM Serif Display, warm grade, floating dust, frosted-glass plates, tracked callouts on the product.
 * All timings are seconds on one global timeline (= the talking-head take's own clock).
 */

const GOLD = '#D9B36C';
const GOLD_DEEP = '#7A5A26';
const CREAM = '#F5EFE4';
const INK = '#0D0C0B';
const COND = "'Oswald', 'Arial Narrow', sans-serif";
const SERIF = "'DM Serif Display', Georgia, serif";

if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  Promise.all([`700 100px 'Oswald'`, `500 100px 'Oswald'`, `400 100px 'DM Serif Display'`].map((f) => document.fonts.load(f, 'AaO‘')))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}

/* ------------------------------------------------------------------ types */

export type Shot = {src: string; from: number; to: number; srcStart?: number; rate?: number; follow?: boolean; still?: string; zoom?: [number, number]; origin?: string; trans?: 'zoom' | 'whipL' | 'whipR' | 'cut'};
export type Title = {at: number; out: number; kind: 'fly3d' | 'slab' | 'serif' | 'small'; text: string; y: number; size?: number; tilt?: number; color?: string};
export type Callout = {at: number; out: number; label: string; track: [number, number, number][]; side: 'left' | 'right'; y: number};
export type Swatch = {at: number; out: number; y: number; colors: string[]; words: {at: number; text: string}[]; stamp?: {at: number; text: string}};
export type FurnitureProps = {
  shots: Shot[]; titles: Title[]; callouts?: Callout[]; swatches?: Swatch[];
  cta?: {at: number; text: string; sub?: string};
  punches?: number[]; voice?: string; music?: string; musicVol?: number; musicVolOpen?: number; voiceEnd?: number; end: number; sfx?: boolean;
  /** Product hero ending: music offset (s trimmed from the file start), bass section start, beat bumps, letterbox. */
  musicOffset?: number; hero?: {at: number; until: number; vol?: number; bpm?: number};
};

/* ------------------------------------------------------------------ helpers */

const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {f, fps, sec: f / fps, s: (x: number) => Math.round(x * fps)}; };
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Inline SVG filters for directional motion blur (whips) - referenced from CSS `filter: url(#...)`. */
const Filters: React.FC<{blurX: number; blurY: number}> = ({blurX, blurY}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="dirblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={`${blurX} ${blurY}`} /></filter>
  </svg>
);

/* ------------------------------------------------------------------ footage */

const TRANS = 7; // frames on each side of a cut

const shots_dir = (sh: Shot) => (Math.round(sh.from * 10) % 2 === 0 ? 1 : -1);

const ShotView: React.FC<{shot: Shot; prev?: Shot; next?: Shot; punches: number[]; bumps?: number[]}> = ({shot, next, punches, bumps = []}) => {
  const {f, fps, s} = useT();
  const a = s(shot.from); const b = s(shot.to);
  const local = f - a;
  const [z0, z1] = shot.zoom ?? [1.0, 1.08];
  let scale = interpolate(f, [a, b], [z0, z1], {...clamp, easing: inOut});
  // beat punch-ins: quick 7% snap that relaxes over ~10 frames
  punches.forEach((p) => { const d = f - s(p); if (d >= 0 && d < 14 && f >= a && f < b) scale *= 1 + 0.07 * Math.exp(-d / 5); });
  // bass bumps: a small kick-synced pulse in the hero section
  bumps.forEach((p) => { const d = f - s(p); if (d >= 0 && d < 10) scale *= 1 + 0.028 * Math.exp(-d / 3); });
  let tx = 0; let blur = 0; let dirX = 0;
  const rot = interpolate(f, [a, b], [-1.2, 1.2], clamp) * (shots_dir(shot) as number);
  // incoming
  const tin = shot.trans ?? 'zoom';
  if (local < TRANS && tin !== 'cut') {
    const k = 1 - local / TRANS;
    if (tin === 'zoom') { scale *= 1 + 0.35 * k * k; blur = 18 * k; }
    // whip: travel + overscale so the frame edge never shows, directional blur sells the speed
    else { tx = (tin === 'whipL' ? 1 : -1) * 26 * k * k; dirX = 70 * k; scale *= 1 + 0.6 * k; }
  }
  // outgoing (mirrors the next shot's transition)
  const tout = next?.trans ?? 'zoom';
  if (next && tout !== 'cut' && f > b - TRANS) {
    const k = (f - (b - TRANS)) / TRANS;
    if (tout === 'zoom') { scale *= 1 + 0.45 * k * k; blur = Math.max(blur, 18 * k); }
    else { tx = (tout === 'whipL' ? -1 : 1) * 26 * k * k; dirX = Math.max(dirX, 70 * k); scale *= 1 + 0.6 * k; }
  }
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};
  const srcStartF = Math.round((shot.srcStart ?? (shot.follow ? shot.from : 0)) * fps);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Filters blurX={dirX} blurY={0} />
      <AbsoluteFill style={{transform: `translateX(${tx}%) scale(${scale}) rotate(${rot}deg)`, transformOrigin: shot.origin ?? '50% 50%',
        filter: `${dirX > 0.5 ? 'url(#dirblur) ' : ''}${blur > 0.3 ? `blur(${blur}px) ` : ''}contrast(1.08) saturate(1.06) brightness(1.02)`}}>
        {shot.still ? <Img src={src(shot.still)} style={style} /> : (
          <Sequence from={a - TRANS} layout="none">
            <OffthreadVideo src={src(shot.src)} muted startFrom={Math.max(0, srcStartF - TRANS)} playbackRate={shot.rate ?? 1} style={style} />
          </Sequence>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ atmosphere */

const Grade: React.FC = () => (
  <>
    {/* warm split-tone + vignette */}
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,214,150,.07), rgba(40,25,10,.10))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)'}} />
  </>
);

const Dust: React.FC = () => {
  const {f} = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 38}, (_, i) => {
        const x = (random(`dx${i}`) * 1080 + f * (0.3 + random(`dv${i}`) * 0.8)) % 1100;
        const y = (random(`dy${i}`) * 1920 - f * (0.6 + random(`du${i}`) * 1.2) + 4000) % 1960;
        const r = 1.5 + random(`dr${i}`) * 3.5;
        const near = random(`dn${i}`) > 0.8;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * (near ? 3 : 1), height: r * (near ? 3 : 1), borderRadius: '50%', background: GOLD,
          opacity: (near ? 0.25 : 0.5) * (0.5 + 0.5 * Math.sin(f / 14 + i)), filter: near ? 'blur(3px)' : undefined, boxShadow: `0 0 ${r * 3}px ${GOLD}`}} />;
      })}
    </AbsoluteFill>
  );
};

/** Gold flash on cuts (soft, additive). */
const CutFlash: React.FC<{cuts: number[]}> = ({cuts}) => {
  const {f, s} = useT();
  const o = Math.max(0, ...cuts.map((c) => interpolate(f - s(c), [-2, 0, 5], [0, 0.55, 0], clamp)));
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, rgba(255,236,200,${o}) 0%, rgba(217,179,108,${o * 0.6}) 45%, rgba(0,0,0,0) 80%)`, mixBlendMode: 'screen'}} />;
};

/* ------------------------------------------------------------------ typography */

/** Extruded 3D word: dark-gold depth layers + gradient face + travelling light sweep. */
const Extruded: React.FC<{text: string; size: number; color?: string; sweep: number; depth?: number}> = ({text, size, color, sweep, depth = 12}) => {
  const shadow = Array.from({length: depth}, (_, i) => `${(i + 1) * 0.55}px ${(i + 1) * 0.85}px 0 ${i < depth - 1 ? GOLD_DEEP : 'rgba(0,0,0,.55)'}`).join(',') + `, 0 ${depth * 1.6}px ${depth * 2.2}px rgba(0,0,0,.55)`;
  const base: React.CSSProperties = {fontFamily: COND, fontWeight: 700, fontSize: size, lineHeight: 0.92, letterSpacing: '-0.01em', textTransform: 'uppercase', whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <div style={{...base, color: GOLD_DEEP, textShadow: shadow}}>{text}</div>
      <div style={{...base, position: 'absolute', inset: 0, backgroundImage: color ? `linear-gradient(180deg, ${color}, ${color})` : `linear-gradient(180deg, #FFFFFF 0%, ${CREAM} 55%, #E8D9BC 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{text}</div>
      {/* light sweep */}
      <div style={{...base, position: 'absolute', inset: 0, color: 'transparent', backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 140 - 40}%, rgba(255,246,220,.95) ${sweep * 140 - 25}%, rgba(255,255,255,0) ${sweep * 140 - 10}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text'}}>{text}</div>
    </div>
  );
};

/** Letters fly in from deep Z with a ghost trail (fake motion blur), on a tilted 3D plane that keeps drifting. */
const Fly3D: React.FC<{t: Title}> = ({t}) => {
  const {f, s} = useT();
  const a = s(t.at); const o = s(t.out);
  const size = t.size ?? 150;
  const letters = [...t.text];
  const drift = interpolate(f, [a, o], [0, 1], clamp);
  const outK = interpolate(f, [o - 8, o], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const tilt = t.tilt ?? -18;
  return (
    <div style={{position: 'absolute', top: `${t.y}%`, left: 0, right: 0, display: 'flex', justifyContent: 'center', perspective: 1300}}>
      <div style={{display: 'flex', transformStyle: 'preserve-3d', transform: `rotateY(${tilt + drift * 10}deg) rotateX(${14 - drift * 6}deg) rotateZ(${-4 + drift * 2}deg) scale(${1 + drift * 0.06}) translateZ(${outK * 900}px)`, opacity: 1 - outK}}>
        {letters.map((ch, i) => {
          const d = f - a - i * 1.4;
          const k = interpolate(d, [0, 11], [0, 1], {...clamp, easing: ease});
          if (d < -1) return <span key={i} style={{opacity: 0, fontSize: size, fontFamily: COND, fontWeight: 700}}>{ch === ' ' ? ' ' : ch}</span>;
          const z = (1 - k) * -1600; const y = (1 - k) * 120; const rx = (1 - k) * 70;
          const ghosts = k < 0.98 ? [0.12, 0.24, 0.36] : [];
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', transformStyle: 'preserve-3d'}}>
              {ghosts.map((g, gi) => (
                <span key={gi} style={{position: 'absolute', left: 0, top: 0, transform: `translateZ(${z - g * 900 * (1 - k)}px) translateY(${y + g * 60 * (1 - k)}px)`, opacity: 0.18 * (1 - k), filter: 'blur(4px)'}}>
                  <Extruded text={ch === ' ' ? ' ' : ch} size={size} sweep={0} depth={4} />
                </span>
              ))}
              <span style={{display: 'inline-block', transform: `translateZ(${z}px) translateY(${y}px) rotateX(${rx}deg)`, opacity: Math.min(1, k * 2.5), filter: k < 0.7 ? `blur(${(1 - k) * 8}px)` : undefined}}>
                <Extruded text={ch === ' ' ? ' ' : ch} size={size} sweep={interpolate(f, [a + 18, a + 40], [0, 1], clamp)} color={t.color} />
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Whole-word slab that slams in from huge + wide tracking to tight, with a small camera shake. */
const Slab: React.FC<{t: Title}> = ({t}) => {
  const {f, fps, s} = useT();
  const a = s(t.at); const o = s(t.out);
  const p = spring({frame: f - a, fps, config: {damping: 14, stiffness: 170, mass: 0.8}});
  const outK = interpolate(f, [o - 7, o], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const shake = f - a > 4 && f - a < 14 ? Math.sin((f - a) * 2.3) * 7 * (1 - (f - a - 4) / 10) : 0;
  const tilt = t.tilt ?? 10;
  return (
    <div style={{position: 'absolute', top: `${t.y}%`, left: 0, right: 0, display: 'flex', justifyContent: 'center', perspective: 1200, transform: `translate(${shake}px, ${-shake * 0.6}px)`}}>
      <div style={{transform: `rotateY(${tilt * (1 - p) * 3 + tilt}deg) rotateX(${8 - 4 * p}deg) scale(${interpolate(p, [0, 1], [2.6, 1]) * (1 - outK * 0.4)})`, letterSpacing: `${interpolate(p, [0, 1], [0.4, 0])}em`,
        opacity: interpolate(f - a, [0, 3], [0, 1], clamp) * (1 - outK), filter: p < 0.8 ? `blur(${(0.8 - p) * 14}px)` : outK > 0 ? `blur(${outK * 10}px)` : undefined}}>
        <Extruded text={t.text} size={t.size ?? 190} sweep={interpolate(f, [a + 10, a + 34], [0, 1], clamp)} color={t.color} depth={16} />
      </div>
    </div>
  );
};

/** Elegant serif accent (gold), masked rise per word. */
const SerifLine: React.FC<{t: Title}> = ({t}) => {
  const {f, s} = useT();
  const a = s(t.at); const o = s(t.out);
  const outK = interpolate(f, [o - 7, o], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: `${t.y}%`, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.25em', fontFamily: SERIF, fontSize: t.size ?? 92, color: t.color ?? GOLD, opacity: 1 - outK,
      textShadow: '0 2px 4px rgba(0,0,0,.6), 0 6px 30px rgba(0,0,0,.65)'}}>
      {t.text.split(' ').map((w, i) => {
        const k = interpolate(f - a - i * 5, [0, 12], [0, 1], {...clamp, easing: ease});
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.12em'}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - k) * 110}%) skewY(${(1 - k) * 8}deg)`}}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Small tracked caps line with a gold rule drawing out from the centre. */
const Small: React.FC<{t: Title}> = ({t}) => {
  const {f, s} = useT();
  const a = s(t.at); const o = s(t.out);
  const k = interpolate(f - a, [0, 12], [0, 1], {...clamp, easing: ease});
  const outK = interpolate(f, [o - 6, o], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: `${t.y}%`, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: k * (1 - outK)}}>
      <div style={{fontFamily: COND, fontWeight: 500, fontSize: t.size ?? 50, letterSpacing: `${0.5 - 0.22 * k}em`, color: t.color ?? CREAM, textTransform: 'uppercase', textShadow: '0 3px 14px rgba(0,0,0,.6)'}}>{t.text}</div>
      <div style={{width: 260 * k, height: 4, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`}} />
    </div>
  );
};

const TitleView: React.FC<{t: Title}> = ({t}) => {
  const {f, s} = useT();
  if (f < s(t.at) - 2 || f > s(t.out)) return null;
  if (t.kind === 'fly3d') return <Fly3D t={t} />;
  if (t.kind === 'slab') return <Slab t={t} />;
  if (t.kind === 'serif') return <SerifLine t={t} />;
  return <Small t={t} />;
};

/* ------------------------------------------------------------------ product motion design */

/** Callout ring + leader line + label, tracked by keyframes [sec, x%, y%]. */
const CalloutView: React.FC<{c: Callout}> = ({c}) => {
  const {f, fps, s, sec} = useT();
  if (f < s(c.at) || f > s(c.out)) return null;
  const ts = c.track.map((k) => k[0]);
  const x = interpolate(sec, ts, c.track.map((k) => k[1]), clamp) * 10.8;
  const y = interpolate(sec, ts, c.track.map((k) => k[2]), clamp) * 19.2;
  const p = spring({frame: f - s(c.at), fps, config: {damping: 13, stiffness: 160}});
  const line = interpolate(f - s(c.at), [4, 14], [0, 1], {...clamp, easing: ease});
  const outK = interpolate(f, [s(c.out) - 6, s(c.out)], [0, 1], clamp);
  const lx = c.side === 'left' ? 120 : 960; const ly = c.y * 19.2;
  const ex = x + (lx - x) * line; const ey = y + (ly - y) * line;
  return (
    <AbsoluteFill style={{opacity: 1 - outK}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={x} cy={y} r={46 * p} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={11} />
        <circle cx={x} cy={y} r={46 * p} fill="none" stroke={CREAM} strokeWidth={5} />
        <circle cx={x} cy={y} r={46 * p + 16 + 10 * Math.sin(f / 6)} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5} />
        <circle cx={x} cy={y} r={9 * p} fill={CREAM} />
        <line x1={x} y1={y} x2={ex} y2={ey} stroke="rgba(0,0,0,.45)" strokeWidth={9} strokeLinecap="round" />
        <line x1={x} y1={y} x2={ex} y2={ey} stroke={CREAM} strokeWidth={4} strokeLinecap="round" />
      </svg>
      {line > 0.95 && (
        <div style={{position: 'absolute', top: ly - 50, ...(c.side === 'left' ? {left: 60} : {right: 60}), padding: '14px 30px', borderRadius: 18, background: 'rgba(13,12,11,.55)', backdropFilter: 'blur(14px)',
          border: `2px solid ${GOLD}`, fontFamily: COND, fontWeight: 700, fontSize: 58, color: CREAM, letterSpacing: '0.04em',
          transform: `scale(${spring({frame: f - s(c.at) - 13, fps, config: {damping: 12, stiffness: 200}})})`, transformOrigin: c.side === 'left' ? '0% 50%' : '100% 50%'}}>
          {c.label}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Colour swatches that pop on a frosted plate, a word per beat, then a stamp. */
const SwatchView: React.FC<{sw: Swatch}> = ({sw}) => {
  const {f, fps, s} = useT();
  if (f < s(sw.at) - 2 || f > s(sw.out)) return null;
  const outK = interpolate(f, [s(sw.out) - 7, s(sw.out)], [0, 1], clamp);
  const plate = spring({frame: f - s(sw.at), fps, config: {damping: 15, stiffness: 150}});
  const word = [...sw.words].reverse().find((w) => f >= s(w.at));
  const stamp = sw.stamp && f >= s(sw.stamp.at) ? spring({frame: f - s(sw.stamp.at), fps, config: {damping: 9, stiffness: 220}}) : 0;
  return (
    <div style={{position: 'absolute', top: `${sw.y}%`, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - outK, transform: `translateY(${outK * -60}px)`}}>
      <div style={{padding: '34px 44px 30px', borderRadius: 36, background: 'rgba(13,12,11,.5)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(245,239,228,.25)',
        transform: `scale(${plate}) rotateX(${(1 - plate) * 40}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, minWidth: 760}}>
        <div style={{display: 'flex', gap: 22}}>
          {sw.colors.map((c, i) => {
            const k = spring({frame: f - s(sw.at) - 4 - i * 4, fps, config: {damping: 10, stiffness: 230}});
            return <div key={i} style={{width: 132, height: 132, borderRadius: 66, background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.55), ${c} 45%)`, border: '4px solid rgba(255,255,255,.85)', boxShadow: '0 12px 30px rgba(0,0,0,.45)', transform: `scale(${k}) translateY(${(1 - k) * 40}px)`}} />;
          })}
        </div>
        <div style={{height: 96, position: 'relative', width: '100%', display: 'flex', justifyContent: 'center'}}>
          {word && (
            <div key={word.text} style={{fontFamily: COND, fontWeight: 700, fontSize: 88, color: CREAM, letterSpacing: '0.02em', textTransform: 'uppercase',
              transform: `translateY(${(1 - interpolate(f - s(word.at), [0, 8], [0, 1], {...clamp, easing: ease})) * 40}px)`, opacity: interpolate(f - s(word.at), [0, 5], [0, 1], clamp)}}>{word.text}</div>
          )}
        </div>
      </div>
      {sw.stamp && stamp > 0 && (
        <div style={{marginTop: 30, padding: '14px 34px', borderRadius: 14, background: GOLD, color: INK, fontFamily: COND, fontWeight: 700, fontSize: 64, letterSpacing: '0.03em',
          transform: `scale(${interpolate(stamp, [0, 1], [2.2, 1])}) rotate(${-4 + (1 - stamp) * -10}deg)`, boxShadow: '0 16px 40px rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', gap: 16}}>
          <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
          {sw.stamp.text}
        </div>
      )}
    </div>
  );
};

/** End call to action: dim + blur the frame, slab title, bouncing location pin, serif sub. */
const CTA: React.FC<{at: number; text: string; sub?: string}> = ({at, text, sub}) => {
  const {f, fps, s} = useT();
  if (f < s(at)) return null;
  const k = interpolate(f - s(at), [0, 14], [0, 1], clamp);
  const pin = spring({frame: f - s(at) - 10, fps, config: {damping: 8, stiffness: 180}});
  const bob = Math.sin((f - s(at)) / 7) * 8 * Math.min(1, (f - s(at)) / 30);
  return (
    <>
      <AbsoluteFill style={{background: `rgba(10,9,8,${0.5 * k})`, backdropFilter: `blur(${10 * k}px)`}} />
      <div style={{position: 'absolute', top: '27%', left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${bob - (1 - pin) * 200}px) scale(${pin})`}}>
        <svg width={170} height={210} viewBox="0 0 24 30">
          <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3D79B" /><stop offset="1" stopColor="#B88A3E" /></linearGradient></defs>
          <path d="M12 1C6.5 1 2.5 5 2.5 10.3 2.5 17.5 12 28 12 28s9.5-10.5 9.5-17.7C21.5 5 17.5 1 12 1z" fill="url(#pg)" stroke="#fff" strokeWidth={0.8} />
          <circle cx={12} cy={10.5} r={3.6} fill={INK} />
        </svg>
      </div>
      <Slab t={{at, out: 9999, kind: 'slab', text, y: 42, size: 168, tilt: -6}} />
      {sub && <SerifLine t={{at: at + 0.55, out: 9999, kind: 'serif', text: sub, y: 56, size: 96}} />}
    </>
  );
};

/** Hero section dressing: cinematic letterbox bars slide in on the drop, kick-synced vignette pulse, drop flash. */
const HeroFX: React.FC<{at: number; until: number; bumps: number[]}> = ({at, until, bumps}) => {
  const {f, s} = useT();
  if (f < s(at) - 1 || f > s(until) + 12) return null;
  const inK = interpolate(f, [s(at), s(at) + 10], [0, 1], {...clamp, easing: ease});
  const outK = interpolate(f, [s(until), s(until) + 12], [0, 1], {...clamp, easing: inOut});
  const bar = 150 * inK * (1 - outK);
  const pulse = Math.max(0, ...bumps.map((b) => { const d = f - s(b); return d >= 0 && d < 10 ? Math.exp(-d / 3) : 0; }));
  const flash = interpolate(f - s(at), [0, 8], [0.85, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.18 + 0.22 * pulse}) 100%)`}} />
      {flash > 0 && <AbsoluteFill style={{background: '#FFF6E6', opacity: flash}} />}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: bar, background: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: bar, background: '#000'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ composition */

export const FurnitureReel: React.FC<FurnitureProps> = (p) => {
  const {f, s, fps} = useT();
  const shots = p.shots;
  const cuts = shots.slice(1).filter((x) => x.trans !== 'cut').map((x) => x.from);
  const sfx: {f: number; file: string; vol: number; d?: number}[] = [];
  if (p.sfx) {
    cuts.forEach((c) => sfx.push({f: s(c) - 10, file: 'whoosh', vol: 0.5}));
    p.titles.forEach((t) => {
      if (t.kind === 'slab') sfx.push({f: s(t.at) + 3, file: 'impact', vol: 0.45});
      if (t.kind === 'fly3d') sfx.push({f: s(t.at), file: 'whoosh', vol: 0.35});
      if (t.kind === 'serif') sfx.push({f: s(t.at), file: 'chime', vol: 0.25});
      if (t.kind === 'small') sfx.push({f: s(t.at), file: 'pop', vol: 0.3});
    });
    (p.callouts ?? []).forEach((c) => { sfx.push({f: s(c.at), file: 'pop', vol: 0.45}); sfx.push({f: s(c.at) + 13, file: 'pop', vol: 0.3}); });
    (p.swatches ?? []).forEach((sw) => {
      sw.colors.forEach((_, i) => sfx.push({f: s(sw.at) + 4 + i * 4, file: 'pop', vol: 0.32}));
      sw.words.forEach((w) => sfx.push({f: s(w.at), file: 'tick', vol: 0.4}));
      if (sw.stamp) sfx.push({f: s(sw.stamp.at) + 3, file: 'impact', vol: 0.4});
    });
    if (p.hero) sfx.push({f: s(p.hero.at), file: 'impact', vol: 0.55});
    if (p.cta) { sfx.push({f: s(p.cta.at) + 3, file: 'impact', vol: 0.5}); sfx.push({f: s(p.cta.at) + 14, file: 'ding', vol: 0.35}); }
  }
  // Music: louder where there is no voice, ducked under speech.
  const vEnd = p.voiceEnd ?? p.end;
  // kick grid of the hero section (beats 1, 2.75, 3.5 of every bar, matching tools/music.py)
  const bumps: number[] = [];
  if (p.hero) {
    const beat = 60 / (p.hero.bpm ?? 120);
    for (let t0 = p.hero.at; t0 < p.hero.until - 0.01; t0 += 4 * beat) [0, 1.75, 2.5].forEach((k) => bumps.push(t0 + k * beat));
  }
  const musicVol = (fr: number) => {
    const t = fr / fps;
    const v = interpolate(t, [0, 0.6, vEnd - 0.2, vEnd + 0.4], [p.musicVolOpen ?? 0.3, p.musicVol ?? 0.17, p.musicVol ?? 0.17, 0.45], clamp);
    // the hero drop takes the music up to full level
    return p.hero && t >= p.hero.at - 0.05 ? (p.hero.vol ?? 0.75) : v;
  };
  return (
    <AbsoluteFill style={{background: INK}}>
      {shots.map((sh, i) => {
        if (f < s(sh.from) - TRANS || f >= s(sh.to) + (i < shots.length - 1 ? 0 : 1)) return null;
        // during the incoming half of a transition only the new shot is visible (cut sits at `from`)
        if (f < s(sh.from)) return null;
        return <ShotView key={i} shot={sh} prev={shots[i - 1]} next={shots[i + 1]} punches={p.punches ?? []} bumps={bumps} />;
      })}
      <Grade />
      <Dust />
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {(p.callouts ?? []).map((c, i) => <CalloutView key={i} c={c} />)}
        {(p.swatches ?? []).map((sw, i) => <SwatchView key={i} sw={sw} />)}
        {p.titles.map((t, i) => <TitleView key={i} t={t} />)}
        {p.cta && <CTA {...p.cta} />}
      </AbsoluteFill>
      <CutFlash cuts={cuts} />
      {p.hero && <HeroFX at={p.hero.at} until={p.hero.until} bumps={bumps} />}
      {p.voice && <Audio src={src(p.voice)} />}
      {p.music && <Audio src={staticFile(p.music)} startFrom={Math.round((p.musicOffset ?? 0) * fps)} volume={musicVol} />}
      {sfx.map((e, i) => (
        <Sequence key={i} from={Math.max(0, e.f)} durationInFrames={e.d ?? 40} layout="none"><Audio src={staticFile(`sfx/${e.file}.wav`)} volume={e.vol} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const furnitureDuration = (p: FurnitureProps, fps: number) => Math.round(p.end * fps);
