import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Series, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrowserMockup, C, CharReveal, CtaKeyword, FONT, GridBoard, HERO_BG, HighlightCaption, LightLeak, Media, Sparks, WordReveal, YearTag, clamp, src} from './kit';

export type Tag = {label: string; x: number; y: number; at: number};

export type Beat =
  | {type: 'hero'; dur: number; image: string; fit?: 'cutout' | 'cover'; tags: Tag[]; title: string; subtitle: string; titleAt: number}
  | {type: 'caption'; dur: number; media: string; label: string; statement?: string; statementAt?: number; dim?: number[]; slide?: number[]; flash?: boolean}
  | {type: 'punch'; dur: number; media: string; word: string; sub?: string}
  | {type: 'broll'; dur: number; media: string; origin?: string; startFrom?: number}
  | {type: 'board'; dur: number; headline: string; sub: string; subAt?: number; mockup?: string; mockupAt?: number}
  | {type: 'cta'; dur: number; line1: string; line2: string; keyword: string; line2At?: number; keywordAt?: number};

export type PromoProps = {beats: Beat[]; voiceover?: string; music?: string; musicVolume?: number};

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

const BeatView: React.FC<{b: Beat}> = ({b}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round(b.dur * fps);
  const s = (sec: number) => Math.round(sec * fps);

  switch (b.type) {
    case 'hero': {
      const t = s(b.titleAt);
      const cam = heroCamera(frame, b.tags, t, s, b.fit === 'cover');
      return (
        <AbsoluteFill style={{background: HERO_BG}}>
          <AbsoluteFill style={{transform: `translateX(${cam.x}%) scale(${cam.scale})`, transformOrigin: '50% 30%'}}>
            {b.fit === 'cover'
              ? <Img src={src(b.image)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
              : <Img src={src(b.image)} style={{position: 'absolute', bottom: '3%', left: '50%', transform: 'translateX(-50%)', height: '72%'}} />}
            {b.tags.map((g, i) => <YearTag key={i} label={g.label} x={g.x} y={g.y} at={s(g.at)} />)}
          </AbsoluteFill>
          <div style={{position: 'absolute', top: '9%', width: '100%', color: C.white}}>
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
              <WordReveal text={b.statement} delay={s(b.statementAt ?? 1)} stagger={9} align="flex-start" dim={b.dim} slide={b.slide} style={{marginTop: 18, color: C.white, fontSize: 92, fontWeight: 800, letterSpacing: '-0.03em', textShadow: shadow}} />
            )}
          </div>
          {b.flash !== false && <LightLeak dur={dur} />}
        </AbsoluteFill>
      );
    case 'punch': {
      const p = interpolate(frame, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
      // Heavy caps run about 0.7em per letter: shrink long words to keep about 50px side margins.
      const size = Math.min(170, Math.floor(980 / (b.word.length * 0.7)));
      return (
        <AbsoluteFill>
          <Media src={b.media} dur={dur} />
          <div style={{position: 'absolute', top: '11%', width: '100%', textAlign: 'center'}}>
            <div style={{color: C.orange, fontSize: size, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})`, filter: `blur(${interpolate(frame, [0, 6], [12, 0], clamp)}px)`, opacity: interpolate(frame, [0, 4], [0, 1], clamp)}}>{b.word}</div>
            {b.sub && <WordReveal text={b.sub} delay={12} style={{marginTop: -18, color: C.white, fontSize: 56, fontWeight: 600, textShadow: '0 2px 6px rgba(0,0,0,.45), 0 4px 24px rgba(0,0,0,.45)'}} />}
          </div>
        </AbsoluteFill>
      );
    }
    case 'broll':
      return <Media src={b.media} dur={dur} origin={b.origin} startFrom={b.startFrom} />;
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
        </GridBoard>
      );
    }
  }
};

export const PromoReel: React.FC<PromoProps> = ({beats, voiceover, music, musicVolume = 0.25}) => {
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
      {voiceover && <Audio src={src(voiceover)} />}
      {music && <Audio src={src(music)} volume={musicVolume} />}
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
