import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/caveat/700.css';
import {FONT, clamp, src} from './kit';

/**
 * Style E: illustrated story (reference: bashar.uz "ilm" reel). Flat vector scenes in a teal palette
 * with warm light, drawn in code (no image generation), each with a slow push-in and parallax, soft
 * cross-dissolves, a small logo on top, karaoke subtitles in the dark lower third (spoken words go
 * white, key words gold) and the brand at the bottom. No voice by default: subtitles run at a natural
 * reading pace so the user can record over them later.
 */

const FPS = 30;
const C = {
  deep: '#0B2324', bg: '#123536', wall: '#1D4A4A', wall2: '#245757', mint: '#3E8C84', mint2: '#5FB0A3',
  warm: '#F2C27B', gold: '#F2B880', wood: '#7A4E35', wood2: '#5C3A28', rug: '#8E3B32', skin: '#E2B08A',
  hair: '#1E1A18', shirt: '#E7EDE8', dark: '#0A1C1D', glass: '#9FD3C7', red: '#E0564B',
};
const HAND = "'Caveat', cursive";
const s = (sec: number) => Math.round(sec * FPS);

/* ------------------------------------------------------------------ primitives */

const Layer: React.FC<{depth: number; prog: number; children: React.ReactNode}> = ({depth, prog, children}) => (
  // Parallax: nearer layers (higher depth) drift and grow a bit more during the scene.
  <g transform={`translate(${-depth * 22 * prog} ${depth * 6 * prog}) translate(540 900) scale(${1 + depth * 0.025 * prog}) translate(-540 -900)`}>{children}</g>
);

const Stars: React.FC<{n?: number; h?: number; seed?: string}> = ({n = 60, h = 700, seed = 's'}) => {
  const f = useCurrentFrame();
  return <g>{Array.from({length: n}, (_, i) => <circle key={i} cx={random(`${seed}x${i}`) * 1080} cy={random(`${seed}y${i}`) * h} r={1.5 + random(`${seed}r${i}`) * 2} fill="#CFE9E2" opacity={0.35 + 0.35 * Math.sin(f / 20 + i)} />)}</g>;
};

const City: React.FC<{y: number; color?: string; seed?: string; lit?: number; h?: number}> = ({y, color = '#173F40', seed = 'c', lit = 0.35, h = 380}) => {
  const f = useCurrentFrame();
  const blds = Array.from({length: 14}, (_, i) => ({x: i * 82 - 20 + random(`${seed}o${i}`) * 20, w: 70 + random(`${seed}w${i}`) * 40, hh: h * (0.35 + random(`${seed}h${i}`) * 0.65)}));
  return (
    <g>
      {blds.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={y - b.hh} width={b.w} height={b.hh + 400} fill={color} />
          {Array.from({length: Math.floor(b.hh / 34)}, (_, r) => Array.from({length: Math.floor(b.w / 22)}, (_, c) => {
            const on = random(`${seed}${i}-${r}-${c}`) < lit;
            const blink = random(`${seed}b${i}-${r}-${c}`) < 0.04 ? (Math.floor(f / 20 + i) % 2) : 1;
            return on ? <rect key={`${r}-${c}`} x={b.x + 8 + c * 22} y={y - b.hh + 14 + r * 34} width={10} height={14} fill={C.warm} opacity={0.75 * blink} /> : null;
          }))}
        </g>
      ))}
    </g>
  );
};

const Books: React.FC<{x: number; y: number; w: number; rows: number; seed: string}> = ({x, y, w, rows, seed}) => {
  const cols = ['#C9A15E', '#8E4A3C', '#3F7F79', '#D9C7A0', '#5E7F5A', '#A8643E', '#2F5F6A', '#B58B6A'];
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={rows * 120 + 20} fill={C.wood2} rx={6} />
      {Array.from({length: rows}, (_, r) => {
        let cx = x;
        const out: React.ReactNode[] = [];
        let i = 0;
        while (cx < x + w - 10) {
          const bw = 18 + random(`${seed}${r}w${i}`) * 16; const bh = 70 + random(`${seed}${r}h${i}`) * 32;
          out.push(<rect key={i} x={cx} y={y + r * 120 + (100 - bh)} width={bw - 3} height={bh} fill={cols[Math.floor(random(`${seed}${r}c${i}`) * cols.length)]} rx={2} />);
          cx += bw; i++;
        }
        return <g key={r}>{out}<rect x={x - 14} y={y + r * 120 + 100} width={w + 28} height={10} fill={C.wood} /></g>;
      })}
    </g>
  );
};

const ArchWindow: React.FC<{x: number; y: number; w: number; h: number; night?: boolean; children?: React.ReactNode}> = ({x, y, w, h, night = true, children}) => {
  const id = `win${x}${y}`;
  const d = `M ${x} ${y + h} L ${x} ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z`;
  return (
    <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={night ? '#0E2D3A' : '#E8C48D'} />
        {night && <Stars n={14} h={y + h} seed={id} />}
        {children ?? (night ? <City y={y + h} seed={id} h={h * 0.55} color="#123445" lit={0.5} /> : null)}
      </g>
      <path d={d} fill="none" stroke={C.wood} strokeWidth={14} />
      <line x1={x + w / 2} y1={y + 10} x2={x + w / 2} y2={y + h} stroke={C.wood} strokeWidth={8} />
    </g>
  );
};

const LampGlow: React.FC<{x: number; y: number; r?: number; o?: number}> = ({x, y, r = 380, o = 0.5}) => {
  const f = useCurrentFrame();
  const id = `glow${x}${y}`;
  return (
    <g>
      <defs><radialGradient id={id}><stop offset="0" stopColor={C.warm} stopOpacity={o * (0.92 + 0.08 * Math.sin(f / 9))} /><stop offset="1" stopColor={C.warm} stopOpacity={0} /></radialGradient></defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </g>
  );
};

type PersonProps = {x: number; y: number; s?: number; pose?: 'stand' | 'sit' | 'cheer' | 'sad' | 'desk'; cap?: boolean; hijab?: boolean; shirt?: string; pants?: string; beard?: boolean; flip?: boolean; older?: boolean};
/** Flat character, faceless like the reference. (x, y) = feet centre (for 'desk': seat point). */
const Person: React.FC<PersonProps> = ({x, y, s: k = 1, pose = 'stand', cap, hijab, shirt = C.shirt, pants = '#22393A', beard, flip, older}) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 18) * 2;
  const sad = pose === 'sad';
  const sitting = pose === 'sit' || pose === 'desk';
  const bodyTop = sitting ? -250 : -330;
  const headY = bodyTop - 46 + (sad ? 14 : 0) + bob;
  const hx = sad ? 12 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      <ellipse cx={0} cy={4} rx={sitting ? 120 : 70} ry={14} fill="#000" opacity={0.22} />
      {/* legs */}
      {sitting ? (
        pose === 'sit' ? <path d="M -105 -10 Q -60 -60 0 -55 Q 60 -60 105 -10 Q 50 10 0 6 Q -50 10 -105 -10 Z" fill={pants} /> : null
      ) : hijab ? null : (
        <g fill={pants}><rect x={-38} y={-170} width={32} height={170} rx={14} /><rect x={6} y={-170} width={32} height={170} rx={14} /><rect x={-44} y={-14} width={42} height={16} rx={8} fill="#2A2422" /><rect x={4} y={-14} width={42} height={16} rx={8} fill="#2A2422" /></g>
      )}
      {/* body */}
      {hijab ? (
        <path d={`M -58 ${bodyTop + 10} Q 0 ${bodyTop - 20} 58 ${bodyTop + 10} L 78 0 L -78 0 Z`} fill={shirt} />
      ) : (
        <path d={`M -56 ${bodyTop + 14} Q 0 ${bodyTop - 14} 56 ${bodyTop + 14} L 62 ${sitting ? -40 : -160} Q 0 ${sitting ? -26 : -146} -62 ${sitting ? -40 : -160} Z`} fill={shirt} />
      )}
      {/* arms */}
      {pose === 'cheer' ? (
        <g stroke={shirt} strokeWidth={30} strokeLinecap="round" fill="none"><path d={`M -48 ${bodyTop + 30} L -100 ${bodyTop - 70}`} /><path d={`M 48 ${bodyTop + 30} L 100 ${bodyTop - 70}`} /><circle cx={-102} cy={bodyTop - 78} r={2} stroke={C.skin} strokeWidth={26} /><circle cx={102} cy={bodyTop - 78} r={2} stroke={C.skin} strokeWidth={26} /></g>
      ) : pose === 'desk' ? (
        <g stroke={shirt} strokeWidth={28} strokeLinecap="round" fill="none"><path d={`M -46 ${bodyTop + 34} Q -40 ${bodyTop + 110} 30 ${bodyTop + 120}`} /><path d={`M 46 ${bodyTop + 34} Q 70 ${bodyTop + 100} 110 ${bodyTop + 112}`} /></g>
      ) : (
        <g stroke={shirt} strokeWidth={28} strokeLinecap="round" fill="none"><path d={`M -54 ${bodyTop + 30} Q -70 ${bodyTop + 110} -62 ${bodyTop + 170}`} /><path d={`M 54 ${bodyTop + 30} Q 70 ${bodyTop + 110} 62 ${bodyTop + 170}`} /></g>
      )}
      {/* head */}
      <rect x={hx - 12} y={headY + 30} width={24} height={24} fill={C.skin} />
      <circle cx={hx} cy={headY} r={40} fill={C.skin} />
      {hijab ? (
        <path d={`M ${hx - 50} ${headY + 40} Q ${hx - 56} ${headY - 54} ${hx} ${headY - 52} Q ${hx + 56} ${headY - 54} ${hx + 50} ${headY + 40} Q ${hx + 30} ${headY - 10} ${hx} ${headY - 18} Q ${hx - 30} ${headY - 10} ${hx - 50} ${headY + 40} Z`} fill={shirt === C.shirt ? '#2E5C5A' : shirt} />
      ) : (
        <path d={`M ${hx - 41} ${headY - 4} Q ${hx - 40} ${headY - 46} ${hx} ${headY - 44} Q ${hx + 40} ${headY - 46} ${hx + 41} ${headY - 4} Q ${hx + 20} ${headY - 24} ${hx - 41} ${headY - 4} Z`} fill={older ? '#8C8C88' : C.hair} />
      )}
      {beard && <path d={`M ${hx - 36} ${headY + 6} Q ${hx} ${headY + 70} ${hx + 36} ${headY + 6} Q ${hx} ${headY + 30} ${hx - 36} ${headY + 6} Z`} fill={older ? '#B9B9B4' : C.hair} />}
      {cap && (
        <g>
          <path d={`M ${hx - 70} ${headY - 40} L ${hx} ${headY - 70} L ${hx + 70} ${headY - 40} L ${hx} ${headY - 12} Z`} fill={C.dark} />
          <rect x={hx - 30} y={headY - 40} width={60} height={22} fill={C.dark} />
          <path d={`M ${hx + 66} ${headY - 40} L ${hx + 72} ${headY + 4}`} stroke={C.gold} strokeWidth={6} />
          <circle cx={hx + 72} cy={headY + 8} r={7} fill={C.gold} />
        </g>
      )}
    </g>
  );
};

const Desk: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 560}) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={26} fill={C.wood} rx={6} />
    <rect x={x - w / 2 + 30} y={y + 26} width={22} height={260} fill={C.wood2} />
    <rect x={x + w / 2 - 52} y={y + 26} width={22} height={260} fill={C.wood2} />
  </g>
);

const Laptop: React.FC<{x: number; y: number; s?: number; children?: React.ReactNode; glow?: boolean}> = ({x, y, s: k = 1, children, glow}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    {glow && <LampGlow x={0} y={-110} r={260} o={0.35} />}
    <rect x={-150} y={-200} width={300} height={190} rx={14} fill="#1B2F33" />
    <rect x={-138} y={-188} width={276} height={166} rx={6} fill="#0F3B3E" />
    <g transform="translate(0 -105)">{children}</g>
    <path d="M -180 -8 L 180 -8 L 160 6 L -160 6 Z" fill="#2B4447" />
  </g>
);

const Phone: React.FC<{x: number; y: number; w?: number; h?: number; children?: React.ReactNode}> = ({x, y, w = 420, h = 820, children}) => (
  <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
    <rect x={-12} y={-12} width={w + 24} height={h + 24} rx={64} fill="#0A1718" />
    <rect x={0} y={0} width={w} height={h} rx={54} fill="#123E40" />
    <rect x={w / 2 - 60} y={18} width={120} height={28} rx={14} fill="#0A1718" />
    <g>{children}</g>
  </g>
);

/** Counter that eases from `from` to `to` between frames a..b (decimals as given). */
const useCount = (from: number, to: number, a: number, b: number, decimals = 1) => {
  const f = useCurrentFrame();
  return interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.out(Easing.cubic)}).toFixed(decimals);
};

/* ------------------------------------------------------------------ scenes (frame 0 = scene start) */

type SceneProps = {d: number};
const prog = (f: number, d: number) => f / Math.max(1, d);

const SceneGraduate: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  return (
    <>
      <Layer depth={0} prog={p}>
        <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B4D57" /><stop offset="0.7" stopColor="#E3A86B" /><stop offset="1" stopColor="#F2C27B" /></linearGradient></defs>
        <rect width={1080} height={1300} fill="url(#dusk)" />
        <path d="M 0 760 Q 200 640 420 720 T 1080 690 L 1080 1300 L 0 1300 Z" fill="#2E6461" opacity={0.7} />
      </Layer>
      <Layer depth={0.5} prog={p}>
        {/* school building */}
        <rect x={160} y={560} width={760} height={420} fill="#2A5C5A" />
        <path d="M 130 570 L 540 420 L 950 570 Z" fill="#214B4A" />
        {[0, 1, 2, 3, 4].map((i) => <ArchWindow key={i} x={210 + i * 140} y={640} w={90} h={170} night={false} />)}
        <rect x={470} y={830} width={140} height={150} rx={8} fill={C.wood} />
        <text x={540} y={540} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.warm} letterSpacing={6}>MAKTAB</text>
        <rect x={0} y={970} width={1080} height={400} fill="#1F4847" />
      </Layer>
      <Layer depth={1} prog={p}>
        <LampGlow x={540} y={760} r={420} o={0.25} />
        <Person x={330} y={1150} s={1.05} shirt="#3E6E6A" beard />
        <Person x={460} y={1150} s={1.0} hijab shirt="#5B8B7E" />
        <Person x={690} y={1170} s={1.15} cap shirt={C.shirt} pants="#1E3233" />
        {/* diploma */}
        <g transform={`translate(780 ${880 + Math.sin(f / 10) * 3}) rotate(-20)`}><rect x={-60} y={-14} width={120} height={28} rx={14} fill="#F4EBD8" /><rect x={-8} y={-16} width={16} height={32} fill={C.red} /></g>
        {/* hope sparkles above parents */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = interpolate(f, [s(1.9) + i * 4, s(2.4) + i * 4], [0, 1], clamp);
          return <circle key={i} cx={330 + i * 40} cy={640 - (i % 2) * 40 - a * 30} r={8} fill={C.gold} opacity={a * (0.6 + 0.4 * Math.sin(f / 6 + i))} />;
        })}
      </Layer>
    </>
  );
};

const SceneRepetitor: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill="#0F2C36" /><Stars seed="rp" /><City y={1000} seed="rp" color="#143A43" /></Layer>
      <Layer depth={0.6} prog={p}>
        {/* tutoring center */}
        <rect x={520} y={520} width={460} height={560} fill="#24524F" />
        <rect x={560} y={560} width={380} height={110} rx={12} fill="#0E2526" />
        <text x={750} y={634} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={C.warm} letterSpacing={4} opacity={0.85 + 0.15 * Math.sin(f / 5)}>REPETITOR</text>
        <rect x={640} y={760} width={220} height={320} rx={10} fill="#F2C27B" opacity={0.9} />
        <LampGlow x={750} y={900} r={300} o={0.35} />
        {/* price tag */}
        <g transform={`translate(880 760) rotate(${8 + Math.sin(f / 12) * 3})`}><path d="M -70 -40 L 50 -40 L 90 0 L 50 40 L -70 40 Z" fill={C.red} /><text x={-8} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#fff">$$$</text></g>
        <rect x={0} y={1080} width={1080} height={300} fill="#163B3C" />
      </Layer>
      <Layer depth={1} prog={p}>
        <Person x={290} y={1190} s={1.15} pose="sad" shirt={C.shirt} />
        {/* empty pockets */}
        {interpolate(f, [s(1.2), s(1.6)], [0, 1], clamp) > 0 && (
          <g opacity={interpolate(f, [s(1.2), s(1.6)], [0, 1], clamp)}>
            <path d="M 210 990 q -10 30 14 36 q 16 -10 10 -36 Z" fill="#D8DDD8" /><path d="M 372 990 q 10 30 -14 36 q -16 -10 -10 -36 Z" fill="#D8DDD8" />
          </g>
        )}
      </Layer>
    </>
  );
};

const SceneClass: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  const chalk = interpolate(f, [s(1.75), s(2.6)], [0, 1], clamp);
  return (
    <>
      <Layer depth={0} prog={p}>
        <rect width={1080} height={1300} fill={C.wall} />
        <rect x={0} y={1050} width={1080} height={300} fill={C.wood2} />
        <rect x={140} y={360} width={800} height={460} rx={16} fill="#1E3B33" stroke={C.wood} strokeWidth={22} />
        <clipPath id="chalk"><rect x={180} y={380} width={720 * chalk} height={400} /></clipPath>
        <text x={540} y={560} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={150} fill="#EDEDE3" clipPath="url(#chalk)">Hello!</text>
        <text x={540} y={700} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={84} fill="#EDEDE3" opacity={0.7} clipPath="url(#chalk)">How are you?</text>
      </Layer>
      <Layer depth={0.7} prog={p}>
        <Person x={880} y={1130} s={1.05} older beard shirt="#486F6A" />
        <path d={`M 830 840 L 700 ${700 + Math.sin(f / 8) * 10}`} stroke={C.wood} strokeWidth={8} strokeLinecap="round" />
      </Layer>
      <Layer depth={1.2} prog={p}>
        <Desk x={330} y={1100} w={460} />
        <Person x={330} y={1150} s={1.05} pose="desk" shirt={C.shirt} />
        <rect x={250} y={1078} width={160} height={22} fill="#F4EBD8" />
      </Layer>
    </>
  );
};

const SceneCertificate: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - s(2.2), fps, config: {damping: 12, stiffness: 120}});
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill={C.wall} /><ArchWindow x={90} y={260} w={300} h={540} /><Books x={640} y={260} w={360} rows={5} seed="cert" /></Layer>
      <Layer depth={0.8} prog={p}>
        <LampGlow x={540} y={760} r={480} o={0.45 * pop} />
        <g transform={`translate(540 ${760 + Math.sin(f / 14) * 8}) scale(${0.3 + 0.7 * pop}) rotate(${(1 - pop) * -12})`} opacity={pop}>
          <rect x={-300} y={-210} width={600} height={420} rx={16} fill="#F4EBD8" />
          <rect x={-276} y={-186} width={552} height={372} rx={10} fill="none" stroke={C.gold} strokeWidth={6} />
          <text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#1C3A3B">IELTS</text>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={34} fill="#5C6D6C" letterSpacing={6}>CERTIFICATE</text>
          <rect x={-200} y={50} width={250} height={14} rx={7} fill="#C9C1AE" /><rect x={-200} y={90} width={190} height={14} rx={7} fill="#C9C1AE" />
          <circle cx={180} cy={100} r={56} fill={C.gold} /><path d="M 150 140 L 135 220 L 165 200 L 185 230 L 205 150 Z" fill={C.red} />
        </g>
        {/* DTM badge */}
        <g opacity={interpolate(f, [0, 10], [0, 1], clamp)} transform={`translate(540 ${430 - interpolate(f, [0, 14], [30, 0], clamp)})`}>
          <rect x={-220} y={-56} width={440} height={112} rx={56} fill="#0E2627" stroke={C.mint2} strokeWidth={4} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill="#fff">DTM: <tspan fill={C.gold}>max ball</tspan></text>
        </g>
      </Layer>
    </>
  );
};

const SceneStudy: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill="#173F40" /><ArchWindow x={600} y={240} w={360} h={560} /></Layer>
      <Layer depth={0.8} prog={p}>
        <LampGlow x={320} y={860} r={420} o={0.55} />
        <Desk x={430} y={1010} w={680} />
        {/* lamp */}
        <path d="M 220 1010 L 230 870 L 300 820" stroke="#2B4447" strokeWidth={12} fill="none" /><path d="M 270 800 L 350 790 L 330 850 Z" fill="#2B4447" />
        {/* books stack */}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={560 + (i % 2) * 10} y={984 - i * 26} width={170} height={24} rx={4} fill={['#8E4A3C', '#3F7F79', '#C9A15E', '#5E7F5A'][i]} />)}
        <rect x={340} y={990} width={180} height={18} fill="#F4EBD8" />
        <Person x={400} y={1060} s={1.1} pose="desk" shirt={C.shirt} />
      </Layer>
    </>
  );
};

const SceneMock: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  const score = useCount(3.5, 5.0, s(0.4), s(1.6));
  const shake = f > s(1.6) && f < s(2.0) ? Math.sin(f * 2.4) * 6 : 0;
  const bars = [0.7, 0.85, 1, 0.95, 1];
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill="#0F2C36" /><City y={1150} seed="mk" color="#143A43" lit={0.25} /></Layer>
      <Layer depth={0.8} prog={p}>
        <Phone x={540} y={720} w={460} h={860}>
          <text x={230} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.glass}>Mock test natijasi</text>
          <g transform={`translate(${230 + shake} 300)`}>
            <circle r={130} fill="none" stroke="#1E5254" strokeWidth={22} />
            <circle r={130} fill="none" stroke={C.red} strokeWidth={22} strokeDasharray={`${(Number(score) / 9) * 817} 900`} transform="rotate(-90)" strokeLinecap="round" />
            <text y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#fff">{score}</text>
          </g>
          {/* attempts chart stuck under a ceiling */}
          <line x1={40} y1={560} x2={420} y2={560} stroke={C.red} strokeWidth={5} strokeDasharray="14 10" />
          <text x={420} y={548} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.red}>5.0</text>
          {bars.map((v, i) => {
            const g = interpolate(f, [s(0.3) + i * 5, s(0.9) + i * 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
            return <rect key={i} x={60 + i * 72} y={760 - 200 * v * g} width={46} height={200 * v * g} rx={8} fill={C.mint} />;
          })}
        </Phone>
      </Layer>
      <Layer depth={1.2} prog={p}><Person x={170} y={1250} s={0.95} pose="sad" /></Layer>
    </>
  );
};

/** Scrolling a feed fast, then a sudden stop on the GoPrep post (`stopAt` s), with a punch-in and flash. */
const FIND_STOP = 1.4;
const SceneFind: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  const T = s(FIND_STOP);
  const CARD = 250; const N = 14; // GoPrep post is card N
  const target = N * CARD - 300;
  // Accelerating flick, then an abrupt stop with a small spring bounce.
  const off = f < T ? target * Math.pow(f / T, 2.2) : target + 46 * Math.sin((f - T) / 2.2) * Math.exp(-(f - T) / 4);
  const speed = f < T ? (target * 2.2 * Math.pow(f / T, 1.2)) / T : 0;
  const blur = Math.min(14, speed / 9);
  const hit = f >= T;
  const punch = hit ? 1 + 0.12 * Math.exp(-(f - T) / 10) : 1;
  const flash = hit ? interpolate(f - T, [0, 6], [0.6, 0], clamp) : 0;
  const seen = interpolate(f, [s(3.05), s(3.4)], [0, 1], clamp);
  const thumbs = ['#2F6F6A', '#7A4E35', '#3F5F8E', '#8E3B32', '#5E7F5A', '#A8643E'];
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill="#0E2B33" /><Stars seed="fd" /><City y={1150} seed="fd" color="#133944" lit={0.45} h={520} /></Layer>
      <Layer depth={0.8} prog={p}>
        <LampGlow x={540} y={720} r={560} o={hit ? 0.45 : 0.15} />
        <g transform={`translate(540 720) scale(${punch}) translate(-540 -720)`}>
          <Phone x={540} y={720} w={460} h={860}>
            <defs>
              <clipPath id="feedclip"><rect x={0} y={60} width={460} height={790} rx={20} /></clipPath>
              <filter id="mblur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`0 ${blur}`} /></filter>
            </defs>
            <g clipPath="url(#feedclip)">
              <g filter={blur > 0.5 ? 'url(#mblur)' : undefined} transform={`translate(0 ${-off})`}>
                {Array.from({length: N + 3}, (_, i) => {
                  const y = 80 + i * CARD;
                  if (i === N) {
                    return (
                      <g key={i}>
                        <rect x={22} y={y} width={416} height={CARD - 20} rx={22} fill="#fff" stroke={C.gold} strokeWidth={6 * seen} />
                        <rect x={70} y={y + 34} width={150} height={96} rx={46} fill="#111" />
                        <circle cx={118} cy={y + 80} r={11} fill="#fff" /><circle cx={172} cy={y + 80} r={11} fill="#fff" />
                        <path d={`M 130 ${y + 104} Q 145 ${y + 114} 160 ${y + 104}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
                        <text x={238} y={y + 80} fontFamily={FONT} fontWeight={900} fontSize={38} fill="#111">goprep<tspan fill="#E0564B">.gg</tspan></text>
                        <text x={240} y={y + 120} fontFamily={FONT} fontWeight={600} fontSize={22} fill="#4B5B5A">IELTS’ga tizimli</text>
                        <text x={240} y={y + 146} fontFamily={FONT} fontWeight={600} fontSize={22} fill="#4B5B5A">tayyorgarlik</text>
                        <rect x={70} y={y + 170} width={320} height={40} rx={20} fill="#E0564B" />
                        <text x={230} y={y + 198} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#fff">Boshlash</text>
                      </g>
                    );
                  }
                  return (
                    <g key={i}>
                      <rect x={22} y={y} width={416} height={CARD - 20} rx={22} fill="#174C4E" />
                      <rect x={40} y={y + 18} width={170} height={CARD - 56} rx={14} fill={thumbs[i % thumbs.length]} />
                      <path d={`M 112 ${y + 80} L 142 ${y + 98} L 112 ${y + 116} Z`} fill="#fff" opacity={0.85} />
                      <rect x={230} y={y + 40} width={180} height={18} rx={9} fill="#2D6B6C" />
                      <rect x={230} y={y + 74} width={140} height={14} rx={7} fill="#245C5D" />
                      <rect x={230} y={y + 150} width={90} height={14} rx={7} fill="#245C5D" />
                    </g>
                  );
                })}
              </g>
            </g>
          </Phone>
          {/* "caught his eye": gold rays around the post */}
          {seen > 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2; const r = 260 + 40 * seen;
            return <line key={i} x1={540 + Math.cos(a) * r} y1={690 + Math.sin(a) * r * 0.55} x2={540 + Math.cos(a) * (r + 46)} y2={690 + Math.sin(a) * (r + 46) * 0.55} stroke={C.gold} strokeWidth={8} strokeLinecap="round" opacity={interpolate(f, [s(3.05), s(3.3), s(4.2)], [0, 1, 0], clamp)} />;
          })}
        </g>
      </Layer>
      {flash > 0 && <rect width={1080} height={1920} fill="#fff" opacity={flash} />}
    </>
  );
};

const SceneRoadmap: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  const {fps} = useVideoConfig();
  const steps = ['Listening', 'Reading', 'Writing', 'Speaking'];
  const tag = spring({frame: f - s(2.5), fps, config: {damping: 9, stiffness: 160}});
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill={C.wall} /><Books x={60} y={200} w={300} rows={6} seed="rm" /></Layer>
      <Layer depth={0.8} prog={p}>
        <Phone x={640} y={720} w={460} h={860}>
          <text x={230} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill="#fff">Yo‘l xaritasi</text>
          <line x1={90} y1={200} x2={90} y2={720} stroke="#1E5254" strokeWidth={10} />
          {steps.map((st, i) => {
            const a = interpolate(f, [s(0.4) + i * 10, s(0.8) + i * 10], [0, 1], clamp);
            return (
              <g key={st} opacity={0.35 + 0.65 * a}>
                <circle cx={90} cy={230 + i * 150} r={30} fill={a > 0.5 ? C.mint2 : '#1E5254'} />
                {a > 0.5 && <path d={`M 76 ${230 + i * 150} l 10 10 l 18 -20`} stroke="#0B2324" strokeWidth={7} fill="none" strokeLinecap="round" />}
                <rect x={140} y={200 + i * 150} width={270} height={64} rx={18} fill="#174C4E" />
                <text x={160} y={243 + i * 150} fontFamily={FONT} fontWeight={700} fontSize={32} fill="#fff">{i + 1}. {st}</text>
              </g>
            );
          })}
        </Phone>
        <g transform={`translate(250 1000) rotate(${-12 + Math.sin(f / 10) * 3}) scale(${tag})`}>
          <path d="M -150 -70 L 100 -70 L 160 0 L 100 70 L -150 70 Z" fill={C.gold} />
          <circle cx={100} cy={0} r={14} fill={C.wall} />
          <text x={-30} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#0B2324">arzon</text>
        </g>
      </Layer>
    </>
  );
};

const SceneSavings: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill="#173F40" /><ArchWindow x={640} y={240} w={330} h={520} /></Layer>
      <Layer depth={0.8} prog={p}>
        <LampGlow x={540} y={880} r={480} o={0.35} />
        <Desk x={540} y={1040} w={860} />
        {/* jar with coins */}
        <path d="M 170 760 L 160 1030 Q 160 1040 172 1040 L 378 1040 Q 390 1040 390 1030 L 380 760 Z" fill={C.glass} opacity={0.35} stroke="#CFE9E2" strokeWidth={6} />
        {Array.from({length: 14}, (_, i) => <ellipse key={i} cx={200 + (i % 4) * 50} cy={1015 - Math.floor(i / 4) * 34} rx={26} ry={12} fill={C.gold} stroke="#C08F4E" strokeWidth={3} />)}
        {/* coins flying to laptop */}
        {[0, 1, 2, 3].map((i) => {
          const t = interpolate(f, [s(0.9) + i * 8, s(1.7) + i * 8], [0, 1], clamp);
          if (t <= 0 || t >= 1) return null;
          return <ellipse key={i} cx={280 + t * 460} cy={760 - Math.sin(t * Math.PI) * 220 + t * 90} rx={24} ry={24 * Math.abs(Math.cos(t * 9))} fill={C.gold} />;
        })}
        <Laptop x={760} y={1040} s={1.1} glow>
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">goprep<tspan fill={C.gold}>.gg</tspan></text>
        </Laptop>
      </Layer>
    </>
  );
};

const SceneScore: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  const score = useCount(5.0, 7.5, s(1.6), s(2.5));
  const month = Math.min(4, 1 + Math.floor(interpolate(f, [s(0.4), s(1.4)], [0, 3.99], clamp)));
  const hit = f >= s(2.5);
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill="#0F2C36" /><Stars seed="sc" n={80} /></Layer>
      <Layer depth={0.7} prog={p}>
        {/* calendar */}
        <g transform="translate(250 460)">
          <rect x={-130} y={-130} width={260} height={270} rx={20} fill="#F4EBD8" />
          <rect x={-130} y={-130} width={260} height={70} rx={20} fill={C.red} />
          <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#1C3A3B">{month}</text>
          <text x={0} y={118} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} fill="#5C6D6C">oy</text>
        </g>
        <LampGlow x={680} y={700} r={520} o={hit ? 0.55 : 0.2} />
        <g transform={`translate(680 760) scale(${hit ? 1 + 0.06 * Math.sin((f - s(2.5)) / 3) * Math.exp(-(f - s(2.5)) / 20) : 1})`}>
          <circle r={210} fill="#0E2627" stroke={hit ? C.gold : C.mint} strokeWidth={14} />
          <text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill={hit ? C.gold : '#fff'}>{score}</text>
          <text y={120} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={38} fill={C.glass}>IELTS</text>
        </g>
        {hit && Array.from({length: 26}, (_, i) => {
          const t = (f - s(2.5)) / 30; const a = random(`cf${i}`) * Math.PI * 2; const v = 200 + random(`cv${i}`) * 300;
          return <rect key={i} x={680 + Math.cos(a) * v * t} y={760 + Math.sin(a) * v * t + 200 * t * t} width={14} height={22} fill={[C.gold, C.mint2, C.red, '#fff'][i % 4]} transform={`rotate(${t * 400 + i * 30} ${680 + Math.cos(a) * v * t} ${760 + Math.sin(a) * v * t + 200 * t * t})`} opacity={Math.max(0, 1 - t / 1.6)} />;
        })}
      </Layer>
      <Layer depth={1.2} prog={p}><Person x={300} y={1250} s={1.05} pose={hit ? 'cheer' : 'stand'} /></Layer>
    </>
  );
};

const SceneUniversity: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  const {fps} = useVideoConfig();
  const g = spring({frame: f - s(1.7), fps, config: {damping: 12, stiffness: 140}});
  return (
    <>
      <Layer depth={0} prog={p}>
        <defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B4D57" /><stop offset="0.75" stopColor="#E7B57A" /></linearGradient></defs>
        <rect width={1080} height={1300} fill="url(#dawn)" />
        <path d="M 0 700 Q 300 600 560 680 T 1080 640 L 1080 1300 L 0 1300 Z" fill="#2E6461" opacity={0.6} />
      </Layer>
      <Layer depth={0.5} prog={p}>
        {/* three universities, the middle one in front */}
        {[{x: 200, k: 0.6}, {x: 880, k: 0.6}, {x: 540, k: 1}].map((u, i) => (
          <g key={i} transform={`translate(${u.x} 980) scale(${u.k})`}>
            <rect x={-300} y={-300} width={600} height={300} fill={i === 2 ? '#E9E2D0' : '#C9C2AF'} />
            <path d="M -330 -300 L 0 -450 L 330 -300 Z" fill={i === 2 ? '#D8CFB8' : '#B5AE9B'} />
            {[0, 1, 2, 3, 4, 5].map((c) => <rect key={c} x={-270 + c * 104} y={-280} width={34} height={270} fill={i === 2 ? '#F6F1E4' : '#DCD5C2'} />)}
            <rect x={-340} y={-14} width={680} height={20} fill="#A39C88" />
          </g>
        ))}
        <rect x={0} y={990} width={1080} height={400} fill="#21504E" />
      </Layer>
      <Layer depth={1.1} prog={p}>
        <Person x={540} y={1200} s={1.15} cap pose={g > 0.5 ? 'cheer' : 'stand'} />
        <g transform={`translate(800 ${720 - 30 * g}) scale(${g}) rotate(${10 - 10 * g})`} opacity={g}>
          <rect x={-120} y={-150} width={240} height={300} rx={12} fill="#F4EBD8" />
          <text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#1C3A3B">GRANT</text>
          <rect x={-80} y={-10} width={160} height={12} rx={6} fill="#C9C1AE" /><rect x={-80} y={24} width={120} height={12} rx={6} fill="#C9C1AE" />
          <circle cx={60} cy={95} r={34} fill={C.gold} />
        </g>
      </Layer>
    </>
  );
};

const SceneFamily: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame(); const p = prog(f, d);
  return (
    <>
      <Layer depth={0} prog={p}><rect width={1080} height={1300} fill={C.wall} /><ArchWindow x={360} y={220} w={360} h={560} /><rect x={0} y={1060} width={1080} height={300} fill={C.wood2} /><rect x={140} y={1080} width={800} height={120} rx={14} fill={C.rug} opacity={0.8} /></Layer>
      <Layer depth={0.9} prog={p}>
        <LampGlow x={540} y={820} r={520} o={0.5} />
        <Person x={330} y={1150} s={1.05} beard shirt="#3E6E6A" />
        <Person x={750} y={1150} s={1.0} hijab shirt="#5B8B7E" />
        <Person x={540} y={1170} s={1.12} cap />
        {[0, 1, 2].map((i) => {
          const a = interpolate(f, [s(0.7) + i * 6, s(1.1) + i * 6], [0, 1], clamp);
          const x = 330 + i * 210; const y = 640 - a * 40 + Math.sin(f / 10 + i) * 6;
          return <path key={i} d={`M ${x} ${y + 26} C ${x - 44} ${y - 4} ${x - 20} ${y - 36} ${x} ${y - 12} C ${x + 20} ${y - 36} ${x + 44} ${y - 4} ${x} ${y + 26} Z`} fill={C.gold} opacity={a} />;
        })}
      </Layer>
    </>
  );
};

const SceneEnd: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f, fps, config: {damping: 12, stiffness: 120}});
  return (
    <>
      <rect width={1080} height={1300} fill={C.bg} />
      <LampGlow x={540} y={700} r={600} o={0.3} />
      <g transform={`translate(540 640) scale(${a})`}>
        <rect x={-180} y={-120} width={360} height={240} rx={110} fill="#fff" />
        <circle cx={-62} cy={-10} r={30} fill="#111" /><circle cx={62} cy={-10} r={30} fill="#111" />
        <path d="M -30 50 Q 0 76 30 50" stroke="#111" strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>
      <text x={540} y={960} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill="#fff" opacity={interpolate(f, [8, 18], [0, 1], clamp)}>goprep<tspan fill={C.gold}>.gg</tspan></text>
    </>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  graduate: SceneGraduate, repetitor: SceneRepetitor, class: SceneClass, certificate: SceneCertificate, study: SceneStudy,
  mock: SceneMock, find: SceneFind, roadmap: SceneRoadmap, savings: SceneSavings, score: SceneScore,
  university: SceneUniversity, family: SceneFamily, end: SceneEnd,
};

/* ------------------------------------------------------------------ subtitles, logo, composition */

export type Cue = {text: string; start: number; end: number; keys?: string[]};
export type IllScene = {id: string; start: number; end: number};
// `logo` / `brand` are an always-on top logo and bottom brand line; both off unless asked for.
export type IllustratedProps = {scenes: IllScene[]; cues: Cue[]; end: number; brand?: string; logo?: boolean; voice?: string; sfx?: boolean};

const Subtitle: React.FC<{cue: Cue; outAt: number}> = ({cue, outAt}) => {
  const f = useCurrentFrame();
  const words = cue.text.split(' ');
  const a = s(cue.start); const b = s(cue.end);
  const fade = interpolate(f, [a - 4, a, outAt - 4, outAt], [0, 1, 1, 0], clamp);
  const keys = (cue.keys ?? []).map((k) => k.toLowerCase());
  const isKey = (w: string) => keys.some((k) => k.split(' ').some((kw) => w.toLowerCase().replace(/[,.!?]/g, '') === kw.replace(/[,.!?]/g, '')));
  return (
    <div style={{position: 'absolute', top: 1390, left: 70, right: 70, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.22, letterSpacing: '-0.01em', opacity: fade}}>
      {words.map((w, i) => {
        // Karaoke: each word lights up in turn across the cue.
        const t = a + ((b - a) * i) / words.length;
        const on = interpolate(f, [t - 2, t + 4], [0, 1], clamp);
        const key = isKey(w);
        const color = key ? C.gold : '#FFFFFF';
        return <span key={i} style={{color, opacity: 0.38 + 0.62 * on, filter: `blur(${(1 - on) * 1.5}px)`}}>{w}{i < words.length - 1 ? ' ' : ''}</span>;
      })}
    </div>
  );
};

const Logo: React.FC = () => (
  <svg width={110} height={80} viewBox="-60 -44 120 88" style={{position: 'absolute', top: 92, left: 485}}>
    <rect x={-56} y={-38} width={112} height={76} rx={36} fill="none" stroke="#E6F2EE" strokeWidth={7} />
    <circle cx={-20} cy={-4} r={9} fill="#E6F2EE" /><circle cx={20} cy={-4} r={9} fill="#E6F2EE" />
    <path d="M -10 16 Q 0 24 10 16" stroke="#E6F2EE" strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

const XFADE = 12;

export const IllustratedReel: React.FC<IllustratedProps> = (p) => {
  const f = useCurrentFrame();
  const sfx: {f: number; file: string; vol: number; d: number}[] = [];
  if (p.sfx) {
    p.scenes.forEach((sc, i) => { if (i > 0) sfx.push({f: s(sc.start) - 10, file: 'whoosh', vol: 0.3, d: 20}); });
    const at = (id: string, dt: number, file: string, vol: number, d = 40) => { const sc = p.scenes.find((x) => x.id === id); if (sc) sfx.push({f: s(sc.start + dt), file, vol, d}); };
    at('graduate', 1.9, 'chime', 0.35); at('repetitor', 1.2, 'pop', 0.4); at('class', 1.75, 'scribble', 0.5, 26);
    at('certificate', 2.2, 'chime', 0.4); at('certificate', 0, 'pop', 0.4);
    [0.4, 0.7, 1.0, 1.3].forEach((t) => at('mock', t, 'tick', 0.45)); at('mock', 1.6, 'impact', 0.3);
    // Feed flicks speeding up, then the sudden stop on the GoPrep post.
    [0.1, 0.55, 0.85, 1.05, 1.2].forEach((t, i) => at('find', t, 'whoosh', 0.18 + i * 0.04, 14)); at('find', FIND_STOP, 'impact', 0.5); at('find', FIND_STOP, 'pop', 0.6); at('find', 3.05, 'chime', 0.45);
    [0.4, 0.73, 1.07, 1.4].forEach((t) => at('roadmap', t, 'pop', 0.45)); at('roadmap', 2.5, 'ding', 0.35);
    [0.9, 1.17, 1.43, 1.7].forEach((t) => at('savings', t, 'pop', 0.35));
    [0.4, 0.73, 1.07].forEach((t) => at('score', t, 'tick', 0.45)); at('score', 2.5, 'impact', 0.45); at('score', 2.5, 'chime', 0.5);
    at('university', 1.7, 'chime', 0.45); at('family', 0.7, 'chime', 0.4); at('end', 0, 'ding', 0.4);
  }
  return (
    <AbsoluteFill style={{background: C.deep, fontFamily: FONT}}>
      {p.scenes.map((sc) => {
        const a = s(sc.start); const b = s(sc.end); const d = b - a;
        if (f < a || f > b + XFADE) return null;
        const Scene = SCENES[sc.id];
        // Soft cross-dissolve: each scene fades in (with a touch of blur) on top of the previous one,
        // which stays fully drawn underneath until the dissolve is over. Plus a slow push-in.
        const op = interpolate(f, [a, a + XFADE], [0, 1], clamp);
        const push = 1 + 0.06 * interpolate(f, [a, b], [0, 1], clamp);
        return (
          <AbsoluteFill key={sc.id + sc.start} style={{opacity: op, filter: op < 1 ? `blur(${(1 - op) * 6}px)` : undefined}}>
            <Sequence from={a} layout="none">
              <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
                <g transform={`translate(540 700) scale(${push}) translate(-540 -700)`}>{Scene ? <Scene d={d} /> : null}</g>
              </svg>
            </Sequence>
          </AbsoluteFill>
        );
      })}
      {/* Dark lower third for the subtitles, like the reference. */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(11,35,36,0) 52%, rgba(11,35,36,.85) 66%, ${C.deep} 76%)`}} />
      {p.logo && <Logo />}
      {(() => {
        // One cue at a time: the latest one that has started, faded out just before the next begins.
        let i = -1;
        p.cues.forEach((c, j) => { if (f >= s(c.start) - 4) i = j; });
        if (i < 0) return null;
        const c = p.cues[i]; const next = p.cues[i + 1];
        const outAt = Math.min(s(c.end) + 8, next ? s(next.start) - 4 : Infinity);
        return f < outAt ? <Subtitle key={i} cue={c} outAt={outAt} /> : null;
      })()}
      {p.brand && <div style={{position: 'absolute', top: 1660, width: '100%', textAlign: 'center', color: 'rgba(230,242,238,.75)', fontSize: 34, fontWeight: 600}}>{p.brand}</div>}
      {p.voice && <Audio src={src(p.voice)} />}
      {sfx.map((e, i) => (
        <Sequence key={i} from={Math.max(0, e.f)} durationInFrames={e.d} layout="none"><Audio src={staticFile(`sfx/${e.file}.wav`)} volume={e.vol} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const illustratedDuration = (p: IllustratedProps) => s(p.end);
