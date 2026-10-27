import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {ICONS} from './Resources';
import {clamp, src} from './kit';

/**
 * Style I: "level ladder" talking head (reference: "Agar bu kerak bo'lsa → bundan foydalaning").
 * Left hand up → a score card (IELTS 5.0 / 6.0 / 7.0) pops top-left; right hand up → the resource for that level
 * pops top-right; word-by-word white captions at chest height. Finale: the target score card lands in the centre,
 * then the hero resource (big icon) with a bass hit. One continuous take, footage untouched.
 */

const FONT = "'Montserrat', 'Arial', sans-serif";
const RED = '#E3262D';

/* ------------------------------------------------------------------ original icons */

const Tile: React.FC<{children: React.ReactNode; bg: string}> = ({children, bg}) => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <defs><clipPath id="lt"><rect width="240" height="240" rx="52" /></clipPath>
      <linearGradient id={`lg${bg.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
    <g clipPath="url(#lt)"><rect width="240" height="240" fill={bg} />{children}<rect width="240" height="130" fill={`url(#lg${bg.slice(1)})`} /></g>
    <rect x="1.5" y="1.5" width="237" height="237" rx="51" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="3" />
  </svg>
);

export const LADDER_ICONS: Record<string, React.FC> = {
  // Original green owl (language-app style).
  owl: () => (
    <Tile bg="#58C322">
      <path d="M48 70 Q60 40 84 58 L120 52 L156 58 Q180 40 192 70 L196 150 Q196 206 120 210 Q44 206 44 150 Z" fill="#7BD93E" />
      <circle cx="88" cy="112" r="34" fill="#fff" /><circle cx="152" cy="112" r="34" fill="#fff" />
      <circle cx="96" cy="114" r="15" fill="#1B1B1B" /><circle cx="144" cy="114" r="15" fill="#1B1B1B" />
      <circle cx="101" cy="108" r="5" fill="#fff" /><circle cx="149" cy="108" r="5" fill="#fff" />
      <path d="M106 146 Q120 138 134 146 L120 168 Z" fill="#FFB020" />
      <path d="M70 196 Q84 186 96 198 M144 198 Q156 186 170 196" stroke="#4BA51B" strokeWidth="8" fill="none" strokeLinecap="round" />
    </Tile>
  ),
  // IELTS Liz: red tile, white wordmark + "Liz" plate.
  liz: () => (
    <Tile bg="#D8231E">
      <text x="120" y="112" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="62" fill="#fff" letterSpacing="1">IELTS</text>
      <rect x="70" y="132" width="100" height="62" rx="10" fill="#fff" />
      <text x="120" y="180" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="50" fill="#D8231E">Liz</text>
    </Tile>
  ),
  engnovate: () => <>{React.createElement(ICONS.engnovate)}</>,
  goprep: () => (
    <Tile bg="#FFFFFF">
      <path d="M178 0 H240 V240 H178 Q214 120 178 0 Z" fill="#F0531C" />
      <circle cx="80" cy="112" r="18" fill="#141414" /><circle cx="148" cy="112" r="18" fill="#141414" />
      <path d="M98 146 Q114 160 130 146" stroke="#141414" strokeWidth="10" fill="none" strokeLinecap="round" />
      <text x="114" y="206" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="26" fill="#141414">GoPrep<tspan fill="#F0531C">.gg</tspan></text>
    </Tile>
  ),
};

/** Score card: white card, red top band "IELTS", big red score; a small level bar under it. */
const ScoreCard: React.FC<{score: string; w: number}> = ({score, w}) => {
  const v = parseFloat(score);
  return (
    <div style={{width: w, borderRadius: w * 0.14, overflow: 'hidden', background: '#fff', boxShadow: CLEAN ? undefined : '0 14px 30px rgba(0,0,0,.30), 0 3px 8px rgba(0,0,0,.18)'}}>
      <div style={{background: RED, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: w * 0.2, textAlign: 'center', padding: `${w * 0.035}px 0`, letterSpacing: '0.04em'}}>IELTS</div>
      <div style={{color: RED, fontFamily: FONT, fontWeight: 900, fontSize: w * 0.4, textAlign: 'center', lineHeight: 1.05, padding: `${w * 0.03}px 0 ${w * 0.02}px`}}>{score}</div>
      <div style={{display: 'flex', gap: w * 0.025, padding: `0 ${w * 0.1}px ${w * 0.08}px`}}>
        {[5, 6, 7, 8, 9].map((k) => <div key={k} style={{flex: 1, height: w * 0.05, borderRadius: 4, background: k <= v ? RED : '#F1D3D4'}} />)}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ types */

export type Cap = {text: string; start: number; end: number; y?: number; below?: {text: string; start: number; y: number}};
/** Icon: key of LADDER_ICONS, or a real logo image tile {img, bg?, pad?, topText?, topColor?, radius?}. */
export type LIcon = string | {img: string; bg?: string; pad?: number; topText?: string; topColor?: string; radius?: number};
export type Step = {score: string; scoreAt: number; icon: LIcon; iconAt: number; out: number};
export type LadderProps = {
  video: string; voice?: string; voiceVolume?: number; music?: string; musicVolume?: number; sfx?: boolean;
  steps: Step[]; captions: Cap[];
  finale: {score: string; scoreAt: number; icon: LIcon; iconAt: number; hit?: string};
  /** clean: no shadows anywhere (crisp outlines only). overlayOnly: graphics on transparent for ffmpeg compositing. */
  clean?: boolean; overlayOnly?: boolean;
  /** Explicit sound cues (e.g. one-shots lifted from a reference): file in public/, time in s, volume. */
  cues?: {file: string; at: number; vol?: number}[];
  end: number;
};

let CLEAN = false;

const IconEl: React.FC<{icon: LIcon}> = ({icon}) => {
  if (typeof icon === 'string') return React.createElement(LADDER_ICONS[icon]);
  return (
    <div style={{width: '100%', height: '100%', borderRadius: icon.radius ?? '22%', overflow: 'hidden', background: icon.bg ?? 'transparent', boxSizing: 'border-box', padding: icon.pad ?? 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: icon.bg === '#FFFFFF' || icon.bg === '#fff' ? '2px solid rgba(0,0,0,.08)' : undefined}}>
      {icon.topText && <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 58, lineHeight: 1, color: icon.topColor ?? RED, letterSpacing: '0.02em', marginBottom: 2}}>{icon.topText}</div>}
      <div style={{flex: 1, width: '100%', backgroundImage: `url(${staticFile(icon.img)})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}} />
    </div>
  );
};

const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {f, fps, s: (x: number) => Math.round(x * fps)}; };
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Pop-in with overshoot, slight tilt, idle float; exits with a quick shrink. */
const Pop: React.FC<{at: number; out: number; from: 'left' | 'right' | 'center'; children: React.ReactNode; style: React.CSSProperties}> = ({at, out, from, children, style}) => {
  const {f, fps, s} = useT();
  if (f < s(at) || f >= s(out)) return null;
  const p = spring({frame: f - s(at), fps, config: {damping: 11, stiffness: 220, mass: 0.7}});
  const o = interpolate(f, [s(out) - 6, s(out)], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const dx = from === 'left' ? -60 : from === 'right' ? 60 : 0;
  const rot = from === 'left' ? -12 : from === 'right' ? 12 : 0;
  const float = Math.sin((f - s(at)) / 18) * 5;
  return (
    <div style={{position: 'absolute', ...style, opacity: Math.min(1, p * 1.6) * (1 - o),
      transform: `translate(${(1 - p) * dx}px, ${(1 - p) * 30 + float}px) scale(${p * (1 - 0.35 * o)}) rotate(${(1 - p) * rot + (from === 'center' ? 0 : from === 'left' ? -3 : 3)}deg)`}}>
      {children}
    </div>
  );
};

/** Word-by-word caption: each word rises in and brightens; soft dark shadow only for legibility. */
const Caption: React.FC<{c: Cap; out: number}> = ({c, out}) => (
  <>
    <CaptionLine text={c.text} start={c.start} end={c.end} y={c.y ?? 1290} out={out} />
    {c.below && <CaptionLine text={c.below.text} start={c.below.start} end={c.end} y={c.below.y} out={out} />}
  </>
);

const CaptionLine: React.FC<{text: string; start: number; end: number; y: number; out: number}> = ({text, start, end, y, out}) => {
  const c = {text, start, end, y};
  const {f, s} = useT();
  const a = s(c.start);
  const words = c.text.split(' ');
  const dur = Math.max(1, s(c.end) - a);
  const o = interpolate(f, [out - 5, out], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: c.y ?? 1290, left: 70, right: 70, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.2, color: '#fff',
      ...(CLEAN ? {WebkitTextStroke: '6px #111', paintOrder: 'stroke fill'} : {textShadow: '0 2px 4px rgba(0,0,0,.55), 0 4px 18px rgba(0,0,0,.45)'}), opacity: 1 - o}}>
      {words.map((w, i) => {
        const t = a + (dur * 0.8 * i) / words.length;
        const k = interpolate(f - t, [0, 7], [0, 1], {...clamp, easing: ease});
        return <span key={i} style={{display: 'inline-block', marginRight: '0.26em', transform: `translateY(${(1 - k) * 22}px) scale(${0.9 + 0.1 * k})`, opacity: k}}>{w}</span>;
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ composition */

export const LadderReel: React.FC<LadderProps> = (p) => {
  const {f, s} = useT();
  CLEAN = !!p.clean;
  const fin = p.finale;
  const sfx: {f: number; file: string; vol: number}[] = [];
  if (p.sfx) {
    p.steps.forEach((st) => { sfx.push({f: s(st.scoreAt), file: 'sfx/pop.wav', vol: 0.18}); sfx.push({f: s(st.iconAt), file: 'sfx/pop.wav', vol: 0.22}); });
    sfx.push({f: s(fin.scoreAt), file: 'sfx/pop.wav', vol: 0.22});
  }
  const capIdx = p.captions.reduce((acc, c, i) => (f >= s(c.start) - 3 ? i : acc), -1);
  const cap = capIdx >= 0 ? p.captions[capIdx] : null;
  const capOut = cap ? Math.min(s(cap.end) + 8, p.captions[capIdx + 1] ? s(p.captions[capIdx + 1].start) - 3 : 1e6) : 0;
  return (
    <AbsoluteFill style={{background: p.overlayOnly ? 'transparent' : '#000'}}>
      {!p.overlayOnly && <OffthreadVideo src={src(p.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} toneMapped={false} />}
      {p.steps.map((st, i) => (
        <React.Fragment key={i}>
          <Pop at={st.scoreAt} out={st.out} from="left" style={{left: 56, top: 250}}><ScoreCard score={st.score} w={250} /></Pop>
          <Pop at={st.iconAt} out={st.out} from="right" style={{right: 56, top: 250, width: 270, height: 270, filter: CLEAN ? undefined : 'drop-shadow(0 14px 22px rgba(0,0,0,.32))'}}>
            <IconEl icon={st.icon} />
          </Pop>
        </React.Fragment>
      ))}
      <Pop at={fin.scoreAt} out={fin.iconAt} from="center" style={{left: 400, top: 1440}}><ScoreCard score={fin.score} w={280} /></Pop>
      <Pop at={fin.iconAt} out={p.end + 1} from="center" style={{left: 340, top: 1120, width: 400, height: 400, filter: CLEAN ? undefined : 'drop-shadow(0 18px 30px rgba(0,0,0,.35))'}}>
        <IconEl icon={fin.icon} />
      </Pop>
      {cap && f < capOut && <Caption key={capIdx} c={cap} out={capOut} />}
      {p.voice && <Audio src={src(p.voice)} volume={p.voiceVolume ?? 1} />}
      {p.music && <Audio src={staticFile(p.music)} volume={p.musicVolume ?? 0.3} />}
      {fin.hit && <Sequence from={s(fin.iconAt)} durationInFrames={30} layout="none"><Audio src={staticFile(fin.hit)} volume={1} /></Sequence>}
      {(p.cues ?? []).map((c, i) => <Sequence key={`c${i}`} from={Math.max(0, s(c.at))} durationInFrames={45} layout="none"><Audio src={staticFile(c.file)} volume={c.vol ?? 1} /></Sequence>)}
      {sfx.map((e, i) => <Sequence key={i} from={Math.max(0, e.f)} durationInFrames={20} layout="none"><Audio src={staticFile(e.file)} volume={e.vol} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const ladderDuration = (p: LadderProps, fps: number) => Math.round(p.end * fps);
