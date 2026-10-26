import React from 'react';
import {Composition} from 'remotion';
import {PromoReel, PromoProps, promoDefaults} from './PromoReel';
import {ChecklistReel, ChecklistProps, checklistDefaults, checklistTimeline} from './Checklist';
import {HabitsReel, HabitsProps, habitsDefaults, habitsDuration} from './Habits';
import {StoryReel, StoryProps, storyDuration} from './Story';
import {IllustratedReel, IllustratedProps, illustratedDuration} from './Illustrated';
import {FurnitureReel, FurnitureProps, furnitureDuration} from './Furniture';
import {ResourcesReel, ResourcesProps, resourcesDuration} from './Resources';
import {ScoreTableReel, ScoreTableProps, scoreTableDuration} from './ScoreTable';
import {LadderReel, LadderProps, ladderDuration} from './Ladder';
import {TiersReel, TiersProps, tiersDuration} from './Tiers';

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
    {/* Style C: talking-head "N habits" edit: hook pill, pin board, product clips, search-pill CTA. */}
    <Composition
      id="HabitsReel"
      component={HabitsReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={810}
      defaultProps={habitsDefaults}
      calculateMetadata={({props}: {props: HabitsProps}) => ({durationInFrames: habitsDuration(props)})}
    />
    {/* Style D: hand-drawn line-art story on charcoal, timed to a narrated voiceover. */}
    <Composition
      id="StoryReel"
      component={StoryReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={1440}
      defaultProps={{scenes: [], end: 10} as StoryProps}
      calculateMetadata={({props}: {props: StoryProps}) => ({durationInFrames: storyDuration(props)})}
    />
    {/* Style E: illustrated story: flat vector scenes, parallax, karaoke subtitles. */}
    <Composition
      id="IllustratedReel"
      component={IllustratedReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={1440}
      defaultProps={{scenes: [], cues: [], end: 10} as IllustratedProps}
      calculateMetadata={({props}: {props: IllustratedProps}) => ({durationInFrames: illustratedDuration(props)})}
    />
    {/* Style F: product showcase edit over real footage (3D kinetic type, callouts, swatches, whips). */}
    <Composition
      id="FurnitureReel"
      component={FurnitureReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={690}
      defaultProps={{shots: [], titles: [], end: 10} as FurnitureProps}
      calculateMetadata={({props}: {props: FurnitureProps}) => ({durationInFrames: furnitureDuration(props, FPS)})}
    />
    {/* Style G: "resources by level" talking head: icons pop on the pointing side, section word per skill. */}
    <Composition
      id="ResourcesReel"
      component={ResourcesReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={403}
      defaultProps={{video: '', segs: [], title: '', levels: ['', ''], sections: [], cta: {at: 0, line1: '', line2: ''}, end: 10} as ResourcesProps}
      calculateMetadata={({props}: {props: ResourcesProps}) => ({durationInFrames: resourcesDuration(props, FPS)})}
    />
    {/* Style H: "8+ resource table" over a talking head: rows glow as named, resources pop in. */}
    <Composition
      id="ScoreTableReel"
      component={ScoreTableReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={240}
      defaultProps={{video: '', rows: [], end: 8} as ScoreTableProps}
      calculateMetadata={({props}: {props: ScoreTableProps}) => ({durationInFrames: scoreTableDuration(props, FPS)})}
    />
    {/* Style I: "level ladder" talking head: score card left hand, resource right hand, hero finale. */}
    <Composition
      id="LadderReel"
      component={LadderReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={400}
      defaultProps={{video: '', steps: [], captions: [], finale: {score: '8.0', scoreAt: 0, icon: 'goprep', iconAt: 1}, end: 10} as LadderProps}
      calculateMetadata={({props}: {props: LadderProps}) => ({durationInFrames: ladderDuration(props, FPS)})}
    />
    {/* Style J: YOMON / YAXSHI / AJOYIB tiers: blurred app cards snap sharp as each tier is named. */}
    <Composition
      id="TiersReel"
      component={TiersReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={530}
      defaultProps={{video: '', topics: [], end: 10} as TiersProps}
      calculateMetadata={({props}: {props: TiersProps}) => ({durationInFrames: tiersDuration(props, FPS)})}
    />
  </>
);
