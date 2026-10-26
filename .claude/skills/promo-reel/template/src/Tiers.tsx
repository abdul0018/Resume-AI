import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {clamp, src} from './kit';

/**
 * Style J: "YOMON / YAXSHI / AJOYIB" tier reel (reference: Fikrlash / Qidirish / Kod yozish … app tiers).
 * Per topic: three white app cards appear heavily blurred under their tier labels (centre card raised);
 * as the speaker names each tier, its card snaps sharp with a pop and its label lights up
 * (YOMON red, YAXSHI yellow, AJOYIB green). A white topic pill with an emoji sits at chest height.
 * Footage untouched; only soft shadows.
 */

const FONT = "'Montserrat', 'Arial', sans-serif";
const TIER = [
  {label: 'YOMON', color: '#FF3B30', x: 215, y: 330},
  {label: 'YAXSHI', color: '#FFD60A', x: 540, y: 205},
  {label: 'AJOYIB', color: '#34C759', x: 865, y: 330},
];
const CARD = 236;

/** An app logo. `kind`: 'mask' = monochrome SVG tinted with `color` (or gradient); 'img' = full-colour image. */
export type Logo = {name: string; kind: 'mask' | 'img'; file: string; color?: string; gradient?: string; scale?: number; radius?: number};
export type Topic = {title: string; emoji?: string; start: number; logos: [Logo, Logo, Logo]; reveal: [number, number, number]};
/** overlayOnly: render just the graphics on transparent (composite onto the untouched source with ffmpeg). */
export type TiersProps = {overlayOnly?: boolean; video: string; voice?: string; voiceVolume?: number; topics: Topic[]; cues?: {file: string; at: number; vol?: number}[]; end: number};

const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {f, fps, s: (x: number) => Math.round(x * fps)}; };
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const LogoArt: React.FC<{logo: Logo; size: number}> = ({logo, size}) => {
  const sz = size * (logo.scale ?? 1);
  if (logo.kind === 'img') return <Img src={staticFile(logo.file)} style={{width: sz, height: sz, borderRadius: logo.radius ?? sz * 0.22, objectFit: 'cover'}} />;
  return (
    <div style={{width: sz, height: sz, background: logo.gradient ?? logo.color ?? '#111',
      WebkitMaskImage: `url(${staticFile(logo.file)})`, maskImage: `url(${staticFile(logo.file)})`,
      WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center'}} />
  );
};

/** One tier card: label above, white card with app name + logo; blurred until revealed. */
const TierCard: React.FC<{i: number; logo: Logo; topicAt: number; revealAt: number; out: number}> = ({i, logo, topicAt, revealAt, out}) => {
  const {f, fps, s} = useT();
  const T = TIER[i];
  const a = s(topicAt);
  if (f < a || f >= out) return null;
  const inP = spring({frame: f - a - i * 3, fps, config: {damping: 15, stiffness: 160}});
  const r = s(revealAt);
  const rev = f >= r ? spring({frame: f - r, fps, config: {damping: 9, stiffness: 260, mass: 0.6}}) : 0;
  const sharp = interpolate(f - r, [0, 6], [0, 1], {...clamp, easing: ease});
  const blur = 26 * (1 - sharp);
  const o = interpolate(f, [out - 6, out], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const lit = sharp;
  // reveal punch: overshoot scale + tiny rotation settle
  const punch = 1 + 0.12 * Math.sin(Math.min(1, rev) * Math.PI) * (1 - sharp * 0.4);
  const ring = f >= r ? interpolate(f - r, [0, 14], [0, 1], clamp) : 0;
  return (
    <div style={{position: 'absolute', left: T.x - CARD / 2, top: T.y, width: CARD, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: Math.min(1, inP * 1.5) * (1 - o), transform: `translateY(${(1 - inP) * -40}px) scale(${(0.85 + 0.15 * inP) * (1 - 0.25 * o)})`}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: '0.02em', marginBottom: 14,
        color: lit > 0.5 ? T.color : '#FFFFFF', transform: `scale(${1 + 0.18 * Math.sin(Math.min(1, rev) * Math.PI)})`,
        WebkitTextStroke: '2px rgba(0,0,0,.55)', paintOrder: 'stroke fill', textShadow: '0 3px 8px rgba(0,0,0,.45)'}}>{T.label}</div>
      <div style={{position: 'relative', width: CARD, height: CARD, transform: `scale(${punch}) rotate(${(1 - sharp) * (i === 0 ? -3 : i === 2 ? 3 : 0)}deg)`}}>
        {/* glow ring burst on reveal */}
        {ring > 0 && ring < 1 && <div style={{position: 'absolute', inset: -10 - 40 * ring, borderRadius: 36 + 30 * ring, border: `${6 * (1 - ring)}px solid ${T.color}`, opacity: 1 - ring}} />}
        <div style={{width: CARD, height: CARD, borderRadius: 26, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
          boxShadow: `0 16px 34px rgba(0,0,0,.35), 0 3px 8px rgba(0,0,0,.2)${lit > 0.5 ? `, 0 0 0 4px ${T.color}` : ''}`,
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: logo.name.length > 12 ? 19 : 24, color: '#111', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.05, padding: '0 10px'}}>{logo.name.toUpperCase()}</div>
          <LogoArt logo={logo} size={124} />
        </div>
      </div>
    </div>
  );
};

/** Topic pill: white rounded label + emoji; swaps with a squash-pop. */
const TopicPill: React.FC<{t: Topic; out: number}> = ({t, out}) => {
  const {f, fps, s} = useT();
  const a = s(t.start);
  if (f < a || f >= out) return null;
  const p = spring({frame: f - a, fps, config: {damping: 11, stiffness: 220}});
  const o = interpolate(f, [out - 5, out], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 1270, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: (1 - o) * Math.min(1, p * 1.6)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#FFFFFF', borderRadius: 30, padding: '16px 34px', boxShadow: '0 14px 30px rgba(0,0,0,.3)',
        transform: `scale(${interpolate(p, [0, 1], [0.6, 1]) * (1 - 0.2 * o)}) scaleY(${1 + 0.08 * Math.sin(p * Math.PI)})`}}>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 74, color: '#0E0E0E', letterSpacing: '-0.01em'}}>{t.title}</span>
        {t.emoji && <Img src={staticFile(t.emoji)} style={{width: 78, height: 78, transform: `rotate(${Math.sin((f - a) / 6) * 8 * Math.exp(-(f - a) / 25)}deg)`}} />}
      </div>
    </div>
  );
};

export const TiersReel: React.FC<TiersProps> = (p) => {
  const {s} = useT();
  return (
    <AbsoluteFill style={{background: p.overlayOnly ? 'transparent' : '#000'}}>
      {!p.overlayOnly && <OffthreadVideo src={src(p.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} toneMapped={false} />}
      {p.topics.map((t, ti) => {
        const out = ti < p.topics.length - 1 ? s(p.topics[ti + 1].start) : s(p.end) + 1;
        return (
          <React.Fragment key={ti}>
            {t.logos.map((lg, i) => <TierCard key={i} i={i} logo={lg} topicAt={t.start} revealAt={t.reveal[i]} out={out} />)}
            <TopicPill t={t} out={out} />
          </React.Fragment>
        );
      })}
      {p.voice && <Audio src={src(p.voice)} volume={p.voiceVolume ?? 1} />}
      {(p.cues ?? []).map((c, i) => <Sequence key={i} from={Math.max(0, s(c.at))} durationInFrames={45} layout="none"><Audio src={staticFile(c.file)} volume={c.vol ?? 1} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const tiersDuration = (p: TiersProps, fps: number) => Math.round(p.end * fps);
