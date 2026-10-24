import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {clamp, src} from './kit';

/**
 * Style H: "8+ resource table" over a talking head (reference: Speaking/Listening/Reading/Writing 8+ table).
 * Frosted mint rows (skill icon + name | 8+ pill | resource) build in at the start; when the speaker names a
 * skill its row lifts and glows, and when they name the resource its tile pops into the third column.
 * Footage is never graded — the only addition is the cards' soft drop shadow.
 */

const FONT = "'Montserrat', 'Arial', sans-serif";
const INK = '#16201A';
const MINT = 'rgba(236,248,238,.93)';
const GREEN = '#1F8A3B';

if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  Promise.all(['900 60px Montserrat', '800 60px Montserrat', '700 60px Montserrat'].map((f) => document.fonts.load(f, 'Aa8+.')))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}

/* ------------------------------------------------------------------ original icons (SVG 120x120) */

const I: React.FC<{children: React.ReactNode}> = ({children}) => <svg viewBox="0 0 120 120" width="100%" height="100%">{children}</svg>;

/** Skill icons: glossy, slightly 3D, with a little motion accent drawn in. */
export const SKILL_ICONS: Record<string, React.FC> = {
  listening: () => (
    <I>
      <defs><linearGradient id="hp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4F57" /><stop offset="1" stopColor="#15181C" /></linearGradient></defs>
      <path d="M22 70 V58 a38 38 0 0 1 76 0 V70" fill="none" stroke="url(#hp)" strokeWidth="11" strokeLinecap="round" />
      <rect x="12" y="62" width="26" height="40" rx="12" fill="url(#hp)" /><rect x="82" y="62" width="26" height="40" rx="12" fill="url(#hp)" />
      <rect x="18" y="68" width="8" height="26" rx="4" fill="#fff" opacity=".25" /><rect x="88" y="68" width="8" height="26" rx="4" fill="#fff" opacity=".25" />
      <path d="M104 30 l8 -6 M108 42 l10 -1" stroke="#F5B21B" strokeWidth="5" strokeLinecap="round" />
    </I>
  ),
  vocabulary: () => (
    <I>
      <rect x="14" y="78" width="88" height="20" rx="5" fill="#2F7BE5" /><rect x="14" y="78" width="88" height="6" rx="3" fill="#fff" opacity=".35" />
      <rect x="20" y="58" width="80" height="20" rx="5" fill="#F5B21B" /><rect x="20" y="58" width="80" height="6" rx="3" fill="#fff" opacity=".35" />
      <g transform="rotate(-10 60 44)"><rect x="24" y="30" width="76" height="28" rx="6" fill="#E9F1FF" stroke="#2F7BE5" strokeWidth="4" />
        <text x="62" y="51" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="20" fill="#2F7BE5">A–Z</text></g>
      <path d="M100 14 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="#F5B21B" />
    </I>
  ),
  reading: () => (
    <I>
      <path d="M10 34 Q35 24 60 36 Q85 24 110 34 V96 Q85 86 60 98 Q35 86 10 96 Z" fill="#E4472F" />
      <path d="M16 32 Q38 24 58 34 V90 Q38 80 16 88 Z" fill="#FFF7EA" /><path d="M104 32 Q82 24 62 34 V90 Q82 80 104 88 Z" fill="#FFF1DC" />
      {[44, 54, 64, 74].map((y) => <path key={y} d={`M24 ${y} Q38 ${y - 5} 50 ${y + 2}`} stroke="#E4B98A" strokeWidth="3.5" fill="none" strokeLinecap="round" />)}
      {[44, 54, 64, 74].map((y) => <path key={y} d={`M70 ${y + 2} Q82 ${y - 5} 96 ${y}`} stroke="#E4B98A" strokeWidth="3.5" fill="none" strokeLinecap="round" />)}
      <path d="M100 12 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="#F5B21B" />
    </I>
  ),
  speaking: () => (
    <I>
      <path d="M58 46 h44 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-8 l-8 12 l-4 -12 h-24 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10 z" fill="#6B4A2B" />
      <path d="M14 18 h56 a12 12 0 0 1 12 12 v28 a12 12 0 0 1 -12 12 h-30 l-14 14 v-14 h-12 a12 12 0 0 1 -12 -12 v-28 a12 12 0 0 1 12 -12 z" fill="#F5B21B" />
      <path d="M14 18 h56 a12 12 0 0 1 12 12 v6 h-80 v-6 a12 12 0 0 1 12 -12 z" fill="#fff" opacity=".3" />
      {[26, 42, 58].map((x) => <circle key={x} cx={x} cy="45" r="5.5" fill="#fff" />)}
    </I>
  ),
  writing: () => (
    <I>
      <rect x="18" y="12" width="66" height="90" rx="8" fill="#fff" stroke="#C9D3DD" strokeWidth="3" />
      {[32, 46, 60, 74].map((y) => <rect key={y} x="30" y={y} width={y === 74 ? 26 : 42} height="5" rx="2.5" fill="#C9D3DD" />)}
      <g transform="rotate(40 82 70)"><rect x="74" y="26" width="16" height="70" rx="3" fill="#F5B21B" /><rect x="74" y="26" width="16" height="12" rx="3" fill="#E9708A" /><path d="M74 96 h16 l-8 16 z" fill="#F2D7A8" /><path d="M79 106 h6 l-3 6 z" fill="#333" /></g>
    </I>
  ),
};

/** Resource tiles for the third column. */
export const RESOURCE_TILES: Record<string, React.FC> = {
  youtube: () => (
    <svg viewBox="0 0 160 112" height="78">
      <defs><linearGradient id="yt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF3B30" /><stop offset="1" stopColor="#D9140B" /></linearGradient></defs>
      <rect x="4" y="4" width="152" height="104" rx="30" fill="url(#yt)" />
      <rect x="10" y="8" width="140" height="40" rx="20" fill="#fff" opacity=".18" />
      <path d="M64 34 L106 56 L64 78 Z" fill="#fff" />
    </svg>
  ),
  preppy: () => (
    <svg viewBox="0 0 170 120" height="86">
      {/* original flame-haired mascot */}
      <path d="M22 54 L30 14 L48 40 L60 6 L76 36 L90 4 L102 36 L118 8 L128 40 L146 16 L150 56 Z" fill="#FF6A1A" />
      <path d="M34 52 L40 28 L52 44 L62 22 L76 42 L90 20 L102 42 L116 24 L124 44 L136 30 L138 54 Z" fill="#FFB020" />
      <rect x="18" y="46" width="134" height="68" rx="32" fill="#fff" stroke="#FF5A1F" strokeWidth="6" />
      <path d="M50 70 l20 8" stroke="#1B1B1B" strokeWidth="7" strokeLinecap="round" /><path d="M120 70 l-20 8" stroke="#1B1B1B" strokeWidth="7" strokeLinecap="round" />
      <circle cx="64" cy="86" r="7" fill="#1B1B1B" /><circle cx="106" cy="86" r="7" fill="#1B1B1B" />
      <path d="M76 100 q9 -6 18 0" stroke="#1B1B1B" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ types */

export type Row = {skill: string; label: string; badge?: string; at: number; resource: {at: number; tile?: string; text?: string; sub?: string; caption?: string}};
export type ScoreTableProps = {video: string; rows: Row[]; top?: number; voice?: string; voiceVolume?: number; music?: string; musicVolume?: number; sfx?: boolean; end: number};

const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {f, fps, s: (x: number) => Math.round(x * fps)}; };
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/* ------------------------------------------------------------------ pieces */

const W = 880; const H = 116; const GAP = 14;
const C1 = 470; const C2 = 150; const C3 = W - C1 - C2 - 2 * 10;

const Cell: React.FC<{w: number; children?: React.ReactNode; glow?: number; style?: React.CSSProperties}> = ({w, children, glow = 0, style}) => (
  <div style={{width: w, height: H, borderRadius: 22, background: MINT, display: 'flex', alignItems: 'center', boxSizing: 'border-box',
    boxShadow: `0 10px 26px rgba(0,0,0,.22), 0 2px 6px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.9)${glow > 0 ? `, 0 0 0 ${3 * glow}px rgba(64,200,96,${0.75 * glow}), 0 0 ${26 * glow}px rgba(64,200,96,${0.5 * glow})` : ''}`, ...style}}>
    {children}
  </div>
);

const RowView: React.FC<{row: Row; i: number; next?: Row}> = ({row, i, next}) => {
  const {f, fps, s} = useT();
  // build-in: rows slide up and fade one after another at the very start
  const inP = spring({frame: f - i * 4, fps, config: {damping: 16, stiffness: 170}});
  // active while this skill is being talked about
  const a = s(row.at); const until = next ? s(next.at) : 100000;
  const act = f >= a && f < until ? interpolate(f - a, [0, 7], [0, 1], {...clamp, easing: ease}) * interpolate(f, [until - 5, until], [1, 0], clamp) : 0;
  const lift = act;
  const Skill = SKILL_ICONS[row.skill];
  const wob = act > 0 ? Math.sin((f - a) / 3) * 8 * Math.exp(-(f - a) / 12) : 0;
  const r = row.resource;
  const rp = f >= s(r.at) ? spring({frame: f - s(r.at), fps, config: {damping: 10, stiffness: 230, mass: 0.7}}) : 0;
  const Tile = r.tile ? RESOURCE_TILES[r.tile] : null;
  return (
    <div style={{display: 'flex', gap: 10, opacity: Math.min(1, inP * 1.4), transform: `translateY(${(1 - inP) * 60 - lift * 6}px) scale(${1 + 0.03 * lift})`, transformOrigin: '50% 50%'}}>
      <Cell w={C1} glow={act}>
        <div style={{width: 92, height: 92, marginLeft: 16, transform: `rotate(${wob}deg) scale(${1 + 0.12 * act})`}}>{Skill ? <Skill /> : null}</div>
        <div style={{marginLeft: 18, fontFamily: FONT, fontWeight: 800, fontSize: 50, color: INK, letterSpacing: '-0.01em'}}>{row.label}</div>
      </Cell>
      <Cell w={C2} style={{justifyContent: 'center'}}>
        <div style={{padding: '8px 22px', borderRadius: 999, background: act > 0.05 ? `linear-gradient(180deg, #43C566, ${GREEN})` : '#BFE6C6',
          color: act > 0.05 ? '#fff' : '#155F2A', fontFamily: FONT, fontWeight: 900, fontSize: 48, transform: `scale(${1 + 0.1 * act})`, boxShadow: act > 0.05 ? '0 4px 12px rgba(31,138,59,.4)' : 'none'}}>{row.badge ?? '8+'}</div>
      </Cell>
      <Cell w={C3} style={{justifyContent: 'center', overflow: 'visible', position: 'relative'}}>
        {rp > 0 && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${rp}) rotate(${(1 - rp) * -14}deg)`, opacity: Math.min(1, rp * 1.6)}}>
            {Tile ? <Tile /> : null}
            {r.text && <div style={{fontFamily: FONT, fontWeight: 900, fontSize: r.sub ? 32 : 40, color: INK, letterSpacing: '-0.01em', lineHeight: 1.05, textAlign: 'center'}}>{r.text}</div>}
            {r.sub && <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#4C5A50', lineHeight: 1.1}}>{r.sub}</div>}
            {r.caption && Tile && <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 18, color: INK, marginTop: -4}}>{r.caption}</div>}
          </div>
        )}
        {/* sparkle burst on arrival */}
        {rp > 0 && f - s(r.at) < 14 && [0, 1, 2, 3, 4, 5].map((k) => {
          const ang = (k / 6) * Math.PI * 2; const d = interpolate(f - s(r.at), [0, 12], [30, 92], clamp);
          return <div key={k} style={{position: 'absolute', left: '50%', top: '50%', width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: 5, background: k % 2 ? '#43C566' : '#F5B21B',
            transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d * 0.6}px)`, opacity: interpolate(f - s(r.at), [6, 14], [1, 0], clamp)}} />;
        })}
      </Cell>
    </div>
  );
};

/* ------------------------------------------------------------------ composition */

export const ScoreTableReel: React.FC<ScoreTableProps> = (p) => {
  const {s} = useT();
  const sfx: {f: number; file: string; vol: number}[] = [];
  if (p.sfx) {
    p.rows.forEach((r, i) => { sfx.push({f: i * 4, file: 'pop', vol: 0.12}); sfx.push({f: s(r.resource.at), file: 'pop', vol: 0.35}); });
  }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* untouched footage */}
      <OffthreadVideo src={src(p.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} toneMapped={false} />
      <div style={{position: 'absolute', top: p.top ?? 1010, left: (1080 - W) / 2, width: W, display: 'flex', flexDirection: 'column', gap: GAP}}>
        {p.rows.map((r, i) => <RowView key={i} row={r} i={i} next={p.rows[i + 1]} />)}
      </div>
      {p.voice && <Audio src={src(p.voice)} volume={p.voiceVolume ?? 1} />}
      {p.music && <Audio src={staticFile(p.music)} volume={p.musicVolume ?? 0.5} />}
      {sfx.map((e, i) => <Sequence key={i} from={Math.max(0, e.f)} durationInFrames={30} layout="none"><Audio src={staticFile(`sfx/${e.file}.wav`)} volume={e.vol} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const scoreTableDuration = (p: ScoreTableProps, fps: number) => Math.round(p.end * fps);
