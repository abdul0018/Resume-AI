---
name: promo-reel
description: Make vertical (9:16) promo reels in Remotion. Style A (`PromoReel`) is a 30-second reel in the style of the "Izohda LINK deb yozib qoldiring" reference reel. Style B (`ChecklistReel`) is a 10-second "handwritten checklist" reel: a paper sheet with a serif title and a list of 3D pill icons, where a red pen writes each answer and then the brand. Use Style B for "best time to… / daily plan / list"-type reels. Style C (`HabitsReel`) edits the user's own talking-head video into an "N habits" reel: a glowing pill hook, a pin board of numbered cards the camera flies between, product clips, and a CTA pill that types the comment keyword. Use Style C when the user sends their own recording plus a reference edit to copy. Style D (`StoryReel`) is a narrated story drawn as white line-art stick figures on charcoal with orange accents. It draws on stroke by stroke in time with a TTS or recorded voiceover, and ends on a title card plus a speech bubble. Use Style D when the user gives a story script. Style E (`IllustratedReel`) tells a story with flat vector illustrations (teal palette, warm light) drawn in code. It adds parallax and a slow push-in, soft dissolves, a logo on top, and karaoke subtitles in a dark lower third. Use Style E when the reference is an illustrated narrated explainer. The style uses an orange hero shot with year-tag pills, kinetic word-by-word text, full-bleed photo beats with a "KOMPUTER"-style punch word, an off-white grid board with a browser mockup, a screen-recording demo, and a comment-bait "LINK" ending. Use when the user asks for "this type of video", "the LINK video", a promo or Instagram/TikTok reel, or a Remotion video for a product or site.
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
