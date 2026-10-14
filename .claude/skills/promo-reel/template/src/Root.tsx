import React from 'react';
import {Composition} from 'remotion';
import {PromoReel, PromoProps, promoDefaults} from './PromoReel';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
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
);
