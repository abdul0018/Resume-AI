import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {clamp, src} from './kit';

/**
 * Style G: "resources by level" talking-head reel (reference: "IELTSga tayyorgarlik – Band 5.5–6.5 /
 * Band 7.0–9.0"). The speaker raises the left hand, a resource icon pops on that side; raises the right
 * hand, the higher-level resource pops on the other side; the section word changes per skill.
 * The footage is NEVER graded: only a soft top shadow for legibility. Icons are original vector tiles.
 */

const RED = '#EE3A2F';
const FONT = "'Montserrat', 'Arial Black', sans-serif";

if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  Promise.all(['900 80px Montserrat', '800 80px Montserrat', '700 80px Montserrat'].map((f) => document.fonts.load(f, 'AaO‘5.')))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}

/* ------------------------------------------------------------------ original icon tiles (SVG, 240x240) */

const Tile: React.FC<{bg: string; children: React.ReactNode; border?: string}> = ({bg, children, border}) => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <defs>
      <linearGradient id={`gl${bg.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <clipPath id="rr"><rect width="240" height="240" rx="54" /></clipPath>
    </defs>
    <g clipPath="url(#rr)">
      <rect width="240" height="240" fill={bg} />
      {children}
      <rect width="240" height="120" fill={`url(#gl${bg.replace('#', '')})`} />
    </g>
    <rect x="1.5" y="1.5" width="237" height="237" rx="53" fill="none" stroke={border ?? 'rgba(255,255,255,.55)'} strokeWidth="3" />
  </svg>
);

export const ICONS: Record<string, React.FC> = {
  // Cambridge IELTS 19: a red book standing on a navy shelf of the series.
  cambridge19: () => (
    <Tile bg="#13233F">
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={18 + i * 15} y={44} width={13} height={160} rx={2} fill={['#2E4A7A', '#3D5C91', '#24406C', '#4A6AA0', '#2B4776'][i]} />)}
      <rect x="96" y="30" width="128" height="180" rx="8" fill="#E2231A" />
      <rect x="96" y="30" width="14" height="180" fill="#B3140D" />
      <text x="164" y="88" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="34" fill="#fff">IELTS</text>
      <text x="164" y="110" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="13" fill="#FFD9D6">Academic</text>
      <text x="164" y="182" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="62" fill="#fff">19</text>
    </Tile>
  ),
  // Engnovate: bold rounded "E" monogram.
  engnovate: () => (
    <Tile bg="#FFFFFF" border="rgba(0,0,0,.08)">
      <path d="M70 52 H170 a22 22 0 0 1 0 44 H116 v6 h44 a20 20 0 0 1 0 40 h-44 v6 h54 a22 22 0 0 1 0 44 H70 a14 14 0 0 1 -14 -14 V66 a14 14 0 0 1 14 -14 Z" fill="#EC2B23" />
    </Tile>
  ),
  // IELTS Online Tests: colourful dots + IOT monogram.
  iot: () => (
    <Tile bg="#FFFFFF" border="rgba(0,0,0,.08)">
      <circle cx="62" cy="78" r="22" fill="#F39A1E" /><circle cx="62" cy="150" r="34" fill="#1E6FB8" /><circle cx="62" cy="150" r="13" fill="#fff" />
      <rect x="100" y="60" width="16" height="16" rx="4" fill="#E2231A" /><rect x="92" y="68" width="32" height="0" />
      <path d="M100 68 h16 M108 60 v16" stroke="#E2231A" strokeWidth="0" />
      <text x="168" y="128" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="44" fill="#13233F">IOT</text>
      <text x="168" y="158" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="17" fill="#13233F">IELTS Online</text>
      <text x="168" y="180" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="15" fill="#5B6B85">Tests</text>
    </Tile>
  ),
  // "D" resource (navy outline monogram, as in the reference).
  dmono: () => (
    <Tile bg="#FFFFFF" border="rgba(0,0,0,.08)">
      <path d="M64 50 h58 a70 70 0 0 1 0 140 h-58 Z" fill="#123B66" />
      <path d="M92 78 h30 a42 42 0 0 1 0 84 h-30 Z" fill="#fff" />
      <path d="M104 92 h18 a28 28 0 0 1 0 56 h-18 Z" fill="none" stroke="#123B66" strokeWidth="8" />
    </Tile>
  ),
  // ChatGPT: dark tile with an original six-petal knot glyph.
  chatgpt: () => (
    <Tile bg="#0F0F10">
      <g transform="translate(120 120)" fill="none" stroke="#fff" strokeWidth="11" strokeLinejoin="round">
        {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} transform={`rotate(${a})`} d="M0 -58 a30 30 0 0 1 30 18 l0 46" />)}
      </g>
    </Tile>
  ),
  // goprep.gg mascot.
  goprep: () => (
    <Tile bg="#FFFFFF" border="rgba(0,0,0,.08)">
      <path d="M180 0 h60 v240 h-60 Z" fill="#EC2B23" />
      <path d="M180 0 Q210 120 180 240" fill="#EC2B23" />
      <circle cx="92" cy="138" r="17" fill="#111" /><circle cx="156" cy="138" r="17" fill="#111" />
      <path d="M108 168 Q124 182 140 168" stroke="#111" strokeWidth="9" fill="none" strokeLinecap="round" />
    </Tile>
  ),
  // IELTS Speaking Practice: navy tile, green target + label.
  speakpractice: () => (
    <Tile bg="#0C2A4A">
      <g transform="translate(78 120)" fill="none" stroke="#3CCB4A" strokeWidth="9">
        <circle r="48" /><circle r="30" /><circle r="12" fill="#3CCB4A" />
        <path d="M14 -14 L56 -56 M56 -56 l-18 2 M56 -56 l-2 18" strokeLinecap="round" />
      </g>
      <text x="178" y="104" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="30" fill="#3CCB4A">IELTS</text>
      <text x="178" y="134" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="17" fill="#B8F2BE">SPEAKING</text>
      <text x="178" y="156" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="17" fill="#B8F2BE">PRACTICE</text>
    </Tile>
  ),
};

/* ------------------------------------------------------------------ types */

export type Seg = {srcFrom: number; srcTo: number; scale?: number; origin?: string};
export type Pick = {icons: string[]; label?: string; at: number};
export type Section = {start: number; word: string; left: Pick; right: Pick};
export type ResourcesProps = {
  video: string; segs: Seg[]; title: string; levels: [string, string]; sections: Section[];
  cta: {at: number; line1: string; line2: string};
  music?: string; musicVolume?: number; sfx?: boolean; end: number;
};

const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {f, fps, s: (x: number) => Math.round(x * fps)}; };
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/* ------------------------------------------------------------------ pieces */

const redWord: React.CSSProperties = {fontFamily: FONT, fontWeight: 900, color: RED, letterSpacing: '0.02em', WebkitTextStroke: '3px #fff', paintOrder: 'stroke fill', textShadow: '0 4px 14px rgba(0,0,0,.35)'};

/** Icon(s) + label for one side: spring pop with overshoot, slight tilt, soft contact shadow, label pill. */
const IconGroup: React.FC<{pick: Pick; side: 'left' | 'right'; out: number}> = ({pick, side, out}) => {
  const {f, fps, s} = useT();
  const a = s(pick.at);
  if (f < a || f >= out) return null;
  const outK = interpolate(f, [out - 6, out], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const n = pick.icons.length;
  const size = n > 1 ? 190 : 240;
  return (
    <div style={{position: 'absolute', top: 330, ...(side === 'left' ? {left: 70} : {right: 70}), display: 'flex', flexDirection: 'column', alignItems: side === 'left' ? 'flex-start' : 'flex-end', gap: 16,
      opacity: 1 - outK, transform: `scale(${1 - 0.3 * outK})`, transformOrigin: side === 'left' ? '0 0' : '100% 0'}}>
      <div style={{display: 'flex', gap: n > 1 ? 0 : 0, alignItems: 'flex-end'}}>
        {pick.icons.map((ic, i) => {
          const p = spring({frame: f - a - i * 5, fps, config: {damping: 11, stiffness: 210, mass: 0.7}});
          const Icon = ICONS[ic];
          const float = Math.sin((f - a) / 16 + i) * 4;
          return (
            <div key={ic} style={{width: size, height: size, marginLeft: i > 0 ? -size * 0.22 : 0, marginTop: i > 0 ? size * 0.28 : 0, zIndex: i,
              transform: `translateY(${(1 - p) * 60 + float}px) scale(${p}) rotate(${(1 - p) * (side === 'left' ? -18 : 18) + (side === 'left' ? -4 : 4) * (i === 0 ? 1 : -1)}deg)`,
              filter: 'drop-shadow(0 14px 22px rgba(0,0,0,.35))'}}>
              {Icon ? <Icon /> : null}
            </div>
          );
        })}
      </div>
      {pick.label && (
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', background: 'rgba(0,0,0,.42)', padding: '8px 18px', borderRadius: 999, backdropFilter: 'blur(8px)',
          opacity: interpolate(f - a - 8, [0, 8], [0, 1], clamp), transform: `translateY(${(1 - interpolate(f - a - 8, [0, 10], [0, 1], {...clamp, easing: ease})) * 16}px)`}}>{pick.label}</div>
      )}
    </div>
  );
};

/** Section word: the old word drops out, the new one pops up with blur (only on change). */
const SectionWord: React.FC<{sections: Section[]; ctaAt: number}> = ({sections, ctaAt}) => {
  const {f, s} = useT();
  if (f >= s(ctaAt)) return null;
  const idx = sections.reduce((acc, sc, i) => (f >= s(sc.start) ? i : acc), 0);
  const sc = sections[idx];
  const d = f - s(sc.start);
  const k = interpolate(d, [0, 9], [0, 1], {...clamp, easing: ease});
  const outK = interpolate(f, [s(ctaAt) - 6, s(ctaAt)], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 168, left: 0, right: 0, textAlign: 'center', fontSize: 74, ...redWord,
      transform: `translateY(${(1 - k) * 40}px) scale(${0.85 + 0.15 * k})`, opacity: k * (1 - outK), filter: k < 0.9 ? `blur(${(1 - k) * 8}px)` : undefined}}>
      {sc.word.split('').map((ch, i) => (
        <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - interpolate(d - i * 1.2, [0, 8], [0, 1], {...clamp, easing: ease})) * 30}px)`}}>{ch}</span>
      ))}
    </div>
  );
};

/** Bouncing pointing arrow (original icon) for the CTA. */
const PointDown: React.FC<{at: number}> = ({at}) => {
  const {f, fps, s} = useT();
  const p = spring({frame: f - s(at), fps, config: {damping: 10, stiffness: 200}});
  const bob = Math.abs(Math.sin((f - s(at)) / 6)) * 16;
  return (
    <svg width={86} height={86} viewBox="0 0 24 24" style={{transform: `translateY(${bob}px) scale(${p})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.35))'}}>
      <circle cx="12" cy="12" r="11" fill={RED} stroke="#fff" strokeWidth="1.4" />
      <path d="M12 6.5v10M7.5 12.5l4.5 4.5 4.5-4.5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const CTA: React.FC<{at: number; line1: string; line2: string}> = ({at, line1, line2}) => {
  const {f, fps, s} = useT();
  if (f < s(at)) return null;
  const words = (t: string, off: number) => t.split(' ').map((w, i) => {
    const p = spring({frame: f - s(at) - off - i * 3, fps, config: {damping: 12, stiffness: 220}});
    const isPlus = w.includes('+');
    return (
      <span key={i} style={{display: 'inline-block', marginRight: '0.25em', transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.5)}}>
        {isPlus ? (
          <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.15em', height: '1.15em', borderRadius: '50%', background: '#fff', color: RED, WebkitTextStroke: '0px', verticalAlign: '-0.12em',
            transform: `scale(${1 + 0.1 * Math.sin((f - s(at)) / 5)})`, boxShadow: '0 4px 14px rgba(0,0,0,.35)'}}>+</span>
        ) : w}
      </span>
    );
  });
  return (
    <div style={{position: 'absolute', top: 120, left: 40, right: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 70, lineHeight: 1.12, textAlign: 'center', ...redWord}}>
      <div>{words(line1, 0)}</div>
      <div style={{display: 'flex', alignItems: 'center'}}>{words(line2, 6)}<PointDown at={at + 0.5} /></div>
    </div>
  );
};

/* ------------------------------------------------------------------ composition */

export const ResourcesReel: React.FC<ResourcesProps> = (p) => {
  const {f, fps, s} = useT();
  let acc = 0;
  const segs = p.segs.map((g) => { const from = acc; acc += g.srcTo - g.srcFrom; return {...g, from, to: acc}; });
  const titleK = interpolate(f, [0, 10], [0, 1], {...clamp, easing: ease});
  const ctaOutK = interpolate(f, [s(p.cta.at) - 6, s(p.cta.at)], [0, 1], clamp);
  const sfx: {f: number; file: string; vol: number}[] = [];
  if (p.sfx) {
    p.sections.forEach((sc, i) => {
      if (i > 0) sfx.push({f: s(sc.start) - 4, file: 'whoosh', vol: 0.18});
      sfx.push({f: s(sc.left.at), file: 'pop', vol: 0.32});
      sfx.push({f: s(sc.right.at), file: 'pop', vol: 0.32});
    });
    sfx.push({f: s(p.cta.at), file: 'whoosh', vol: 0.2});
    sfx.push({f: s(p.cta.at) + 12, file: 'ding', vol: 0.18});
  }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* Footage: untouched pixels (no grade); optional punch-in only to vary a repeated take. */}
      {segs.map((g, i) => (
        <Sequence key={i} from={s(g.from)} durationInFrames={s(g.to) - s(g.from)}>
          <AbsoluteFill style={{transform: `scale(${g.scale ?? 1})`, transformOrigin: g.origin ?? '50% 40%'}}>
            <OffthreadVideo src={src(p.video)} muted startFrom={s(g.srcFrom)} style={{width: '100%', height: '100%', objectFit: 'cover'}} transparent={false} toneMapped={false} />
          </AbsoluteFill>
        </Sequence>
      ))}
      {/* "just a bit shadow": soft top gradient behind the type, nothing else. */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.22) 22%, rgba(0,0,0,0) 38%)'}} />
      <div style={{position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 70, color: '#fff', letterSpacing: '-0.01em',
        textShadow: '0 3px 12px rgba(0,0,0,.45)', opacity: titleK * (1 - ctaOutK), transform: `translateY(${(1 - titleK) * -30}px)`}}>{p.title}</div>
      <SectionWord sections={p.sections} ctaAt={p.cta.at} />
      {f < s(p.cta.at) && (
        <>
          {p.levels.map((lv, i) => (
            <div key={i} style={{position: 'absolute', top: 268, ...(i === 0 ? {left: 70} : {right: 70}), fontFamily: FONT, fontWeight: 800, fontSize: 32, color: '#fff', padding: '6px 16px', borderRadius: 999,
              background: 'rgba(0,0,0,.38)', border: '1.5px solid rgba(255,255,255,.35)', opacity: interpolate(f, [6 + i * 4, 16 + i * 4], [0, 1], clamp) * (1 - ctaOutK)}}>{lv}</div>
          ))}
          {p.sections.map((sc, i) => {
            const out = i < p.sections.length - 1 ? s(p.sections[i + 1].start) : s(p.cta.at);
            return (
              <React.Fragment key={i}>
                <IconGroup pick={sc.left} side="left" out={out} />
                <IconGroup pick={sc.right} side="right" out={out} />
              </React.Fragment>
            );
          })}
        </>
      )}
      <CTA {...p.cta} />
      {p.music && <Audio src={staticFile(p.music)} volume={p.musicVolume ?? 1} />}
      {sfx.map((e, i) => <Sequence key={i} from={Math.max(0, e.f)} durationInFrames={40} layout="none"><Audio src={staticFile(`sfx/${e.file}.wav`)} volume={e.vol} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const resourcesDuration = (p: ResourcesProps, fps: number) => Math.round(p.end * fps);
