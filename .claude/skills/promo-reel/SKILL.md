---
name: promo-reel
description: Make vertical (9:16) promo reels in Remotion. Style A (`PromoReel`) is a 30-second reel in the style of the "Izohda LINK deb yozib qoldiring" reference reel. Style B (`ChecklistReel`) is a 10-second "handwritten checklist" reel: a paper sheet with a serif title and a list of 3D pill icons, where a red pen writes each answer and then the brand. Use Style B for "best time to… / daily plan / list"-type reels. Style C (`HabitsReel`) edits the user's own talking-head video into an "N habits" reel: a glowing pill hook, a pin board of numbered cards the camera flies between, product clips, and a CTA pill that types the comment keyword. Use Style C when the user sends their own recording plus a reference edit to copy. Style D (`StoryReel`) is a narrated story drawn as white line-art stick figures on charcoal with orange accents. It draws on stroke by stroke in time with a TTS or recorded voiceover, and ends on a title card plus a speech bubble. Use Style D when the user gives a story script. Style E (`IllustratedReel`) tells a story with flat vector illustrations (teal palette, warm light) drawn in code. It adds parallax and a slow push-in, soft dissolves, a logo on top, and karaoke subtitles in a dark lower third. Use Style E when the reference is an illustrated narrated explainer. Style F (`FurnitureReel`) edits real product footage (furniture, interiors, retail) with 3D kinetic typography, whip and zoom-blur cuts on the beat, tracked callouts, colour swatches, a warm grade, an original music bed and a location-pin CTA. Style G (`ResourcesReel`) is a talking-head "resources by level" reel: the speaker points left or right and a resource icon pops on that side, with a section word per skill. The footage stays ungraded. Style H (`ScoreTableReel`) is an "8+ resource table" over a talking head: a row glows when the speaker names its skill, and the resource pops into the third column. Style I (`LadderReel`) is a "level ladder" talking head: the left hand brings up a score card, the right hand the resource for that level, and the reel ends on a hero resource reveal. Style J (`TiersReel`) is a YOMON / YAXSHI / AJOYIB tier reel: blurred app cards snap sharp as each tier is named. The style uses an orange hero shot with year-tag pills, kinetic word-by-word text, full-bleed photo beats with a "KOMPUTER"-style punch word, an off-white grid board with a browser mockup, a screen-recording demo, and a comment-bait "LINK" ending. Use when the user asks for "this type of video", "the LINK video", a promo or Instagram/TikTok reel, or a Remotion video for a product or site.
---

# Promo reel (orange hero / grid board / "LINK" CTA)

A ready Remotion project lives in `template/` next to this file. Copy it, swap the assets and text in `props.json`, then render. Don't rebuild the components from scratch.

## 1. The reference, measured

Source: `Izohda “LINK” deb yozib qoldiring. Sayt havolasini yuboramiz.mp4`. It is 720x1280 at 30 fps, 29.8 s long, with voiceover over light music. The beat times below come from scene-cut detection.

| # | Time (s) | Beat | What happens |
|---|---|---|---|
| 1 | 0.0-4.9 | **hero** | Orange gradient (deep `#D9400B` top-left to `#FF8A00` bottom). A transparent cut-out of 3 students sits in the lower 70%. The camera **pushes in** on the middle person while a white pill tag "2009" pops over their head (0.2 s). The camera **pans left** as "2010" pops (1.2 s), then **pans right** as "2011" pops (1.9 s), then **pulls back** to the wide shot. At 3.1 s, "**BU VIDEO**" (white, weight 900) builds word by word and the italic *"sizlar uchun"* appears under it. |
| 2 | 4.9-6.77 | **caption** | Photo: exam on paper in a classroom, with a slow zoom. An orange label box at the top left grows word by word: "endi milliy sertifikat testlari". Under it a big white "Qog‘ozda" appears, and "emas" **slides in from the lower right**. The beat ends with a **warm light-leak flash**, which is the only transition in the video. |
| 3 | 6.77-8.47 | **punch** | The same room, now with laptops. A huge orange "**KOMPUTER**" pops in (scale 1.4 to 1 with blur), and white "formatida olinadi" sits under it. |
| 4-6 | 8.47-13.27 | **b-roll** ×3 | No text. Hard cuts: a wide shot (1.8 s), a worried close-up (1.7 s), the teacher watching (1.3 s). Each shot zooms slowly. |
| 7 | 13.27-17.77 | **board** | Off-white `#F7F7F5` board with a faint 72 px grid. The orange headline "Kelayotgan oylarda" builds word by word, then the black sub "imtihonga kiradigan bo‘lsangiz" (0.7 s). A dark **browser mockup** of the site (colour cards: IELTS / SAT / Milliy sertifikat / Multi Level) springs in from a dot, tilted about 2° (2.4 s). |
| 8 | 17.77-25.57 | **demo** | Phone footage of a laptop using the real site. |
| 9 | 25.57-29.77 | **cta** | Grid board. "SAYT HAVOLASINI" (ink, 800, caps) appears word by word, then *"olmoqchi bo‘lsangiz"* letter by letter (0.45 s). A small orange spark burst follows, then **“LINK”** (huge, orange) goes from **thin and widely spaced to heavy and tight** (1.9 s). |

**Style rules**
- **Text never appears all at once.** Words drop in from about 0.45 em above with fade, blur 10 px to 0 and scale 0.88 to 1, staggered 5-10 frames apart. Italic sublines go letter by letter.
- **Palette:** orange `#FF6B12`, ink `#1B1B1B`, board `#F7F7F5`, and white on photos. Nothing else.
- **Font:** Inter Tight, a geometric grotesk. Headlines use 800/900 with tight tracking (-0.03 em). Sublines use italic 500. The template bundles the font, so renders need no network.
- **Layout:** text sits in the top third, centred. Only the caption beat is left-aligned.
- **Cuts:** hard cuts everywhere, except the one light-leak flash out of the caption beat. Every photo or clip gets a 1 to 1.08 zoom.
- **Voiceover** speaks the on-screen text. Each word should land as it is spoken.
- **Post caption pattern:** `Izohda “LINK” deb yozib qoldiring. Sayt havolasini yuboramiz.`

## 2. Workflow when the user asks for one

1. **Collect the inputs.** Ask only for what is missing:
   - the topic or product and the script lines (or write them from the topic);
   - the CTA keyword (default `LINK`);
   - the assets: a hero cut-out PNG with a transparent background, 2-6 photos or clips, a site screenshot for the mockup, an optional screen recording, an optional voiceover and music.

   Write Uzbek in Latin script with the proper apostrophes (o‘, g‘, bo‘lsangiz). Write the script in the user's language.
2. **Assets.** If the user wants to generate the scenes themselves, give them per-scene prompts from `asset-prompts.md`, fitted to their script: a photo prompt for photo scenes, and a start-frame plus motion prompt for video scenes. Then wait for their files. If there are no assets, either generate images with an available image tool (the hero needs a background-removed cut-out; Higgsfield `remove_background` works), or run `scripts/placeholders.sh` to get stand-ins and say so.
   **Reusing an existing reel's footage** (when the user owns it):
   - Find clean frames by tiling candidates with ffmpeg. Text is often baked in from the first frame of a shot, so check every one.
   - Erase small baked-in bits with `delogo`.
   - Cut shots out as clips with `-ss/-to`, scaled to 1080x1920. Stretch a clip that is too short with `setpts=1.5*PTS,minterpolate=fps=30:mi_mode=blend`.
   - Crop around baked-in text when the clean part is big enough.
   - For a full-frame hero still, set the hero `fit: "cover"`.
   - Extract the soundtrack with `-vn` and use it as `voiceover`. If you do, keep the reference beat timings.
3. **Plan the beats.** Show a timing table like the one above, fitted to their script, before building.
4. **Scaffold the project:**
   ```bash
   cp -r .claude/skills/promo-reel/template <workdir>/promo-reel && cd <workdir>/promo-reel
   npm i
   cp props.example.json props.json   # then edit text, durations, asset names
   # put assets in public/ (or run ./scripts/placeholders.sh for stand-ins)
   npx tsc --noEmit
   ```
5. **Check stills before the full render.** Render one frame inside each beat:
   `npx remotion still PromoReel out/f.png --frame=N --props=props.json --scale=0.5`.
   Then Read each PNG. Fix tag positions over the heads, text that overflows or wraps into 3 or more lines, and legibility on bright photos.
6. **Render:**
   `npx remotion render PromoReel out/promo.mp4 --props=props.json --codec=h264 --crf=18`.
   Verify the output with `ffprobe` and a contact sheet:
   `ffmpeg -i out/promo.mp4 -vf "fps=2,scale=180:-1,tile=10x6" -frames:v 1 sheet.png`.
   Look at the sheet. Send the mp4 with SendUserFile, together with the suggested post caption.
7. **Sandbox notes (cloud containers):**
   - Remotion's own Chrome download may be blocked. Pass `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`. If that path is missing, `ls /opt/pw-browsers` to find the current one.
   - Headless Chrome does not trust the sandbox proxy's certificate, so anything the page fetches over HTTPS fails (`ERR_CERT_AUTHORITY_INVALID`). Keep every asset local in `public/`. This is why the font comes from `@fontsource-variable/inter-tight` and not `@remotion/google-fonts`.
   - If npm is blocked, zip the project and send it with these instructions: `npm i && npx remotion studio`.

## 3. Template map

```
template/
  package.json          remotion + @remotion/cli pinned to the same version, bundled Inter Tight
  remotion.config.ts
  props.example.json    the reference reel as data, with the measured timings
  scripts/placeholders.sh   stand-in assets in public/ (never overwrites)
  src/index.ts, Root.tsx    composition "PromoReel", 1080x1920 at 30 fps; duration = sum of beats
  src/kit.tsx           style primitives: Media (Ken Burns), WordReveal, CharReveal,
                        HighlightCaption, YearTag, GridBoard, BrowserMockup, Sparks,
                        LightLeak, CtaKeyword
  src/PromoReel.tsx     Beat types, BeatView per beat type, heroCamera, promoDefaults
```

**Beat types** (in `props.json`, all times in seconds):

| type | fields |
|---|---|
| `hero` | `hook?{badge?,text}` (red DIQQAT-style badge + hook line visible from frame 0, plus a zoom snap; fades out when the title builds), `image`, `fit?` (`cutout` default: transparent PNG in the lower 72%; `cover`: a full-frame 9:16 image that already has its background), `tags[{label,x,y,at}]`, `title`, `subtitle`, `titleAt`, `titleTop?` (title block top in %, default 9; lower it when heads sit high so the tags don't hit the subtitle) |
| `caption` | `media`, `label`, `statement?`, `statementAt?`, `dim?[]` (word indexes shown at half opacity), `slide?[]` (word indexes that slide in from the lower right), `strike?[]` (word indexes struck through in red after the statement lands, with a scratch sound), `flash?` (default true) |
| `punch` | `media`, `word`, `sub?` |
| `tension` | the worried beat: `media`, `origin?`, `zoomTo?` (punch-in, eases in), `line?` + `lineAt?`, `small?` + `punch?` + `punchAt?` (big orange stacked words), `textPos?` (`top` / `bottom`: bottom adds a dark fade; use it when a face fills the top half), `timer?{from,to?,at?}` (exam clock in seconds, accelerating, red near zero; chain two beats e.g. 300→298, then 298→0), `shake?`, `pulse?` (red heartbeat edge) |
| `broll` | `media` (image or .mp4/.mov/.webm), `origin?`, `startFrom?` (frames), `steps?[{at,text}]` (numbered step pills, for demos), `chips?{at,items[]}` (grade/result chips popping in) |
| `board` | `headline`, `sub`, `subAt?`, `mockup?`, `mockupAt?` |
| `cta` | `line1`, `line2`, `keyword`, `line2At?`, `keywordAt?`, `comment?` (comment box that types the keyword and taps send, with a bouncing arrow) |

Top-level props: `beats`, `voiceover?`, `music?`, `musicVolume?` (default 0.25), `progress?` (orange progress bar on top), `sfx?` + `sfxVolume?` (default 0.6): sound effects placed automatically (whoosh into every cut, pops on text and tags, impacts on punch words, timer ticks, a riser + ding on the keyword, key clicks on the comment). Run `./scripts/sfx.sh` once to synthesize them into `public/sfx/`. Audio files go in `public/`.

## 4. Making it hooky / viral (default for new reels)

- **The first frame must carry text and motion.** It is the cover and the scroll-stopper. Use `hook` with a callout of the audience ("2009–2011-yilda tug‘ilganlar") and a red badge (DIQQAT). Never start on a flash or an empty frame.
- Turn on `sfx: true` and `progress: true`.
- **Give every 2–3 s a new visual event.** No beat may run longer than about 3 s without text or a cut. Caption long demos with numbered `steps` that match the voiceover, and end with result `chips`.
- **Turn the pain point into a `tension` beat** with a timer, a red pulse and punch words.
- **Make the CTA demonstrate the action:** use `comment: true`, so the box types the keyword.
- Check that the mixed audio has its max under -1 dB (`ffmpeg -af volumedetect`).

## 5. Adapting it

- **Beat order is flexible.** Keep the hero first, the CTA last, and at least one grid board in the middle. Keep the total at 20-40 s.
- **Tags.** `x` and `y` are the pointer tip in % of the frame, at the wide shot. The hero camera pans to each tag's `x` as it pops. Check them on a still at the end of the hero beat (all tags visible) and adjust.
- **Long words.** If a headline overflows 1080 px, lower that beat's `fontSize` in `PromoReel.tsx` instead of letting it wrap.
- **Voiceover timing.** Fit the beat durations to the VO. If the VO runs long, stretch the b-roll and demo beats, not the text beats.
- **Brand colour.** Change `C.orange` and `HERO_BG` in `kit.tsx` together.
- **Output.** Render 1080x1920 at 30 fps with CRF 18. That suits Instagram Reels and TikTok.

## 6. Style B: handwritten checklist (`ChecklistReel`)

Reference: the "Best Time to Take Vitamins" reel. It is a single continuous shot of about 10 s with no cuts:
- an off-white paper background with a large serif title (DM Serif Display);
- 4–5 rows, each a glossy 3D capsule icon plus a navy label;
- a red pen that writes each row's answer in handwriting (Caveat), revealed left to right under the pen tip.

**Hook:** frame 0 shows the full list with empty answers, which creates a curiosity gap. The pen glides in from the lower right.

`Checklist.tsx` builds it. Props:
- `title` ("\n" splits lines);
- `rows[{label, answer, icon, color}]`, where `icon` is mic / pen / book / headphones / check / star;
- `footer?{lead?, brand}`: written after the rows, with the brand big and underlined, plus a ding;
- `sfx?` (pen scribble per word);
- `music?` + `musicVolume?`.

The duration is computed from the text lengths: about 3 frames per character.

Rules:
- Keep answers short (≤ 14 characters) so they fit the answer column.
- The footer must stay above the bottom ~20% of the frame.
- Render with `npx remotion render ChecklistReel out/x.mp4 --props=props.json`.
- Tell the user to add trending music in the Instagram/TikTok app. Don't reuse a third party's audio.

Example: `examples/goprep-ielts-checklist.props.json`.

## 7. Style C: talking-head "N habits" edit (`HabitsReel`)

Reference: "IELTS 8 uchun sizda bo'lishi kerak bo'lgan 5 ta odat". The user's own single-take talking-head video stays underneath the whole edit as one continuous voice track.

| Part | Starts | What it shows |
|---|---|---|
| 1. Hook | 0 s | Talking head with a white pill that glows blue ("IELTS 8+"), a small corner badge ("uchun"), an italic subline typed word by word, and a bold last line ("5 TA ODAT") with a punch-in zoom. |
| 2. Board | `boardAt` | Pushes in from the right: a grey pin board of numbered pastel cards (pin, number, title, short description). The camera flies to each card at its `at` time, when the habit is spoken. |
| 3. Product | `appAt` | Pushes to the product `clips[{src, from, to}]`, cut on the voiceover's beats, each with a punch-in. |
| 4. CTA | `ctaAt` | Pushes back to the face: a glowing title ("IELTS UCHUN") and blue icon tiles popping in. Then a search pill types the comment keyword at `typeAt` (when it is spoken) and taps the arrow. |

Workflow:
1. **Timings come from the speech.** Run `python3 -I .claude/skills/promo-reel/tools/transcribe.py <voice.wav> small` (needs `pip install faster-whisper`). It prints segments and writes word timestamps to `<wav>.json`. Uzbek comes out phonetically garbled, but the timestamps are good. Ask the user for the exact script and map its phrases onto the timestamps.
2. **Normalize the voice:**
   `ffmpeg -i head.mp4 -vn -af "highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=7" voice.wav`
   Put the muted video in as `head`. Phone recordings often clip.
3. Put the hook and CTA text in the top ~20%, above the face. Put the search pill at ~64%.
4. Example: `examples/goprep-5-odat.props.json`.

## 8. Style D: hand-drawn story (`StoryReel`)

Reference: the "Kelin va qaynona…" reel.
- **Look:** a charcoal background (#4B4A4F) with white line-art stick figures and objects on a ground line, and a few orange accents (glow, hearts, flag, key words).
- **Motion:** each element draws on stroke by stroke. Each scene erases before the next one starts.
- **Ending:** a title card and a speech bubble.

**Voiceover:**
- Use the user's own recording if they have one (then get word timings with `tools/transcribe.py`).
- Otherwise use TTS: `python3 -I .claude/skills/promo-reel/tools/tts.py uz-UZ-SardorNeural script.txt vo.mp3 +10%` (`pip install edge-tts`; the female voice is uz-UZ-MadinaNeural). It writes per-word timings to `vo.mp3.words.json`. It already trusts the sandbox proxy CA.
- Respell for TTS: IELTS → "ayelts", goprep.gg → "goprep nuqta ji ji", 7.5 → "yetti yarim", 4 → "to‘rt".
- Normalize the result with loudnorm.

**Scenes (props JSON):**
- `scenes[{start, end, els[]}]`. Each element is `{b: builder, at: sec, dur?, …params}`.
- Start a scene ~0.1 s before its clause. Set each element's `at` to the word it illustrates.
- Builders in `Story.tsx` → `BUILDERS`:
  - **People and places:** person (pose down/up/point/sad/type, cap, woman), university, door, board, desk, table.
  - **Objects:** certificate, chart, laptop (screen text), bulb, cards, roadmap, tag, jar, calendar, scroll.
  - **Marks and text:** ground, glow, cross, arrow, burst, hearts, text, bubble.
- Add a builder when a story needs a new object.

**Without a voiceover:**
- Omit `voice` from the props. The composition's defaults carry no voice, so nothing leaks in.
- Keep the scene timings from the script so the user can record over them later.
- Then lift the SFX-only mix: `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-20:TP=-1.5 out.mp4`.

**Camera and sound (automatic):**
- **Camera:** each scene is framed like the reference. The drawing fills ≈90% of the width (figures about a third of the frame height), the ground sits at ≈67% of the height, and there is a slow 3% push-in. The ground line is re-fitted to span just the drawing.
- **Strokes:** they keep a constant on-screen width. Never use `vector-effect: non-scaling-stroke`, because it breaks pathLength draw-on in Chrome.
- **Sound (`sfx: true`):**
  - pencil scribble while each element draws;
  - a swish on every scene change;
  - a chime on orange accents (glow / hearts / burst / bulb / tag / flag / bubble / big orange text);
  - a scratch on crosses;
  - a soft impact under big orange numbers.
  - Override per element with `sfx: 'chime' | 'pop' | 'impact' | 'scratch' | 'none'`.
- Run `./scripts/sfx.sh` once (it makes chime.wav too).

**Rules:**
- Draw in the 1080×1920 drawing space with the ground at 1120. The camera rescales each scene.
- Hold the end card ≥ 2 s after its last word.
- Check one still per scene before rendering.
- Tell the user to add soft music in the app.

Example: `examples/anvar-goprep-story.props.json` (+ `.tts.txt`).

## 9. Style E: illustrated story (`IllustratedReel`)

Reference: the bashar.uz "ilm" reel.
- **Look:** flat vector scenes in a teal palette (#0B2324 → #3E8C84) with warm lamp light (#F2C27B) and faceless characters.
- **Motion:** each scene has parallax layers and a slow 6% push-in. Scenes change with soft dissolves (with a little blur).
- **Frame:** the reference has a small logo top-centre and its brand at the bottom. These are off by default (`logo: true` / `brand` turn them on). The user prefers the brand only inside the story and on the end card.
- **Subtitles:** in the dark lower third, at y≈1390, two lines, 58 px, weight 800. Words light up karaoke-style: unspoken words are dim, spoken words are white, `keys` words are gold. Only one cue shows at a time.

**Scenes are code** (`SCENES` in `Illustrated.tsx`), built from primitives:
- `Layer` (parallax), `Stars`, `City` (lit windows), `Books`, `ArchWindow`, `LampGlow`;
- `Person` (stand / sit / desk / cheer / sad, cap, hijab, beard, older), `Desk`, `Laptop`, `Phone`, `useCount` (animated numbers).

Product reveals should be sudden: `find` flicks a feed with motion blur, accelerating, then stops dead on the product post (`FIND_STOP`) with a punch-in, white flash and impact. Don't type a URL slowly.

The existing scenes are: graduate, repetitor, class, certificate, study, mock, find, roadmap, savings, score, university, family, end. Write a new scene component when a story needs one.

**Props:**
- `scenes[{id, start, end}]`
- `cues[{text, start, end, keys[]}]`
- `end`, `brand?`, `logo?`
- `voice?` (omit: the user records later)
- `sfx?`: whoosh between scenes, chime / ding on reveals, ticks on counters, keys on typing, impact on the big score.

**Timings without a voice:** run `tools/tts.py` only to get natural word timings (`vo.mp3.words.json`). Build the cues from them and do not include the audio.

**Image generation costs the user credits** (Higgsfield ≈0.25 credit per image). Ask before generating; code-drawn scenes are the free default.

Example: `examples/anvar-goprep-illustrated.props.json`.

## 10. Style F: product showcase edit over real footage (`FurnitureReel`)

Motion language comes from the "5 ta viral Reels" reference (3D kinetic type, whips, flashes). It is re-dressed per product; for furniture that means champagne gold, cream and ink, Oswald plus a DM Serif Display accent, and floating gold dust.

**Timeline:** one global clock = the talking-head take's own time. Its audio is the continuous `voice`. B-roll `shots` cut in over the voice (J/L-cuts).

**Shots** (`shots[]`):
- `{src, from, to, srcStart?, rate?, follow?, still?, zoom?, origin?, trans}`.
- `follow: true` keeps the head clip in sync.
- `trans` is `zoom`, `whipL`, `whipR` or `cut`. Whips overscale so the frame edge never shows.
- Every shot drifts in scale and rotation. `punches[]` adds beat punch-ins.
- Freeze the final frame with `still` for the CTA tail (export the last frame as a jpg).

**Overlays:**
- `titles[]` with kinds `fly3d` (letters fly through Z with trails on a drifting 3D plane), `slab` (extruded word slams from huge, tracking collapses, shake), `serif` (gold accent), `small` (tracked caps + gold rule).
- `callouts[]`: a ring and leader line tracked by `[sec, x%, y%]` keyframes to a product part, plus a frosted label.
- `swatches[]`: colour dots, a word per beat, then a stamp.
- `cta`: blur and dim, a bouncing pin, a slab and a serif sub.

**Workflow:**
- Transcribe for word timings (Uzbek text comes out garbled). Ask for the exact script if you need word captions, or use keyword titles only.
- Put cuts on the music grid (120 bpm: multiples of 0.5 s) near phrase starts.
- Place callouts from a gridded frame strip.
- Check stills, then dense frame strips around every cut.

**Music:** `python3 -I tools/music.py music.wav <sec> 120 house` makes an original deep-house bed. Its drop lands at bar 1 (2 s).
- Mix with `musicVol` ≈ 0.16 under the voice, `musicVolOpen` / tail louder.
- Process the voice: highpass, acompressor, loudnorm −14.

**Export:**
- `--pixel-format=yuv420p`, then re-encode `scale=in_range=pc:out_range=tv,format=yuv420p` (Remotion's jpeg frames otherwise give yuvj420p).
- `loudnorm=I=-14:TP=-1.5` on the final mix.

**Product hero ending** (bass drop):
- Generate music with a hero section: `tools/music.py music.wav <sec> 120 house <hero_at_music_time>`. It adds a riser, a half-beat of silence, a sub boom, then 808 bass with glides, a half-time snare and hat rolls.
- `hero_at` must be a bar start. Use `musicOffset` to slide the music so a bar lands where the voice ends. Example: offset 1 s means bars land at odd seconds, so hero 22 s in the file plays at 21 s.
- `hero{at, until, vol}` adds a drop flash, cinematic letterbox bars, kick-synced 2.8% bumps and a vignette pulse, and raises the music to `vol`.
- Cut to the cleanest product shots. Speed-ramp the first one: a 0.5× shot, then a `cut` shot continuing at 1× from the matching `srcStart`.
- Keep type minimal (one `small`, one `serif`). Close on a frozen frame with the `cta`.

Example: `examples/mebel-showroom.props.json`.

## 11. Style G: "resources by level" talking head (`ResourcesReel`)

Reference: the "IELTSga tayyorgarlik — Band 5.5–6.5 / Band 7.0–9.0" reel.
- A white title and a red section word (white outline) that re-animates per section.
- Level pills on the left and right.
- When the speaker raises the left hand, the lower-level resource icon pops on the left. When they raise the right hand, the higher-level one pops on the right. Both clear just before the next cut.
- CTA: "Hammasini olish uchun izohda + qoldiring", with a pulsing + badge and a bouncing arrow.

**Don't touch the footage.** Users notice quality loss. No grade, brightness or contrast change; only the soft top gradient behind the type.
- Render with `--image-format=png --crf=12 --x264-preset=slow --pixel-format=yuv420p`.
- Then tag the stream with `-c copy -bsf:v h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1`.
- Verify the match with a PSNR / mean-RGB check against the source in an overlay-free area (≥40 dB and about 1 level).

**Building it:**
- Find the hand raises from a 4 fps strip of the hands.
- `segs[{srcFrom, srcTo, scale?}]` reorder or trim the single take into sections that match the music's accents.
- A section can reuse a gesture pair. Give the repeat a small punch-in (`scale` 1.06) so it reads as a new angle.
- Put icons at finger-up: `sections[{start, word, left{icons[], label, at}, right{…}}]`.
- Icons are original vector tiles in `ICONS` (cambridge19, engnovate, iot, dmono, chatgpt, goprep, speakpractice). Add new ones there rather than pasting third-party logo images.
- Music: when the user asks for the reference's own music, extract its audio track (`-vn`) and keep it at its level.

Example: `examples/ielts-resources.props.json`.

**v2 options:**
- `levelsUnder: true` puts the band label under each icon group (as in the reference), instead of pills at the top.
- `icons` accept image tiles, `{img, bg?, pad?, text?, textColor?, mask?, color?, contain?}`, so real logos can be used. Sources:
  - Simple Icons masks (OpenAI);
  - site SVG logos (ieltsonlinetests.com `/themes/iot/images/logo.svg`);
  - Google's favicon service (`google.com/s2/favicons?domain=…&sz=256`), for sites that block bots (Engnovate);
  - the user's own reference frames, for book covers and app tiles that have no public file (Cambridge 19, IELTS Speaking Practice 2026, the "D" tile).
- `join: '+'` shows two icons with a small + badge between them.
- `overlayOnly` and `cues` work as in `TiersReel`: composite with ffmpeg for colour-exact HEVC output (PSNR ≈50 dB).
- Silent takes: when both videos have no audio, deliver silent. This user prefers no music and no sound effects on silent takes, so composite with `-an`. Ask before adding SFX.

Example: `examples/ielts-resources-v2.props.json`.

**Sticker text skin** (`skin: 'sticker'`), from the "Studying for IELTS — Band 7.5–9 / Band 5–6" reel:
- Rounded heavy Fredoka text with a thick dark-brown outline and a hard drop.
- Yellow title.
- Band labels pinned above each side, coloured by `levelColors` (red for the lower band, green for the higher).
- The skill name in white under each icon. Section words are shown capitalized.
- CTA: an orange outlined headline at the top, plus a white comment line at chest height that types in word by word, ending with an optional emoji image (`ctaLine2Emoji`, Twemoji SVG).

Example: `examples/ielts-resources-sticker.props.json`.

## 12. Style H: "8+ resource table" (`ScoreTableReel`)

Reference: the Speaking / Listening / Reading / Writing "8+" table reel.
- Frosted mint rows with three cells: skill icon and name, an 8+ pill, and the resource.
- The rows build in on frame 0. That is the hook.
- When the speaker names a skill, its row lifts and gets a green glow, its icon wobbles and its pill turns solid green.
- When they name the resource, it springs into the third cell with a small sparkle burst.
- The footage is untouched. The only addition is the cards' drop shadow.

**Props:** `rows[{skill, label, badge?, at, resource{at, tile? | text, sub?, caption?}}]` and `top`.
- `skill` is one of listening / vocabulary / reading / speaking / writing.
- `tile` is youtube or preppy. All icons are original SVG in `SKILL_ICONS` / `RESOURCE_TILES`.
- Take the times from the transcript: `at` = when the skill word starts, resource `at` = when the resource word starts.

**"Same music as the reference" when the reference also has a voice:** separate the stems with `tools/separate_music.py <ref44.wav> <outprefix>`.
- Setup: `pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu && pip install demucs`, run with `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`.
- The script runs htdemucs and writes the drums+bass+other stem as `_music.wav`.
- Verify the stem is voice-free (transcribe it: no words).
- Mix with the user's voice normalized to −15 LUFS and the music to −23 LUFS, then loudnorm −14 for the final mix.

**Phone clips with rotation metadata:** Remotion's `OffthreadVideo` applies the rotation, so don't pre-rotate.

**Quality check:** compare frame-aligned frames decoded from the start of both files, not `-ss` seeks (seeking lands on different frames). Expect ≥38 dB.

Example: `examples/ielts-8plus-table.props.json`.

## 13. Style I: "level ladder" (`LadderReel`)

Reference: the "Agar bu kerak bo'lsa → bundan foydalaning" reel.
- Left hand up: an IELTS score card pops top-left (red band, big score, 5-segment level bar).
- Right hand up: that level's resource icon pops top-right.
- Word-by-word white captions at chest height (y≈1290).
- Finale: "Agar IELTSdan 8 olmoqchi bo'lsangiz" with an 8.0 card in the centre, then the hero resource icon in the centre with two caption lines (`below`) and a bass hit.

**Props:**
- `steps[{score, scoreAt, icon, iconAt, out}]`
- `captions[{text, start, end, y?, below?}]`
- `finale{score, scoreAt, icon, iconAt, hit?}`
- `icon` is a `LADDER_ICONS` key (original drawings: owl, liz, engnovate, goprep) **or a real logo tile** `{img, bg?, pad?, topText?, topColor?, radius?}`. Prefer real logos, because real icons build trust. Use the official Duolingo Play Store icon (`=w512`), the ieltsliz.com icon on white with `topText: "IELTS"`, Engnovate's favicon rebuilt to 512 px and GoPrep's `favicon.svg`.
- `clean: true`: no card shadow, no icon drop shadow, and captions get a crisp 6 px dark `WebkitTextStroke` instead of `textShadow`. `overlayOnly: true` renders the graphics on transparent for the ffmpeg 4:2:0 composite (see §15). Use both whenever the user cares about quality.
- With a continuous single take, keep the reference's level order if the gestures already match it (5 → 7 → 6 → 8 here), so the left and right finger points line up. Time `scoreAt` to the left-finger frame and `iconAt` to the right-finger frame, from a 10 fps strip.
- Keep the voice by stream-copying the source audio (`-map 0:a -c:a copy`), so there is no re-encode and no processing.

**Editing rules learned here:**
- Before trimming pauses in a locked single take, measure the pose jump: compare the best-matching frame pair against the take's own adjacent-frame difference. If it's larger than the natural motion maximum, keep the take continuous. Jump cuts that save 0.2 s aren't worth it.
- Order ladder levels ascending (5 → 6 → 7 → target) when you can cut freely, and keep each level's resource pairing. In a continuous take, follow the gesture order instead (see above).
- "Same background music": separate the reference's stems first. If the music stem is near-silent (median ≈ −50 dB), the reference has no music. Reuse only its sound effects (here a bass hit at the hero reveal, cut from the stem) and tell the user.
- Voice cleanup for phone takes: `highpass=f=90,afftdn=nf=-30,acompressor,loudnorm`.

Examples: `examples/ielts-ladder.props.json` (original icons, music + SFX) and `examples/ielts-ladder-real-icons.props.json` (real logos, `clean`, silent, the same continuous take).

**Copying a viral reference's sound design** (proven on the ladder reel):
1. Run `tools/separate_music.py` on the reference. The `_music` stem is SFX + bed without the voice.
2. Map onsets to the on-screen events. Score cards had a sharp double click (−16 dB). Resource icons had a bright bell ding with a low tone (−10 dB, louder). Under everything was a 43–54 Hz sub pulse about every 0.8 s, plus ~300 Hz slides.
3. **Prefer rebuilding over lifting.** Lifted one-shots still carry the reference's music underneath, and users hear it. Measure the partials up to 22 kHz (the main ding tone here was at 12.9 kHz, above a 12 kHz cap) and synthesize clean versions: `python3 -I tools/ui_sfx.py public/` writes click.wav (two ticks 78 ms apart), ding.wav (2344 Hz + 2372 Hz beat + 12.9 kHz + an 8.2 kHz detuned cluster + a 173 Hz tone, holding 0.12 s, then τ 0.17 s) and ding_big.wav. Compare spectrograms against the reference and resample to the same sample rate, because `showspectrumpic` has a linear frequency axis. Only if the user insists, lift one-shots from the cleanest instances: `-ss <onset-0.02> -t 0.6–0.8 -af highpass=f=350,afade…`. Don't reuse the reference's music bed unless asked. Users usually want only the effects.
4. Place them with `cues[{file, at, vol}]` on your own event times (≈20–30 ms before the visual pop). Set `music` to the bed.
5. Match the reference's voice-to-SFX ratio. Measure LUFS of its vocal and music stems, set `voiceVolume` so your voice sits at the same offset, keep SFX at 1.0 (they're near full scale), and loudnorm the final mix.

## 14. Style J: YOMON / YAXSHI / AJOYIB tiers (`TiersReel`)

Reference: the "Fikrlash / Qidirish / Kod yozish…" app-tier reel.
- Three white app cards sit under the tier labels; the centre one is raised.
- They start heavily blurred. When the speaker says each tier word (rasvo / yaxshi / zo'r), that card snaps sharp with a punch and a ring burst, and its label lights up (red, yellow or green, with a crisp dark outline, not a glow).
- A white topic pill with an emoji sits at chest height.

**Props:** `topics[{title, emoji, start, reveal[3], logos[3]}]`.
- **Reveal timing:** time `reveal` to the gesture, not the word. Speakers say the tier word first and finish pointing 0.3–0.6 s later. Make a 10 fps strip of the hands with decisecond labels and pick the first frame where the finger is fully extended toward that card. Users notice early reveals.
- Each logo is `{name, kind: 'mask', file: svg, color | gradient}` for monochrome brand marks, or `{kind: 'img', file, radius, scale}` for full-colour icons.

**Real brand icons:**
- **Simple Icons** (`npm pack simple-icons@15.12.0`): monochrome SVGs with official hex colours, covering Google Translate, Anki, Instagram, YouTube, OpenAI, Gemini, Perplexity and Claude. Tint them with CSS masks; use gradients for Instagram and Gemini.
- **Apps not in Simple Icons** (e.g. HelloTalk): fetch the Play Store page `play.google.com/store/apps/details?id=<pkg>` and download its `og:image` at `=w512`.
- **The user's own brand:** take the site's `favicon.svg`. For sub-products, crop their artwork from the site's OG images and screenshots and key out the background.
- **Emoji:** Twemoji SVGs (`npm pack @twemoji/svg@15.0.0`).

**Colour-exact output for HEVC phone footage:** Remotion's decode shifted the RGB means by about 3 levels. Instead:
1. Render the graphics only (`overlayOnly: true`) as `--codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png --muted`.
2. Render the audio separately (`--codec=wav`).
3. Composite in ffmpeg: `[1:v]format=yuva444p,scale=out_color_matrix=bt709:out_range=tv[ov];[0:v][ov]overlay=format=yuv444,format=yuv420p`, with x264 CRF 12 and BT.709 tags. The source pixels pass through untouched; verify the mean RGB is within about 0.5.

Example: `examples/ai-tools-tiers.props.json`.

## 15. Footage quality rules (this user notices any loss; apply to every edit over their video)

- **No grading and no darkening layers** over the footage. That includes "a bit of shadow" gradients: the top gradient in ResourcesReel darkened the top of the frame by about 40%. Use `clean: true`: there are no gradients and no blurred text or icon shadows; legibility comes from crisp outlines (WebkitTextStroke) and hard offset drops only.
- **Composite in the source's native 4:2:0:** `[1:v]scale=out_color_matrix=bt709:out_range=tv,format=yuva420p[ov];[0:v][ov]overlay=format=yuv420`. A yuv444 overlay followed by format=yuv420 resamples the source chroma and softens it.
- **Default export = the user's CapCut settings:** 1080p, 30 fps, 12 Mbps, AI ultra HD off, optical flow off.
  - Use two-pass x264 `-preset slow -tune film -profile:v high -b:v 12M -maxrate 18M -bufsize 24M`, `fps=30`, BT.709 limited-range tags, `-an` if silent. Expect about 27 MB for 18 s.
  - Offer a CRF 8 "master" (~50 Mbps) only if the user asks for maximum quality.
- **Verify** against the source in an overlay-free area. Expect luma PSNR ≈ 46 dB at 12 Mbps (≈ 52 dB for a CRF 8 master) and chroma ≥ 54 dB. Also check that the brightness in the top area matches the source.
