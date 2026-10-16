import React from 'react';
import {Composition} from 'remotion';
import {PromoReel, PromoProps, promoDefaults} from './PromoReel';
import {ChecklistReel, ChecklistProps, checklistDefaults, checklistTimeline} from './Checklist';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    {/* Style A: orange hero / kinetic text / grid board / "LINK" CTA. */}
    <Composition
      id="PromoReel"
      component={PromoReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={900}
      defaultProps={promoDefaults}
      calculateMetadata={({props}: {props: PromoProps}) => ({
        durationInFrames: props.beats.reduce((a, b) => a + Math.round(b.dur * FPS), 0),
      })}
    />
    {/* Style B: handwritten checklist on paper, one continuous shot. */}
    <Composition
      id="ChecklistReel"
      component={ChecklistReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={330}
      defaultProps={checklistDefaults}
      calculateMetadata={({props}: {props: ChecklistProps}) => ({durationInFrames: checklistTimeline(props).total})}
    />
  </>
);
