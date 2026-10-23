---
name: Oltin muhr
description: The phone screen is the envelope itself; breaking the wax seal lets the evening light and the couple's photograph through.
colors:
  gold-deep: "#8f6a2a"
  gold: "#b08636"
  gold-pale: "#efd9a0"
  script-gold: "#9a6e2e"
  line-gold: "#b8924a"
  bronze: "#8a6128"
  amber: "#f6c76a"
  ink: "#4a331b"
  ink-soft: "#77604a"
  hero-ink: "#4f2f12"
  name-ink: "#6a4818"
  ground: "#f5ecdf"
  paper: "#f7efe2"
  paper-shade: "#efe4d1"
  lining: "#ead9ba"
  surround: "#e9ddc9"
  field: "#fffcf5"
  gilt-line: "rgba(176, 134, 54, 0.38)"
  error-brick: "#9b3b22"
  showcase-ground: "#efe5d4"
typography:
  display:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "min(15.7vw, 74px)"
    fontWeight: 400
    lineHeight: 0.95
  script-title:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "clamp(44px, 12.5vw, 56px)"
    fontWeight: 400
    lineHeight: 1.05
  script-closing:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "clamp(46px, 13vw, 60px)"
    fontWeight: 400
    lineHeight: 1.05
  script-name:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "clamp(38px, 21cqi, 58px)"
    fontWeight: 400
    lineHeight: 1
  script-welcome:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "clamp(34px, 10vw, 46px)"
    fontWeight: 400
    lineHeight: 1.05
  script-time:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 1
  script-joiner:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "clamp(24px, 12cqi, 32px)"
    fontWeight: 400
  script-cue:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "24px"
    fontWeight: 400
  arabic:
    fontFamily: "Amiri, Noto Naskh Arabic, serif"
    fontSize: "clamp(17px, 9cqi, 24px)"
    fontWeight: 400
    lineHeight: 1.5
  showcase-title:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "clamp(34px, 8.5vw, 52px)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.005em"
  numeral:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "tnum, lnum"
  scratch-value:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "clamp(20px, 6.4vw, 28px)"
    fontWeight: 500
  body:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.62
  lead:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.35
  body-small:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.62
  italic-line:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
  small:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
  meta:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "12.5px"
    fontWeight: 400
    letterSpacing: "0.12em"
  label:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.24em"
rounded:
  card: "3px"
  field: "14px"
  phone: "34px"
  pill: "999px"
spacing:
  gap: "10px"
  scratch-gap: "12px"
  section-y: "72px"
  section-x: "24px"
  section-stack: "24px"
  rule: "26px"
  measure: "360px"
  column: "480px"
components:
  button-primary:
    backgroundColor: "{colors.gold-pale}"
    textColor: "{colors.ink}"
    typography: "{typography.italic-line}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "50px"
  button-ghost:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "50px"
  input-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "14px 16px"
    height: "52px"
  choice:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "52px"
  choice-selected:
    backgroundColor: "{colors.gold-pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "52px"
  scratch-card:
    backgroundColor: "{colors.field}"
    textColor: "{colors.bronze}"
    typography: "{typography.scratch-value}"
    rounded: "{rounded.field}"
  countdown-tile:
    backgroundColor: "{colors.gold-pale}"
    textColor: "{colors.ink}"
    typography: "{typography.numeral}"
    rounded: "{rounded.field}"
    padding: "14px 4px 11px"
  music-coin:
    backgroundColor: "{colors.gold-pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "48px"
---

# Design System: Oltin muhr

Scope: this file records the first of seven invitation worlds in the examples-only showcase, as shipped in revision 2 (owner request: "exactly the same as the video"). Everything under Colors through Components belongs to Oltin muhr alone; a later template brings its own world and must not inherit these tokens, rasters, the seal or the arch card. The parts marked **Showcase shell** are the shared hosting conventions every template plugs into. The legacy app under `src/pages` and `src/components/invitation` is outside this system.

## Overview

**Creative North Star: "The Sealed Letter at Sunset"**

The phone screen is the envelope, edge to edge: an owner-supplied photograph of ivory paper blind-embossed with roses and climbing vines, folded into four flaps that meet a cream wax seal at 48% height. The couple's initials sit pressed into the seal's empty centre in gold. Sealed, the letter is alive in the guest's hands: it breathes with a slow tilt, a glint travels over the embossing and rings pulse from the seal. Breaking the seal is the one orchestrated moment of the page, and light comes before movement: the seal gives under the thumb and a ring of light leaves it, gold dust bursts, warm light spills through the paper as the camera eases in, the flaps part only partway so amber light and soft shafts show in the wedge-shaped gaps, the seal clears the sky, the names are written in by hand where they will sit in the hero, and the paper dissolves into a sunset photograph of the couple walking toward a mosque, where petals keep falling and light keeps rising.

After the opening the page is ceremonial, and each section arrives once as it scrolls in: one centred phone-width column on cream (#f5ecdf), sepia ink, gold script titles, rose sprays multiplied onto the ground so their white backgrounds vanish, and a gilded arch card that names both families under the Bismillah. The world is built from the owner's own rasters (photograph, paper, seal, roses, rings, arch card), each carrying its generation prompt and post-processing in embedded metadata; code draws only what the rasters do not cover yet (gold timeline line art, dividers, the venue map, icons).

**Key Characteristics:**
- Full-bleed embossed envelope as the first viewport; the seal is the only control and "Muhrni bosing" the only printed line.
- An owner-supplied raster world, each image carrying embedded provenance; nothing generic or stock.
- Gold is a material (foil, gilt edge, coin, pressed leaf), rendered as gradients from deep antique to pale champagne, never as a flat accent fill and never on text.
- Sepia ink throughout; no black anywhere a guest can see.
- Three faces with fixed jobs: Corinthia script for names, greetings and section titles; Bodoni Moda for everything set; Amiri for the Arabic Bismillah alone.
- Slow exponential ease-out; a sealed letter that breathes in the hand, one choreographed opening, sections that arrive once as the guest scrolls them in, one tactile interaction (scratching the gold-foil date), otherwise only ambient motion (petals, rising light, drifting photograph, swaying roses). Reduced motion shows everything at rest.

## Colors

A warm, single-temperature palette: cream papers, sepia inks and a gold ramp, with amber reserved for light.

### Primary
- **Antique Gold Leaf** (gold-deep, #8f6a2a): focus outlines and caret, the scratch-card focus ring, the dark end of gilt gradients.
- **Gilt** (gold, #b08636): selected-choice border, field focus border, map arch outlines, showcase focus underline.
- **Champagne Gold** (gold-pale, #efd9a0): the light face of gold surfaces (buttons, tiles, coin, selected choice) and the selection highlight. Button gold runs #f8e4ad, #dcb466 60%, #c59a4a at 170deg; tile gold #fbefcf, #ebcd8c 70%, #dcb46a at 165deg.
- **Script Gold** (script-gold, #9a6e2e): every Corinthia section title, the timeline times, the Bismillah and the card's "va".
- **Line Gold** (line-gold, #b8924a): coded line art (timeline drawings, ornamental dividers, blossom nodes, hint sparks); matches the owner's rings drawing.
- **Bronze** (bronze, #8a6128): revealed scratch values, the hero ampersand and hero divider.

### Tertiary
- **Lantern Amber** (amber, #f6c76a): light only. The seal glow, the ring of light on the press, the envelope interior (#fff4d2, #f3cf86, #d9a95a radial) and its soft rays seen in the flap gaps, the warm spill through the paper and the flap-tip tone (rgba(255, 206, 124, 0.6-0.7)), the gold dust and the rising motes over the photograph.

### Neutral
- **Sepia Ink** (ink, #4a331b): all set text and icons on gold.
- **Faded Sepia** (ink-soft, #77604a): secondary lines, hints, labels, weekday and time, form labels.
- **Hero Ink** (hero-ink, #4f2f12): the couple's names set in the photograph's sky, darker so they hold against the sunset; the welcome lines above them use #5a3618.
- **Name Ink** (name-ink, #6a4818): the closing names, scroll cue, "Rahmat!" and the showcase template name.
- **Cream Ground** (ground, #f5ecdf): the column behind every section; also the colour the hero photograph fades into at its foot.
- **Envelope Paper** (paper, #f7efe2) and **Paper Shade** (paper-shade, #efe4d1): the fallback gradient under the paper photograph.
- **Envelope Lining** (lining, #ead9ba): the back of each flap (to #e1cba3).
- **Table Linen** (surround, #e9ddc9): the page outside the 480px column on wide screens.
- **Card Stock** (field, #fffcf5): inputs, choice buttons, ghost wash, the scratch card under its foil (#fffaf0 to #f3e6cd).
- **Gilt Hairline** (gilt-line): 1px borders on fields and choices.
- **Brick Sepia** (error-brick, #9b3b22): the single RSVP error line.
- **Gallery Linen** (showcase-ground, #efe5d4): the showcase gallery, lit from the top by a pale radial.

### Named Rules
**The Sepia Rule.** Ink is brown, never black. Even the showcase phone bezel is dark brown (#241a10).

**The Light Is Not Paint Rule.** Amber and the white-gold radials describe light (seal glow, envelope interior, spill and rays, gold dust, motes, the glints that cross the paper, the foil and the arch card, the sky veil behind the hero names). They never fill a card, a button or text.

**The Multiply Rule.** Rasters drawn on white (rose spray, rings) are laid on cream with `mix-blend-mode: multiply` so their ground disappears; the seal's initials are gold (#a77b34, dot #b88c3e) multiplied into the wax so they read as pressed, not printed.

## Typography

**Display / Script Font:** Corinthia (with Pinyon Script, cursive)
**Body Font:** Bodoni Moda with optical sizing on (with Didot, Bodoni 72, Georgia, serif)
**Arabic Font:** Amiri (with Noto Naskh Arabic, serif), loaded as a Google Fonts `text=` subset of the Bismillah only

**Character:** a hand-lettered script carries everything spoken, signed or titled; a high-contrast Didone with optical sizes carries everything set. Lining numerals throughout; tabular lining figures in the countdown.

### Hierarchy
- **Display** (Corinthia 400, `min(min(17, 110/L)vw, min(80, 520/L)px)` for the longest name of L letters, 0.95, hero-ink): the couple's names in the photograph's sky, the second name indented 18% after an italic Bodoni ampersand at 0.42em.
- **Script title** (Corinthia 400, clamp(44px, 12.5vw, 56px), 1.05, script-gold): every section title (Sana, Qadrli do‘stlar va yaqinlar, To‘y dasturi, To‘yxona, Javobingizni kutamiz, the closing line).
- **Script closing** (clamp(46px, 13vw, 60px), name-ink): the names that sign the page.
- **Script name** (clamp(38px, 21cqi, 58px), #8f6426): the names on the arch card, sized to the card.
- **Script welcome** (clamp(34px, 10vw, 46px)): "Nikoh to‘yimizga" in the hero.
- **Script time** (42px, script-gold): timeline times. **Script joiner** (clamp(24px, 12cqi, 32px)): the card's "va". **Script cue** (24px, name-ink): "Pastga suring".
- **Arabic** (Amiri 400, clamp(17px, 9cqi, 24px), 1.5, script-gold, `lang="ar" dir="rtl"`): the Bismillah at the head of the arch card.
- **Headline** (Bodoni Moda 500, 30px, 1.12, balanced): the venue name. The showcase title uses clamp(34px, 8.5vw, 52px).
- **Numeral** (Bodoni Moda 500, 32px, tabular lining): countdown tiles, shrinking with the tile (`min(32px, 38cqi)`).
- **Scratch value** (Bodoni Moda 500, clamp(20px, 6.4vw, 28px), bronze).
- **Body** (Bodoni Moda 400, 18px, 1.62, pretty wrap): the message, max 300px. **Lead** 17px for the hero greeting, timeline titles and gallery lead; **body small** 16px for address and RSVP intro.
- **Italic line** (15px, 0.02em, ink-soft): "Muhrni bosing", the scratch instruction.
- **Small** (14px): form labels, the closing long date (0.18em), the showcase text link. **Meta** (12.5px, 0.12em): gallery couple and date.
- **Label** (11px, 0.24em, uppercase, ink-soft): KUN / OY / YIL under the scratch cards.
- **Card caps** (Bodoni Moda uppercase, 0.08em, #5a3d1f): the invitation line and parents' lines inside the arch card, sized to the card with container units.

### Named Rules
**The Spoken Script Rule.** Corinthia sets names, greetings, section titles and the programme times. Instructions, body copy, labels, form text and data are Bodoni Moda.

**The Bismillah Only Rule.** Amiri sets the Arabic Bismillah and nothing else, and it is fetched only for those glyphs.

**The One Line Rule.** The sealed envelope carries exactly one line of text, the italic instruction under the seal. Everything else on the paper is the owner's embossing.

## Layout

One phone-width column, max 480px, centred on the table-linen surround with a soft ambient halo; the envelope and hero photograph fill it edge to edge at 100svh, and the page cannot scroll until the scene is revealed. On a phone the column is the screen.

The hero photograph covers the frame (`object-position: 52% 50%`). A veil lightens the sky behind the lettering (a radial at 50% 22%) and fades the floor into the cream ground from 64% to 99%. The welcome block sits in the sky from 22% to the right edge, 9% from the top plus the safe-area inset, clear of the flowering branch. Rose sprays (46% wide, rotated -12deg, one mirrored) bleed off the bottom corners.

Sections follow on cream in this order: **Sana** (scratch date, then weekday/time and countdown), **arch card** (Bismillah, invitation line, both names with their parents), **message** (with rose sprays at the sides), **To‘y dasturi** (timeline), **To‘yxona** (venue, address, arch map, map buttons), **Javobingizni kutamiz** (RSVP), **closing** (112px seal, closing line, names, long date), then the showcase end slot. Sections pad 72px by 24px, consecutive sections tighten to 24px on top; the message section pads 56px / 72px; the card section narrows sides to 12px. Inner blocks sit in 300-400px measures (scratch row and tiles 360px). Grids use a 10px gap; the scratch row 12px.

Fixed controls align to the column, not the viewport: `right: max(0px, (100vw - 480px) / 2) + 16px`, and respect safe-area insets.

### Showcase shell (shared across templates)
- Each template is one hash route (`#oltin-muhr`) and plugs in as `{ Invitation, Preview }`. The Invitation accepts `replayToken` (re-seals it) and `endSlot` (rendered after its closing section).
- The gallery shows each template's closed first viewport inside a 200 x 420 phone frame (34px radius, dark brown bezel), with the template name in its own script, one descriptive line, and the sample couple and date. Cards lift 6px and tilt -1deg on hover with the 0.7s ease-out.
- In an example, a 44px round back arrow sits beside the column (inside it below 600px) only while the invitation is closed, and fades after 1.2s of stillness so the first filmed frame is the invitation alone.
- The end slot offers "Qaytadan ochish" (replay) as the template's own ghost button and "Barcha namunalar" as an underlined text link.
- The build (`scripts/build-showcase.mjs`) emits one self-contained HTML file with JS, CSS and music inlined; fonts come from Google Fonts (Bodoni Moda with opsz axis, Corinthia, and the Amiri Bismillah subset).

## Elevation & Depth

Depth is physical and photographic: real embossed paper, flaps tilting in perspective, a card lying on the page, wax with a soft drop. There are no hard edges or offset shadows. Each envelope flap tilts in its own 3200px perspective and is painted in document order (inside, sides, bottom, top), so planes never depth-sort against each other; upper flaps cast a blurred brown shadow that fades as they lift. Gold objects carry an inner top highlight, an inner gilt ring and a soft warm drop. Light (glow, dust, the amber interior) is added with `lighter` compositing and radial gradients, never with shadows on text.

### Shadow Vocabulary
- **Column halo** (`box-shadow: 0 0 80px -30px rgba(74, 51, 27, 0.35)`): the column on wide screens.
- **Gold surface** (`inset 0 1px 0 rgba(255,255,255,0.65), inset 0 0 0 1px rgba(143,106,42,0.45), 0 10px 20px -12px rgba(120,84,30,0.7)`): buttons; tiles use the same recipe with a 0.35 gilt ring and a 22px drop.
- **Scratch card** (`inset 0 0 0 1px rgba(184,146,74,0.45), 0 14px 26px -16px rgba(110,76,26,0.65)`).
- **Card on paper** (`0 1px 2px rgba(80,56,24,0.18), 0 22px 40px -22px rgba(80,56,24,0.55)`): the arch card.
- **Wax drop** (`filter: drop-shadow(0 6px 10px rgba(80,52,20,0.28))`): the seal wherever it appears.
- **Flap cast** (`rgba(110, 78, 36, 0.22)` clipped to the flap shape, `blur(5px)`; 0.14 for the bottom flap).
- **Sky halo** (`text-shadow: 0 0 22px rgba(255,243,226,0.9)`): the hero lettering only, a soft light behind it, never a drop.
- **Field focus** (`0 0 0 4px rgba(239, 217, 160, 0.45)` with a gilt border).
- **Ring of light** (`0 0 0 2px rgba(255, 236, 190, 0.9), 0 0 24px 6px rgba(246, 199, 106, 0.6)`): light, not a shadow. Leaves the seal on the press (scale 0.7 to 2.8, fading, 800ms after 120ms); the closing stamp sends a 1.5px line-gold ring the same way.
- **Petal shade** (canvas `rgba(90, 55, 25, 0.18)`, blur 3, 1.5px down): the falling petals only, so they read as paper-thin objects over the photograph.

### Named Rules
**The Real Paper Rule.** The envelope's relief is the owner's embossed-paper photograph; no coded relief, flourish or colour ornament is printed on top of it. Light may cross it (the sheen, the spill, the flap-tip tone); nothing is drawn on it.

**The Wipe, Not Fade Rule.** A multiplied photograph (rose spray, rings) never fades and never sits inside an ancestor that fades or transforms: Chrome drops the blend mid-fade and an ancestor's opacity isolates it, so the white ground flashes. Move the image itself, not its box, and draw it in with a clip-path wipe (`inset(0 100% 0 0)` to none, 1.3s ease-out, mirrored for right-hand art). Its own rotate or scale (the sway) is fine.

## Shapes

The envelope is triangular: the top flap meets the seal at 48% height, the bottom flap rises to 54%, the side flaps reach 64% across so they tuck under. The arch card is a real card (3px corners, 960:1624) whose cusped Mughal arch and jali pillar are in the raster; text sits inside the arch (13.5% from the left, 62% wide, 19% to 84% high). The venue map is clipped by the pointed `archPath` with a double gilt outline. Controls are pills (999px) or soft rectangles (14px), as are scratch cards and countdown tiles; the seal is the photographed wax disc; timeline nodes are six-petal blossoms on the ground colour; dividers are a hairline with two leaf loops around a central diamond.

## Components

### Buttons
Gilded and tactile.
- **Shape:** full pill (999px), 50px minimum height.
- **Primary:** champagne-to-antique gold gradient (170deg, #f8e4ad, #dcb466 60%, #c59a4a), dark sepia text (#3f2a12), Bodoni Moda 500 15px, 0 22px padding, gold-surface shadow.
- **Hover / Active / Focus:** shadow deepens on hover; presses to scale 0.97 with the 0.25s ease-out; focus is a 2px gold-deep outline offset 3px. Disabled drops to 0.55 opacity.
- **Ghost:** card-stock wash at 50%, 1px gilt-hairline inset ring, sepia text, same pill and height; also the RSVP stepper (34px round) and the showcase replay control.

### Choice buttons
- **Style:** 14px radius, 52px tall, card stock with a gilt hairline border, 15.5px Bodoni.
- **Selected:** (`aria-pressed`) takes the gold gradient, gilt border, dark sepia text; 0.25s colour transition.

### Inputs / Fields
- **Style:** card stock, 1px gilt hairline, 14px radius, 52px tall, 14px 16px padding, 16px Bodoni, placeholder #8f7a63, gold-deep caret.
- **Focus:** border goes to gilt with a 4px champagne halo; no outline.
- **Error:** a single `role="alert"` line in brick sepia under the form.

### Wax seal (signature)
The owner's wax-seal photograph (keyed to alpha) with the couple's initials in Corinthia at 0.2 of the seal width, separated by a small gold dot, multiplied into the empty centre. It sits at 36% of the column width over the flap point at 48% height, breathing a soft amber glow (3.4s, after 1.2s) while sealed; keyboard focus adds a gilt edge and amber halo. It returns at 112px to close the page, stamped onto it as it scrolls in.

### Sealed envelope at rest (signature)
While it waits for the tap, the letter is held, not printed.
- **Hold:** the whole envelope tilts in a 1600px perspective around 50% 46%, from rotateX(0.7deg) rotateY(-0.9deg) to rotateX(-0.6deg) rotateY(0.9deg) at scale 1.03, 9s ease-in-out, endlessly.
- **Sheen:** a white-gold band (112deg, rgba(255, 253, 244, 0.42) at its centre, 40-60%) crosses the embossing every 7s after 1.2s, travelling in the first 45% of the cycle.
- **Rings:** two 1.5px rings (rgba(196, 154, 80, 0.75)) pulse out of the seal from 0.9 to 1.75 scale, 3.2s, starting at 1.4s and 2.2s; only when the seal can be opened.
- **Hint:** "Muhrni bosing" breathes between 0.6 and 1 opacity on the same 3.2s beat.

### Opening choreography (signature)
Times from the tap; the scene replaces the envelope at `TO_SCENE` 2700ms (kept in sync between the component and the stylesheet). The photograph and names mount under the paper at the tap so the envelope can dissolve into them.
- 0ms: seal press (scale 1, 0.94, 1.05, 1 over 520ms), glow blooms from 0.6 to 1.35 over 900ms, the hint, sheen and rings stop, a haptic pulse (`navigator.vibrate([14, 70, 22])`), seal sounds and music start, 150 gold motes burst from the seal with a trailing rise of 3 motes per frame (canvas, `lighter`, DPR capped at 2).
- 0-2700ms: the camera: the envelope gives under the thumb (scale 1.03 to 1.012 by 7%), then pushes into the light to 1.13, `cubic-bezier(0.33, 0, 0.2, 1)`.
- 120ms: the ring of light leaves the seal (800ms).
- 520ms: warm light spills through the paper around the seal (radial at 50% 47%, 900ms ease-out).
- 560ms: the top flap tilts up to 56deg (3200px perspective) over 1100ms; the seal rides its tip on its own layer (rising 18% and growing to 1.08) while staying flat to the guest.
- 600ms: each flap's front warms toward its tip and darkens slightly at its fold (its own `--mh-tone`, 1100ms); flap shadows fade (300ms); the amber core swells over 1200ms from 650ms.
- 700ms: soft rays (repeating conic shafts, rgba(255, 250, 228, 0.34), masked to a radial) appear behind the flaps over 900ms and turn once per 30s; they are seen only through the gaps.
- 700 / 720 / 760ms: left, right and bottom flaps part partway (-50deg, 50deg, -48deg) over 1050ms with the flap ease, leaving amber wedges between them.
- 1350ms + 140ms per line: the welcome lines and divider unblur from 6px (1500ms each), above the paper at their final hero position.
- 1500ms: the seal fades (450ms ease-in), giving the sky to the names.
- 1100ms + 120ms per line (the names are lines 3 and 4, so 1460 and 1580ms): the names are written in left to right by a mask wipe (a 250% wide mask, black to 40% and clear from 60%, sliding from 100% to 0 over 1500ms, `cubic-bezier(0.45, 0, 0.35, 1)`), unblurring with it; the first ink shows the moment the wipe starts and it ends fully opaque. The names carry 0.2em / 0.3em padding so the script's swashes stay inside the mask.
- 1700ms: the photograph settles from 1.12 to 1.04 over 3000ms, resting enlarged so the drift never shows an edge.
- 1750ms: a soft shimmer of four high bells (2349-3729Hz, 110ms apart) as the paper gives way.
- 1850ms: the envelope dissolves (opacity 0, scale 1.05, 850ms); dust fades from 1900ms over 700ms.
- 2700ms: scene; the page unlocks, sections mount, the dust stops, the music coin fades in; the scroll cue appears at 1600ms and bobs.
- Reduced motion: flaps open in 400ms; no hold, sheen, rings, camera, rays, dust, breathing glow or cue bob.

### Living scene (signature)
The hero keeps moving after the opening, all of it ambient.
- **Petals and motes:** a canvas over the photograph (under the lettering) starts 2200ms after the tap: 11 rose petals (three cream-to-blush tints, 5-9.5px, turning over as they fall and sway) drift down, and 16 soft amber motes rise from the lower two-thirds with `lighter` compositing, fading out by 20% height. DPR capped at 2; it pauses when the photograph is off screen or the tab is hidden, and never starts under reduced motion.
- **Drift:** from 4700ms the photograph drifts to translate(-1.6%, -1%) and back, 22s ease-in-out.
- **Sway:** the hero rose sprays rock ±1.6deg from their foot, 5.5s alternate, the right one half a cycle behind.

### Scratch date cards (signature)
Three square cards (Kun / Oy / Yil) under the script title "Sana" and an italic instruction flanked by two four-point SVG sparks. Each carries a canvas of brushed gold foil (diagonal #b8893a, #f3dc9c, #c99a4c, #f6e4ae, #a77a2c, with grain and a glint) that the guest scratches away with a stroke 30% of the card width; at half cleared the foil fades out (0.7s) and the bronze value stands. Enter or Space reveals at once. On reveal the value pops from 0.82 (700ms overshoot), a white-gold glint crosses the card (1100ms after 150ms) and the phone ticks (`navigator.vibrate(12)`). When all three are scratched, a shower of gold motes bursts from the centre of the row for 1600ms.

### After-date block
Collapsed (`grid-template-rows: 0fr`, no margin, transparent) until all three dates are scratched, so the page never holds an empty band; then it opens over 0.9s to the italic weekday and time and the countdown tiles. Its clip is released once open so tile shadows are not cut.

### Countdown tiles
Four gold tiles in a 4-up grid (10px gap, 360px max), 14px radius, tabular numerals that shrink with the tile (container query), uppercase unit label.

### Arch card (signature)
The owner's arch-card raster (cusped arch pressed into ivory, gold jali pillar, flowers) lying on the page with the card-on-paper shadow. It is laid down as it scrolls in (from perspective(1100px) rotateX(16deg), 50px low, 0.96, pivoting on its foot, 1.4s), then its lines appear one by one from 0.55s to 1.55s, and a foil sheen crosses it every 8s after 1.3s. Inside the arch: the Bismillah in Amiri, the invitation line in card caps, the groom's name in script, a divider, his parents, a script "va", the bride's name, a divider, her parents.

### Programme timeline
A centred fading gold hairline (#c9a868) with blossom nodes; entries alternate sides, art on one side (max 150px, multiplied) and a script time with a 15px title on the other. The nikoh entry uses the owner's rings drawing; the door, feast and doira entries are coded gold line art. The hairline is drawn down the page as the programme scrolls in (scale from 0, 2.6s); each moment then arrives from its own side: art slides in 28px (the rings photograph wipes in instead, per the Wipe, Not Fade Rule), the blossom node pops from 0 at 0.1s, the text slides from the opposite side at 0.25s.

### Venue map
A stylised city map in the pointed arch (cream roads, gold pin with a pulsing ring, card-stock label pill; the map rises in and the pin drops 70px onto it with a small bounce, 1000ms after 500ms), then a gold "Google Maps" button and a ghost "Yandex xarita" button side by side. No iframe.

### Scroll reveals
Every section arrives once, the first time it scrolls in (12% visible, bottom margin -10%), and stays. Elements marked `data-reveal` receive `data-in`; `--d` staggers them within a section. With no IntersectionObserver or under reduced motion everything is marked in at once.
- **up:** body lines, the venue name and the map rise 22px from opacity 0 and blur(4px), 1s ease-out.
- **write:** script headings and the closing names are written in with the same mask wipe as the hero names (1500ms, `cubic-bezier(0.5, 0, 0.3, 1)`).
- **deal:** the three date cards are dealt from 38px low and tilted (-7deg, 2deg, 8deg), 0.12s apart, with a slight overshoot.
- **card:** the arch card laid down (see Arch card).
- **bloom:** the message section's rose sprays open from 0.7 scale, then sway ±1.6deg every 6s after 1.4s.
- **line / step:** the programme hairline drawn down, each moment arriving from its side (see Programme timeline).
- **stamp:** the closing seal is pressed onto the page from 1.9 scale and blurred, overshooting to 0.94 and 1.03 (900ms), and a line-gold ring leaves it at 480ms; the closing line and names are then written in at 700ms and 1200ms.

### Music coin
A 48px gold coin fixed bottom-right of the column after the scene, play/pause drawn as inline SVG, coin shading, gold-deep focus outline.

### Placeholders awaiting owner assets
- The door, feast and doira timeline drawings (`LineArt.tsx`) are coded stand-ins matched to the rings drawing; replace them with owner rasters when supplied, multiplied the same way.
- Music uses the bundled tracks until the owner supplies the template's own.

## Do's and Don'ts

### Do:
- **Do** keep every raster owner-supplied and carrying its prompt and post-processing in embedded metadata.
- **Do** lay white-ground rasters on cream with `mix-blend-mode: multiply`, and press the seal's initials into the wax the same way.
- **Do** render gold as a gradient material with a highlight and a darker edge (deep antique to pale champagne), not as a flat fill.
- **Do** time motion with the slow ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) and bring light in before movement.
- **Do** draw icons, sparks, dividers and nodes as inline SVG in line gold or currentColor.
- **Do** keep fixed controls aligned to the 480px column and clear of safe-area insets.
- **Do** honour reduced motion: the flaps open in 400ms, and there is no dust, petals, hold, sheen, rings, rays, drift, sway or breathing glow; every scroll reveal is shown at rest.
- **Do** bring each section in once, as the guest scrolls to it, and leave it in place.
- **Do** draw a multiplied photograph in with a clip-path wipe on the image itself.

### Don't:
- **Don't** print colour ornament or extra text on the envelope; it carries the embossed paper, the seal and one italic line.
- **Don't** use black ink or neutral grey anywhere visible; text is sepia.
- **Don't** fill text with a gradient or clip a gradient to text; gold text is a flat script gold or bronze.
- **Don't** use emoji or font glyphs as icons.
- **Don't** add a second automatic sequence after the opening; later motion answers the guest (a section scrolled into view, a date scratched) or is ambient.
- **Don't** fade a multiplied photograph or fade or transform any ancestor of one; Chrome drops the blend and its white ground shows.
- **Don't** set instructions, body copy, labels or form text in the script face, or use Amiri for anything but the Bismillah.
- **Don't** let a later template borrow these tokens, rasters, the seal or the arch card; it shares only the showcase shell.
