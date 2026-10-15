import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, Series, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BounceArrow, BrowserMockup, C, CharReveal, CommentBox, CtaKeyword, FONT, GradeChips, GridBoard, HERO_BG, HighlightCaption, HookBanner, ImpactFlash, LightLeak, Media, ProgressBar, RedPulse, Shake, Sparks, StepPill, TimerPill, WordReveal, YearTag, clamp, impactScale, impactShake, src} from './kit';

export type Tag = {label: string; x: number; y: number; at: number};

export type Beat =
  | {type: 'hero'; dur: number; image: string; fit?: 'cutout' | 'cover'; tags: Tag[]; title: string; subtitle: string; titleAt: number; titleTop?: number; hook?: {badge?: string; text: string}}
  | {type: 'caption'; dur: number; media: string; label: string; statement?: string; statementAt?: number; dim?: number[]; slide?: number[]; strike?: number[]; flash?: boolean}
  | {type: 'punch'; dur: number; media: string; word: string; sub?: string}
  | {type: 'broll'; dur: number; media: string; origin?: string; startFrom?: number; steps?: {at: number; text: string}[]; chips?: {at: number; items: string[]}}
  | {type: 'tension'; dur: number; media: string; origin?: string; zoomTo?: number; startFrom?: number;
      line?: string; lineAt?: number; small?: string; punch?: string; punchAt?: number; textPos?: 'top' | 'bottom';
      timer?: {from: number; to?: number; at?: number}; shake?: boolean; pulse?: boolean}
  | {type: 'board'; dur: number; headline: string; sub: string; subAt?: number; mockup?: string; mockupAt?: number}
  | {type: 'cta'; dur: number; line1: string; line2: string; keyword: string; line2At?: number; keywordAt?: number; comment?: boolean};

export type PromoProps = {beats: Beat[]; voiceover?: string; music?: string; musicVolume?: number; progress?: boolean; sfx?: boolean; sfxVolume?: number};

const shadow = '0 4px 24px rgba(0,0,0,.35)';

/**
 * Hero camera: push in on the first tag, pan to each following tag as it pops,
 * then pull back to the wide shot just before the title builds.
 * Pans aim at the tag's x position (50 = centre).
 */
const heroCamera = (frame: number, tags: Tag[], titleAt: number, s: (sec: number) => number, keepInFrame = false) => {
  const zoom = 1.35;
  const keys: {t: number; scale: number; x: number}[] = [{t: 0, scale: 1, x: 0}];
  tags.forEach((g) => keys.push({t: s(g.at) + 8, scale: zoom, x: (50 - g.x) * zoom}));
  const back = Math.max(keys[keys.length - 1].t + 6, titleAt - 8);
  keys.push({t: back, scale: zoom, x: keys[keys.length - 1].x}, {t: back + 6, scale: 1, x: 0});
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const ts = keys.map((k) => k.t);
  const scale = interpolate(frame, ts, keys.map((k) => k.scale), ease);
  const x = interpolate(frame, ts, keys.map((k) => k.x), ease);
  // A full-frame image must never pan past its own edge.
  const maxX = ((scale - 1) / 2) * 100;
  return {scale, x: keepInFrame ? Math.max(-maxX, Math.min(maxX, x)) : x};
};

/** Frame (within the caption beat) where the strikethrough is drawn: just after the last statement word lands. */
const strikeFrame = (b: Extract<Beat, {type: 'caption'}>, fps: number) =>
  Math.round((b.statementAt ?? 1) * fps) + ((b.statement ?? '').split(' ').length - 1) * 9 + 8;

type Sfx = {file: 'pop' | 'whoosh' | 'impact' | 'tick' | 'riser' | 'ding' | 'key' | 'scratch'; frame: number; vol: number};

/** Places sound effects on the same frames the visuals use: whoosh into every cut, pops on text, impacts on punches. */
const sfxEvents = (beats: Beat[], fps: number): Sfx[] => {
  const out: Sfx[] = [];
  const s = (sec: number) => Math.round(sec * fps);
  let start = 0;
  beats.forEach((b, i) => {
    const at = (f: number, file: Sfx['file'], vol = 1) => out.push({file, frame: start + f, vol});
    const dur = Math.round(b.dur * fps);
    if (i > 0) at(-9, 'whoosh', 0.55);
    switch (b.type) {
      case 'hero':
        if (b.hook) { at(0, 'impact', 0.8); at(2, 'pop', 0.8); }
        b.tags.forEach((g) => at(s(g.at), 'pop', 0.8));
        at(s(b.titleAt), 'pop', 0.9); at(s(b.titleAt) + 12, 'pop', 0.5);
        break;
      case 'caption':
        at(4, 'pop', 0.7);
        if (b.statement) at(s(b.statementAt ?? 1), 'pop', 0.8);
        if (b.strike?.length) at(strikeFrame(b, fps), 'scratch', 0.9);
        break;
      case 'punch':
        at(0, 'impact', 1); if (b.sub) at(12, 'pop', 0.6);
        break;
      case 'tension': {
        if (b.line) at(s(b.lineAt ?? 0.15), 'pop', 0.6);
        if (b.timer) {
          // Tick whenever the shown seconds change (at most every 2 frames), mirroring TimerPill.
          const {from, to = 0} = b.timer; const t0 = s(b.timer.at ?? 0); const end = dur - 4;
          let last = from; let lastTick = -99;
          for (let f = t0; f <= end; f++) {
            const k = interpolate(f, [t0, end], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
            const left = Math.max(0, Math.round(from + (to - from) * k));
            if (left !== last && f - lastTick >= 2) { at(f, 'tick', 0.5); lastTick = f; }
            last = left;
          }
        }
        if (b.punch) at(s(b.punchAt ?? 0.5), 'impact', 0.9);
        break;
      }
      case 'board':
        at(4, 'pop', 0.7); at(s(b.subAt ?? 0.7), 'pop', 0.5);
        if (b.mockup) at(s(b.mockupAt ?? 2.4) - 6, 'whoosh', 0.6);
        break;
      case 'broll':
        b.steps?.forEach((st) => at(s(st.at), 'pop', 0.8));
        b.chips?.items.forEach((_, j) => at(s(b.chips!.at) + j * 4, 'pop', 0.5));
        break;
      case 'cta': {
        const kAt = s(b.keywordAt ?? 1.9);
        at(2, 'pop', 0.7);
        at(kAt - 30, 'riser', 0.7); at(kAt, 'ding', 0.8);
        if (b.comment) {
          [...b.keyword].forEach((_, j) => at(kAt + 18 + j * 4, 'key', 0.9));
          at(kAt + 18 + b.keyword.length * 4 + 4, 'pop', 0.9);
        }
        break;
      }
    }
    start += dur;
  });
  return out;
};

const BeatView: React.FC<{b: Beat}> = ({b}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round(b.dur * fps);
  const s = (sec: number) => Math.round(sec * fps);

  switch (b.type) {
    case 'hero': {
      const t = s(b.titleAt);
      const cam = heroCamera(frame, b.tags, t, s, b.fit === 'cover');
      // Hook: frame 0 already moves (scale snap + flash) so the first frame stops the scroll.
      const snap = b.hook ? impactScale(frame, 0, 1.25) : 1;
      return (
        <AbsoluteFill style={{background: HERO_BG, overflow: 'hidden'}}>
          <AbsoluteFill style={{transform: `translateX(${cam.x}%) scale(${cam.scale * snap})`, transformOrigin: b.hook ? '50% 16%' : '50% 30%'}}>
            {b.fit === 'cover'
              ? <Img src={src(b.image)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
              : <Img src={src(b.image)} style={{position: 'absolute', bottom: '3%', left: '50%', transform: 'translateX(-50%)', height: '72%'}} />}
            {b.tags.map((g, i) => <YearTag key={i} label={g.label} x={g.x} y={g.y} at={s(g.at)} />)}
          </AbsoluteFill>
          {b.hook && (
            <div style={{position: 'absolute', top: `${b.titleTop ?? 9}%`, width: '100%'}}>
              <HookBanner badge={b.hook.badge} text={b.hook.text} outAt={t} />
            </div>
          )}
          <div style={{position: 'absolute', top: `${b.titleTop ?? 9}%`, width: '100%', color: C.white}}>
            <WordReveal text={b.title} delay={t} stagger={6} style={{fontSize: 140, fontWeight: 900, letterSpacing: '-0.035em'}} />
            <WordReveal text={b.subtitle} delay={t + 12} stagger={5} style={{fontSize: 60, fontWeight: 500, fontStyle: 'italic', marginTop: -6}} />
          </div>
        </AbsoluteFill>
      );
    }
    case 'caption':
      return (
        <AbsoluteFill>
          <Media src={b.media} dur={dur} />
          <div style={{position: 'absolute', top: '11%', left: '6%', right: '6%'}}>
            <HighlightCaption text={b.label} delay={4} />
            {b.statement && (
              <WordReveal text={b.statement} delay={s(b.statementAt ?? 1)} stagger={9} align="flex-start" dim={b.dim} slide={b.slide} strike={b.strike} strikeAt={strikeFrame(b, fps)} style={{marginTop: 18, color: C.white, fontSize: 92, fontWeight: 800, letterSpacing: '-0.03em', textShadow: shadow}} />
            )}
          </div>
          {b.flash !== false && <LightLeak dur={dur} />}
        </AbsoluteFill>
      );
    case 'punch': {
      const p = interpolate(frame, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
      // Heavy caps run about 0.7em per letter: shrink long words to keep about 50px side margins.
      const size = Math.min(170, Math.floor(960 / (b.word.length * 0.72)));
      const sh = impactShake(frame);
      return (
        <AbsoluteFill style={{overflow: 'hidden'}}>
          <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${impactScale(frame, 0, 1.12)})`}}>
            <Media src={b.media} dur={dur} />
          </AbsoluteFill>
          <ImpactFlash strength={0.7} />
          <div style={{position: 'absolute', top: '11%', width: '100%', textAlign: 'center'}}>
            <div style={{color: C.orange, fontSize: size, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})`, filter: `blur(${interpolate(frame, [0, 6], [12, 0], clamp)}px)`, opacity: interpolate(frame, [0, 4], [0, 1], clamp)}}>{b.word}</div>
            {b.sub && <WordReveal text={b.sub} delay={12} style={{marginTop: -18, color: C.white, fontSize: 56, fontWeight: 600, textShadow: '0 2px 6px rgba(0,0,0,.45), 0 4px 24px rgba(0,0,0,.45)'}} />}
          </div>
        </AbsoluteFill>
      );
    }
    case 'tension': {
      // The worried beat: optional line, exam timer, punch-in + shake, red heartbeat edge, slammed punch words.
      const bottom = b.textPos === 'bottom';
      const zoom = interpolate(frame, [0, dur], [1, b.zoomTo ?? 1.08], {...clamp, easing: Easing.in(Easing.quad)});
      const pAt = s(b.punchAt ?? 0.5);
      const media = (
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: b.origin ?? '50% 40%'}}>
          <Media src={b.media} dur={dur} zoomTo={1} startFrom={b.startFrom} />
        </AbsoluteFill>
      );
      const text = (
        <>
          {b.line && <WordReveal text={b.line} delay={s(b.lineAt ?? 0.15)} stagger={6} style={{color: C.white, fontSize: 76, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, textShadow: shadow, padding: '0 6%'}} />}
          {b.small && <WordReveal text={b.small} delay={pAt - 6} style={{color: C.white, fontSize: 58, fontWeight: 600, fontStyle: 'italic', textShadow: shadow}} />}
          {b.punch && <WordReveal text={b.punch} delay={pAt} stagger={7} style={{color: C.orange, fontSize: Math.min(160, Math.floor(960 / (Math.max(...b.punch.split(' ').map((w) => w.length)) * 0.72))), fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.95, flexDirection: 'column', alignItems: 'center', textShadow: '0 6px 30px rgba(0,0,0,.35)'}} />}
        </>
      );
      return (
        <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
          {b.shake ? <Shake dur={dur}>{media}</Shake> : media}
          {bottom && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.7) 100%)'}} />}
          {b.pulse && <RedPulse at={pAt - 4} />}
          {b.timer && (
            <div style={{position: 'absolute', top: bottom ? '4.5%' : '28%', width: '100%', display: 'flex', justifyContent: 'center'}}>
              <TimerPill from={b.timer.from} to={b.timer.to} at={s(b.timer.at ?? 0)} end={dur - 4} />
            </div>
          )}
          <div style={{position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, ...(bottom ? {top: '67%'} : {top: '9%'})}}>{text}</div>
        </AbsoluteFill>
      );
    }
    case 'broll': {
      const steps = b.steps ?? [];
      const cur = [...steps].reverse().find((st) => frame >= s(st.at));
      const idx = cur ? steps.indexOf(cur) : -1;
      return (
        <AbsoluteFill>
          <Media src={b.media} dur={dur} origin={b.origin} startFrom={b.startFrom} />
          {(cur || b.chips) && (
            <div style={{position: 'absolute', top: '7%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
              {cur && <StepPill key={idx} n={String(idx + 1)} text={cur.text} at={s(cur.at)} />}
              {b.chips && <GradeChips items={b.chips.items} at={s(b.chips.at)} />}
            </div>
          )}
        </AbsoluteFill>
      );
    }
    case 'board':
      return (
        <GridBoard>
          <div style={{position: 'absolute', top: '30%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <WordReveal text={b.headline} delay={4} stagger={9} style={{color: C.orange, fontSize: 88, fontWeight: 800, letterSpacing: '-0.03em'}} />
            <WordReveal text={b.sub} delay={s(b.subAt ?? 0.7)} stagger={8} style={{color: C.ink, fontSize: 50, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6}} />
            {b.mockup && <div style={{marginTop: 70}}><BrowserMockup image={b.mockup} at={s(b.mockupAt ?? 2.4)} /></div>}
          </div>
        </GridBoard>
      );
    case 'cta': {
      const kAt = s(b.keywordAt ?? 1.9);
      return (
        <GridBoard>
          <div style={{position: 'absolute', top: '30%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', color: C.ink}}>
            <WordReveal text={b.line1} delay={2} stagger={10} style={{fontSize: 100, fontWeight: 800, letterSpacing: '-0.035em', textTransform: 'uppercase'}} />
            <CharReveal text={b.line2} delay={s(b.line2At ?? 0.45)} style={{fontSize: 62, fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.02em'}} />
            <div style={{marginTop: 40, position: 'relative'}}><CtaKeyword text={b.keyword} at={kAt} /></div>
          </div>
          <div style={{position: 'absolute', top: '42%', left: 0, right: 0, height: 0}}><Sparks at={kAt - 12} /></div>
          {b.comment && (
            <div style={{position: 'absolute', top: '57%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <BounceArrow at={kAt + 8} />
              <CommentBox text={b.keyword} at={kAt + 18} />
            </div>
          )}
        </GridBoard>
      );
    }
  }
};

export const PromoReel: React.FC<PromoProps> = ({beats, voiceover, music, musicVolume = 0.25, progress = false, sfx = false, sfxVolume = 0.6}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      <Series>
        {beats.map((b, i) => (
          <Series.Sequence key={i} durationInFrames={Math.round(b.dur * fps)}>
            <BeatView b={b} />
          </Series.Sequence>
        ))}
      </Series>
      {progress && <ProgressBar />}
      {voiceover && <Audio src={src(voiceover)} />}
      {music && <Audio src={src(music)} volume={musicVolume} />}
      {sfx && sfxEvents(beats, fps).map((e, i) => (
        <Sequence key={i} from={Math.max(0, e.frame)} durationInFrames={45} layout="none">
          <Audio src={staticFile(`sfx/${e.file}.wav`)} volume={e.vol * sfxVolume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Defaults = the reference video, with beat lengths measured from its cuts. Replace the assets in public/. */
export const promoDefaults: PromoProps = {
  beats: [
    {type: 'hero', dur: 4.9, image: 'hero-cutout.png', titleAt: 3.1, title: 'BU VIDEO', subtitle: 'sizlar uchun',
      tags: [{label: '2009', x: 50, y: 33, at: 0.2}, {label: '2010', x: 30, y: 37, at: 1.2}, {label: '2011', x: 70, y: 40, at: 1.9}]},
    {type: 'caption', dur: 1.87, media: 'paper-exam.jpg', label: 'endi milliy sertifikat testlari', statement: 'Qog‘ozda emas', statementAt: 1.1, slide: [1]},
    {type: 'punch', dur: 1.7, media: 'computer-exam.jpg', word: 'KOMPUTER', sub: 'formatida olinadi'},
    {type: 'broll', dur: 1.8, media: 'wide.jpg'},
    {type: 'broll', dur: 1.7, media: 'closeup.jpg', origin: '50% 30%'},
    {type: 'broll', dur: 1.3, media: 'teacher.jpg'},
    {type: 'board', dur: 4.5, headline: 'Kelayotgan oylarda', sub: 'imtihonga kiradigan bo‘lsangiz', subAt: 0.7, mockup: 'site.png', mockupAt: 2.4},
    {type: 'broll', dur: 7.8, media: 'screen-demo.mp4'},
    {type: 'cta', dur: 4.2, line1: 'Sayt havolasini', line2: 'olmoqchi bo‘lsangiz', keyword: 'LINK', line2At: 0.45, keywordAt: 1.9},
  ],
};
