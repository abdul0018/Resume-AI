import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Media, WordReveal, clamp, src} from './kit';

/**
 * Style C: talking-head "N habits" edit (reference: "IELTS 8 uchun sizda bo'lishi kerak bo'lgan 5 ta odat").
 *   1. Talking head + glowing pill hook title (pill, small corner badge, italic subline, bold last line).
 *   2. Push to a grey pin board of numbered sticky cards; the camera flies to each card as it is named.
 *   3. Push to product clips (site/app), cut on the voiceover's beats.
 *   4. Push back to the talking head: glowing title + icon tiles, then a search-style pill that types the
 *      comment keyword and taps send.
 * The voice runs continuously underneath (one `voice` track); every time in props is in seconds of that track.
 */

const FPS = 30;
const BLUE = '#2F6BFF';
const BLUE_DEEP = '#1D4ED8';

export type HabitCard = {n: string; title: string; desc: string; color: string; at: number};
export type AppClip = {src: string; from: number; to: number};
export type IconKind = 'headphones' | 'book' | 'pen' | 'mic' | 'chart' | 'star';
export type HabitsProps = {
  head: string; // talking-head video (muted; voice comes from `voice`)
  voice: string;
  hook: {pill: string; badge?: string; badgeAt?: number; sub: string; subAt: number; last?: string; lastAt?: number};
  boardAt: number;
  cards: HabitCard[];
  appAt: number;
  clips: AppClip[];
  ctaAt: number;
  cta: {title: string; icons: IconKind[]; iconsAt: number; keyword: string; pillAt: number; typeAt: number};
  end: number;
  sfx?: boolean;
};

const s = (sec: number) => Math.round(sec * FPS);

/** Horizontal "push": outgoing layer slides left while the incoming one slides in from the right. */
const PUSH = 9;
const pushX = (frame: number, cutAt: number, incoming: boolean) => {
  const k = interpolate(frame, [cutAt - PUSH, cutAt], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return incoming ? (1 - k) * 100 : -k * 100;
};

/* ---------- 1 & 4: talking head overlays ---------- */

const GlowPill: React.FC<{text: string; badge?: string; badgeAt: number}> = ({text, badge, badgeAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 11, stiffness: 200}});
  const b = spring({frame: frame - badgeAt, fps, config: {damping: 10, stiffness: 260}});
  return (
    <div style={{position: 'relative', display: 'inline-block', transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`, opacity: interpolate(frame, [0, 4], [0, 1], clamp)}}>
      <div style={{background: '#fff', color: BLUE_DEEP, fontWeight: 900, fontSize: 112, letterSpacing: '-0.02em', lineHeight: 1, padding: '22px 48px 26px', borderRadius: 40, border: `7px solid ${BLUE}`,
        boxShadow: `0 0 0 4px rgba(255,255,255,.55), 0 0 40px 6px rgba(47,107,255,.85), inset 0 0 22px rgba(47,107,255,.35)`}}>{text}</div>
      {badge && frame >= badgeAt && (
        <div style={{position: 'absolute', right: -14, top: -40, background: BLUE_DEEP, color: '#fff', fontWeight: 800, fontSize: 44, padding: '4px 22px 8px', borderRadius: 18, border: '3px solid #fff', boxShadow: '0 6px 18px rgba(0,0,0,.3)', transform: `scale(${b})`, transformOrigin: '80% 100%'}}>{badge}</div>
      )}
    </div>
  );
};

const GlowTitle: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 8], [0, 1], clamp);
  return (
    <div style={{color: '#5B8CFF', fontWeight: 900, fontSize: 118, letterSpacing: '-0.03em', lineHeight: 1, textAlign: 'center', opacity: op, filter: `blur(${interpolate(frame, [0, 8], [12, 0], clamp)}px)`,
      transform: `scale(${interpolate(frame, [0, 10], [1.15, 1], {...clamp, easing: Easing.out(Easing.cubic)})})`,
      textShadow: '0 4px 10px rgba(0,0,0,.55), 0 0 24px rgba(47,107,255,.95), 0 0 60px rgba(47,107,255,.7)', WebkitTextStroke: '3px #fff'}}>{text}</div>
  );
};

const GLYPH: Record<IconKind, React.ReactNode> = {
  headphones: <><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="5" height="7" rx="2" /><rect x="16" y="14" width="5" height="7" rx="2" /></>,
  book: <path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1V5zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1V5z" />,
  pen: <><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" /><path d="M14 6l3 3" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
};

const IconTile: React.FC<{kind: IconKind; at: number}> = ({kind, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 9, stiffness: 240}});
  return (
    <div style={{width: 150, height: 150, borderRadius: 38, background: `linear-gradient(160deg, #6E9BFF 0%, ${BLUE} 45%, ${BLUE_DEEP} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 0 3px rgba(255,255,255,.5), 0 0 30px rgba(47,107,255,.8), 0 14px 30px rgba(0,0,0,.3)', transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-14, 0])}deg)`}}>
      <svg viewBox="0 0 24 24" width="84" height="84" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{GLYPH[kind]}</svg>
    </div>
  );
};

/** Search-style pill that types `text` at `typeAt` and taps the arrow button. */
const SearchPill: React.FC<{text: string; at: number; typeAt: number}> = ({text, at, typeAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const enter = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 180}});
  const shown = frame < typeAt ? 0 : Math.min(text.length, Math.floor((frame - typeAt) / 4) + 1);
  const doneAt = typeAt + text.length * 4 + 4;
  const press = frame >= doneAt ? spring({frame: frame - doneAt, fps, config: {damping: 8, stiffness: 300}}) : 0;
  const caret = frame < doneAt && Math.floor(frame / 8) % 2 === 0;
  return (
    <div style={{width: 760, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 999, padding: '14px 14px 14px 46px', boxShadow: '0 0 0 4px rgba(255,255,255,.35), 0 18px 50px rgba(0,0,0,.35)',
      transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) scale(${interpolate(enter, [0, 1], [0.8, 1])})`, opacity: interpolate(enter, [0, 1], [0, 1])}}>
      <div style={{flex: 1, fontSize: 70, fontWeight: 800, color: '#111', letterSpacing: '0.01em'}}>
        {text.slice(0, shown)}
        {caret && <span style={{display: 'inline-block', width: 5, height: '0.9em', background: BLUE, marginLeft: 4, verticalAlign: '-0.08em'}} />}
      </div>
      <div style={{width: 150, height: 96, borderRadius: 48, background: `linear-gradient(180deg, ${BLUE}, ${BLUE_DEEP})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(47,107,255,.7)',
        transform: `scale(${1 - 0.15 * Math.sin(Math.min(1, press) * Math.PI)})`}}>
        <svg viewBox="0 0 24 24" width="58" height="58" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </div>
    </div>
  );
};

/** Talking head with gentle punch-in zooms so a single take does not feel static. */
const Head: React.FC<{video: string; punches?: number[]}> = ({video, punches = []}) => {
  const frame = useCurrentFrame(); // global frame: the head video is one continuous take under the whole edit
  let z = interpolate(frame, [0, 900], [1.0, 1.06], clamp);
  punches.forEach((p) => { if (frame >= s(p)) z += 0.06; });
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={src(video)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: '50% 35%'}} />
    </AbsoluteFill>
  );
};

/* ---------- 2: pin board ---------- */

const CANVAS = {w: 1400, h: 2300};
const SLOTS = [{x: 430, y: 470, r: -5}, {x: 1000, y: 760, r: 4}, {x: 410, y: 1160, r: -8}, {x: 1010, y: 1470, r: 5}, {x: 440, y: 1880, r: -3}, {x: 1000, y: 2080, r: 3}];
const CARD = {w: 430, h: 520};

const shade = (hex: string, amt: number) => `color-mix(in srgb, ${hex} ${100 - Math.abs(amt)}%, ${amt < 0 ? 'black' : 'white'})`;

const PinCard: React.FC<{c: HabitCard; focus: number}> = ({c, focus}) => (
  <div style={{width: CARD.w, height: CARD.h, background: '#fff', borderRadius: 26, padding: 34, boxSizing: 'border-box', position: 'relative',
    boxShadow: `0 ${20 + focus * 20}px ${40 + focus * 30}px rgba(0,0,0,${0.16 + focus * 0.1}), 0 2px 6px rgba(0,0,0,.08)`}}>
    <div style={{position: 'absolute', left: '50%', top: -22, width: 56, height: 56, marginLeft: -28, borderRadius: 28, background: `radial-gradient(circle at 35% 30%, ${shade(c.color, 55)}, ${c.color} 45%, ${shade(c.color, -45)} 100%)`, boxShadow: '6px 10px 10px rgba(0,0,0,.28)'}} />
    <div style={{width: '100%', height: '100%', borderRadius: 18, padding: '30px 30px', boxSizing: 'border-box', background: `linear-gradient(160deg, ${shade(c.color, 72)} 0%, ${shade(c.color, 40)} 100%)`}}>
      <div style={{fontSize: 74, fontWeight: 900, fontStyle: 'italic', color: shade(c.color, -40), lineHeight: 1, letterSpacing: '-0.03em'}}>{c.n}</div>
      <div style={{fontSize: 50, fontWeight: 800, color: '#14161a', marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1.05}}>{c.title}</div>
      <div style={{fontSize: 25, fontWeight: 500, color: '#1f2228', marginTop: 16, lineHeight: 1.28}}>{c.desc}</div>
    </div>
  </div>
);

const Board: React.FC<{cards: HabitCard[]; startSec: number; durF: number}> = ({cards, startSec, durF}) => {
  const frame = Math.max(0, useCurrentFrame() - s(startSec));
  const fit = 1080 / CANVAS.w;
  // Camera keys: overview, then each card as it is named, then a slight pull-back before leaving.
  const keys = [{f: 0, x: CANVAS.w / 2, y: CANVAS.h / 2, z: fit}];
  cards.forEach((c, i) => {
    const sl = SLOTS[i % SLOTS.length];
    const f = Math.max(keys[keys.length - 1].f + 6, s(c.at - startSec) - 4);
    keys.push({f, x: sl.x, y: sl.y, z: 1.55});
  });
  const last = keys[keys.length - 1];
  keys.push({f: Math.max(last.f + 10, durF - 12), x: last.x, y: last.y, z: 1.55}, {f: durF, x: last.x, y: last.y + 120, z: 1.25});
  // Hold each key, then travel to the next in 16 frames.
  let cam = keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]; const b = keys[i + 1];
    if (frame >= b.f) { cam = b; continue; }
    const k = interpolate(frame, [b.f - 16, b.f], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    cam = {f: frame, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k};
    break;
  }
  const focusIdx = cards.findIndex((c, i) => frame >= s(c.at - startSec) - 4 && (i === cards.length - 1 || frame < s(cards[i + 1].at - startSec) - 4));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%, #F1F2F4 0%, #E3E5E8 100%)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: CANVAS.w, height: CANVAS.h, transformOrigin: '0 0',
        transform: `translate(${540 - cam.x * cam.z}px, ${960 - cam.y * cam.z}px) scale(${cam.z})`}}>
        {cards.map((c, i) => {
          const sl = SLOTS[i % SLOTS.length];
          const focus = i === focusIdx ? interpolate(frame - (s(c.at - startSec) - 4), [0, 10], [0, 1], clamp) : 0;
          return (
            <div key={i} style={{position: 'absolute', left: sl.x - CARD.w / 2, top: sl.y - CARD.h / 2, transform: `rotate(${sl.r * (1 - focus * 0.6)}deg) scale(${1 + focus * 0.05})`}}>
              <PinCard c={c} focus={focus} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 3: product clips ---------- */

const Clips: React.FC<{clips: AppClip[]; startF: number}> = ({clips, startF}) => {
  let at = startF;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {clips.map((c, i) => {
        const d = s(c.to - c.from);
        const lead = i === 0 ? PUSH : 0;
        const el = (
          <Sequence key={i} from={at - lead} durationInFrames={d + lead}>
            <ClipShot clip={{...c, from: c.from - lead / FPS}} d={d + lead} />
          </Sequence>
        );
        at += d;
        return el;
      })}
    </AbsoluteFill>
  );
};
const ClipShot: React.FC<{clip: AppClip; d: number}> = ({clip, d}) => {
  const frame = useCurrentFrame();
  const punch = interpolate(frame, [0, 7], [1.1, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return <AbsoluteFill style={{transform: `scale(${punch})`}}><Media src={clip.src} dur={d} zoomTo={1.04} startFrom={s(clip.from)} /></AbsoluteFill>;
};

/* ---------- composition ---------- */

export const habitsDuration = (p: HabitsProps) => s(p.end);

export const HabitsReel: React.FC<HabitsProps> = (p) => {
  const frame = useCurrentFrame();
  const A = s(p.boardAt); const B = s(p.appAt); const C = s(p.ctaAt); const END = s(p.end);
  const layer = (from: number, to: number, children: React.ReactNode, inX: boolean, outX: boolean) => {
    if (frame < from - PUSH || frame >= to) return null;
    const x = frame < from ? pushX(frame, from, true) : (outX && frame >= to - PUSH ? pushX(frame, to, false) : 0);
    return <AbsoluteFill style={{transform: `translateX(${inX || frame >= from ? x : 0}%)`}}>{children}</AbsoluteFill>;
  };
  const sfx: {f: number; file: string; vol: number}[] = [];
  if (p.sfx) {
    sfx.push({f: 0, file: 'pop', vol: 0.8});
    if (p.hook.badge) sfx.push({f: s(p.hook.badgeAt ?? 1), file: 'pop', vol: 0.6});
    if (p.hook.last) sfx.push({f: s(p.hook.lastAt ?? 2), file: 'impact', vol: 0.5});
    [A, B, C].forEach((f) => sfx.push({f: f - PUSH - 4, file: 'whoosh', vol: 0.6}));
    p.cards.forEach((c) => sfx.push({f: s(c.at) - 4, file: 'pop', vol: 0.6}));
    let at = B; p.clips.forEach((c, i) => { if (i > 0) sfx.push({f: at - 6, file: 'whoosh', vol: 0.35}); at += s(c.to - c.from); });
    p.cta.icons.forEach((_, i) => sfx.push({f: s(p.cta.iconsAt) + i * 7, file: 'pop', vol: 0.55}));
    sfx.push({f: s(p.cta.pillAt), file: 'whoosh', vol: 0.4});
    [...p.cta.keyword].forEach((_, i) => sfx.push({f: s(p.cta.typeAt) + i * 4, file: 'key', vol: 0.9}));
    sfx.push({f: s(p.cta.typeAt) + p.cta.keyword.length * 4 + 4, file: 'ding', vol: 0.35});
  }
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: "'Inter Tight Variable', 'Inter Tight', sans-serif"}}>
      {/* 1. Hook on the talking head */}
      {layer(0, A, (
        <AbsoluteFill>
          <Head video={p.head} punches={p.hook.lastAt ? [p.hook.lastAt] : []} />
          <div style={{position: 'absolute', top: '5.5%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
            <GlowPill text={p.hook.pill} badge={p.hook.badge} badgeAt={s(p.hook.badgeAt ?? 1)} />
            <WordReveal text={p.hook.sub} delay={s(p.hook.subAt)} stagger={4} style={{color: '#fff', fontSize: 58, fontWeight: 500, fontStyle: 'italic', textShadow: '0 3px 14px rgba(0,0,0,.6)'}} />
            {p.hook.last && <WordReveal text={p.hook.last} delay={s(p.hook.lastAt ?? 2)} stagger={5} style={{color: '#fff', fontSize: 96, fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', textShadow: '0 0 24px rgba(47,107,255,.9), 0 4px 16px rgba(0,0,0,.5)'}} />}
          </div>
        </AbsoluteFill>
      ), false, true)}
      {/* 2. Pin board */}
      {layer(A, B, <Board cards={p.cards} startSec={p.boardAt} durF={B - A} />, true, true)}
      {/* 3. Product clips */}
      {layer(B, C, <Clips clips={p.clips} startF={B} />, true, true)}
      {/* 4. CTA on the talking head */}
      {layer(C, END + 1, (
        <AbsoluteFill>
          <Head video={p.head} punches={[p.cta.typeAt]} />
          <Sequence from={C} layout="none">
            <div style={{position: 'absolute', top: '5%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
              <GlowTitle text={p.cta.title} />
              <div style={{display: 'flex', gap: 22}}>{p.cta.icons.map((k, i) => <IconTile key={i} kind={k} at={s(p.cta.iconsAt - p.ctaAt) + i * 7} />)}</div>
            </div>
            <div style={{position: 'absolute', top: '64%', width: '100%', display: 'flex', justifyContent: 'center'}}>
              <SearchPill text={p.cta.keyword} at={s(p.cta.pillAt - p.ctaAt)} typeAt={s(p.cta.typeAt - p.ctaAt)} />
            </div>
          </Sequence>
        </AbsoluteFill>
      ), true, false)}
      <Audio src={src(p.voice)} />
      {sfx.map((e, i) => (
        <Sequence key={i} from={Math.max(0, e.f)} durationInFrames={45} layout="none"><Audio src={staticFile(`sfx/${e.file}.wav`)} volume={e.vol * 0.5} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const habitsDefaults: HabitsProps = {
  head: 'head.mp4',
  voice: 'voice.wav',
  hook: {pill: 'IELTS 8+', badge: 'uchun', badgeAt: 1.1, sub: 'sizda bo‘lishi kerak bo‘lgan', subAt: 1.4, last: '5 ta odat', lastAt: 2.34},
  boardAt: 3.25,
  cards: [
    {n: '01', title: 'Shadowing', desc: 'Ingliz tilidagi audio yoki videoni eshitib, speaker bilan bir vaqtda takrorlash orqali talaffuz va fluency’ni rivojlantirish.', color: '#7FA8F5', at: 3.28},
    {n: '02', title: 'Podcast', desc: 'Turli mavzulardagi suhbatlarni har kuni eshitish: Listening va so‘z boyligi o‘sadi.', color: '#C08CF2', at: 5.16},
    {n: '03', title: 'Article', desc: 'Ingliz tilidagi maqolalarni o‘qish: yangi fikr va iboralar, Reading tezligi oshadi.', color: '#F5B36B', at: 7.16},
    {n: '04', title: 'Tahlil qilish', desc: 'Testdan keyin xatolaringizni chuqur o‘rganib, sababini topish va xulosa chiqarish.', color: '#79D488', at: 9.12},
    {n: '05', title: 'GoPrep', desc: 'IELTS platformasi: mock testlar, materiallar, Speaking va Writing uchun AI tahlil va feedback.', color: '#F2E06B', at: 11.66},
  ],
  appAt: 14.42,
  clips: [{src: 'site.mp4', from: 3.0, to: 5.8}, {src: 'site.mp4', from: 6.4, to: 8.2}, {src: 'site.mp4', from: 10.0, to: 12.68}],
  ctaAt: 21.7,
  cta: {title: 'IELTS UCHUN', icons: ['headphones', 'book', 'pen', 'mic'], iconsAt: 21.95, keyword: 'SAYT', pillAt: 23.5, typeAt: 24.28},
  end: 26.9,
  sfx: true,
};
