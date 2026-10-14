import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
// Bundled variable font (latin, latin-ext, cyrillic): no network needed at render time,
// and the weight axis can be animated (see CtaKeyword).
import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/inter-tight/wght-italic.css';

export const FONT = "'Inter Tight Variable', 'Inter Tight', 'Montserrat', sans-serif";

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading Inter Tight');
  Promise.all(['normal 800 1em', 'italic 500 1em'].map((f) => document.fonts.load(`${f} 'Inter Tight Variable'`, 'Aa‘ЯЎ')))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}

export const C = {orange: '#FF6B12', ink: '#1B1B1B', board: '#F7F7F5', white: '#FFFFFF'};
export const HERO_BG = 'radial-gradient(circle at 70% 95%, #FF8A00 0%, #FF6B12 45%, #D9400B 100%)';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const src = (s: string) => (/^https?:/.test(s) ? s : staticFile(s));
const isVideo = (s: string) => /\.(mp4|mov|webm)$/i.test(s);

/** Full-bleed photo/clip with a slow Ken Burns zoom. */
export const Media: React.FC<{src: string; dur: number; zoomTo?: number; origin?: string; startFrom?: number}> = ({src: s, dur, zoomTo = 1.08, origin = '50% 40%', startFrom = 0}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, dur], [1, zoomTo], clamp);
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: origin};
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      {isVideo(s) ? <OffthreadVideo src={src(s)} muted startFrom={startFrom} style={style} /> : <Img src={src(s)} style={style} />}
    </AbsoluteFill>
  );
};

/** Signature move: words drop in one by one with fade + blur + slight scale. */
export const WordReveal: React.FC<{text: string; delay?: number; stagger?: number; style?: React.CSSProperties; dim?: number[]; slide?: number[]; align?: 'center' | 'flex-start'}> = ({text, delay = 0, stagger = 5, style, dim = [], slide = [], align = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align, columnGap: '0.22em', lineHeight: 1.0, ...style}}>
      {text.split(' ').map((w, i) => {
        const f = frame - delay - i * stagger;
        const p = spring({frame: Math.max(0, f), fps, config: {damping: 15, stiffness: 170, mass: 0.7}});
        const op = interpolate(f, [0, 5], [0, 1], clamp) * (dim.includes(i) ? 0.5 : 1);
        const blur = interpolate(f, [0, 7], [10, 0], clamp);
        // `slide` words come in from the lower right (the "emas" move) instead of dropping from above.
        const fromSide = slide.includes(i);
        const dx = fromSide ? interpolate(p, [0, 1], [0.6, 0]) : 0;
        const dy = interpolate(p, [0, 1], [fromSide ? 0.5 : -0.45, 0]);
        const sc = interpolate(p, [0, 1], [0.88, 1]);
        return (
          <span key={i} style={{display: 'inline-block', opacity: op, filter: `blur(${blur}px)`, transform: `translate(${dx}em, ${dy}em) scale(${sc})`}}>{w}</span>
        );
      })}
    </div>
  );
};

/** Letter-by-letter reveal for italic sublines. */
export const CharReveal: React.FC<{text: string; delay?: number; perChar?: number; style?: React.CSSProperties}> = ({text, delay = 0, perChar = 1.4, style}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', justifyContent: 'center', lineHeight: 1.05, ...style}}>
      {[...text].map((ch, i) => {
        const f = frame - delay - i * perChar;
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: interpolate(f, [0, 6], [0, 1], clamp), filter: `blur(${interpolate(f, [0, 6], [6, 0], clamp)}px)`, transform: `translateX(${interpolate(f, [0, 8], [0.3, 0], clamp)}em)`}}>{ch}</span>
        );
      })}
    </div>
  );
};

/** Orange label box that grows as words are added. */
export const HighlightCaption: React.FC<{text: string; delay?: number; stagger?: number; fontSize?: number}> = ({text, delay = 0, stagger = 5, fontSize = 46}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const shown = words.filter((_, i) => frame >= delay + i * stagger);
  if (shown.length === 0) return null;
  return (
    <div style={{display: 'inline-flex', gap: '0.25em', background: C.orange, color: C.white, fontWeight: 700, fontSize, padding: '6px 18px', borderRadius: 4, letterSpacing: '-0.01em'}}>
      {shown.map((w, i) => (
        <span key={i} style={{opacity: interpolate(frame - delay - i * stagger, [0, 5], [0, 1], clamp)}}>{w}</span>
      ))}
    </div>
  );
};

/** White pill with a pointer that pops over a head. x/y = pointer tip in % of the frame. */
export const YearTag: React.FC<{label: string; x: number; y: number; at: number}> = ({label, x, y, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: '50% 100%'}}>
      <div style={{background: C.white, color: C.ink, fontWeight: 700, fontSize: 44, padding: '4px 22px', borderRadius: 16, boxShadow: '0 6px 18px rgba(0,0,0,.18)'}}>{label}</div>
      <div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: `12px solid ${C.white}`}} />
    </div>
  );
};

export const GridBoard: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: C.board, backgroundImage: 'linear-gradient(rgba(0,0,0,.045) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,.045) 2px, transparent 2px)', backgroundSize: '72px 72px'}}>{children}</AbsoluteFill>
);

/** Dark browser window that springs in, slightly tilted. */
export const BrowserMockup: React.FC<{image: string; at: number; width?: number}> = ({image, at, width = 860}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 140}});
  return (
    <div style={{width, position: 'relative', background: '#2A2A2A', borderRadius: 12, padding: '36px 10px 10px', boxShadow: '0 30px 60px rgba(0,0,0,.25)', transform: `scale(${interpolate(p, [0, 1], [0.15, 1])}) rotate(${interpolate(p, [0, 1], [8, 2])}deg)`}}>
      <div style={{position: 'absolute', top: 12, left: 14, display: 'flex', gap: 8}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />)}
      </div>
      <Img src={src(image)} style={{width: '100%', display: 'block', borderRadius: 4}} />
    </div>
  );
};

/** Small orange dots bursting outward (pre-CTA accent). */
export const Sparks: React.FC<{at: number; count?: number; radius?: number}> = ({at, count = 8, radius = 240}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 26) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {Array.from({length: count}).map((_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const d = interpolate(f, [0, 20], [0, radius * (0.5 + random(`d${i}`) * 0.5)], {...clamp, easing: Easing.out(Easing.cubic)});
        return <div key={i} style={{position: 'absolute', width: 12, height: 12, borderRadius: 6, background: C.orange, opacity: interpolate(f, [14, 26], [1, 0], clamp), transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`}} />;
      })}
    </AbsoluteFill>
  );
};

/** Warm light-leak flash over the last frames of a beat (paper -> computer transition). */
export const LightLeak: React.FC<{dur: number; frames?: number; color?: string}> = ({dur, frames = 6, color = '255,170,60'}) => {
  const f = useCurrentFrame() - (dur - frames);
  if (f < 0) return null;
  const k = interpolate(f, [0, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', background: `radial-gradient(circle at 50% 100%, rgba(${color},${0.95 * k}) 0%, rgba(255,240,220,${0.7 * k}) 45%, rgba(255,255,255,${0.35 * k}) 100%)`}} />
  );
};

/** Final keyword: thin + wide-spaced -> heavy + tight, with fade + blur + pop. */
export const CtaKeyword: React.FC<{text: string; at: number; fontSize?: number}> = ({text, at, fontSize = 190}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;
  const p = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  return (
    <div style={{color: C.orange, fontWeight: Math.round(interpolate(f, [0, 14], [300, 900], {...clamp, easing: Easing.out(Easing.cubic)})), fontSize, lineHeight: 1, letterSpacing: `${interpolate(f, [0, 14], [0.35, -0.01], {...clamp, easing: Easing.out(Easing.cubic)})}em`, opacity: interpolate(f, [0, 8], [0, 1], clamp), filter: `blur(${interpolate(f, [0, 8], [8, 0], clamp)}px)`, transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`}}>
      {`“${text}”`}
    </div>
  );
};
