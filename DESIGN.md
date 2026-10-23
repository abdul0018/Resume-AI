---
name: Oltin muhr
description: The phone screen is the envelope itself; breaking the wax seal lets Samarkand's evening light out.
colors:
  gold-deep: "#8f6a2a"
  gold: "#b08636"
  gold-pale: "#efd9a0"
  amber: "#f6c76a"
  ink: "#4a331b"
  ink-soft: "#77604a"
  name-ink: "#6a4818"
  ground: "#f6eee1"
  paper: "#f7efe2"
  paper-shade: "#efe4d1"
  lining: "#ead9ba"
  surround: "#e9ddc9"
  field: "#fffcf5"
  gilt-line: "rgba(176, 134, 54, 0.38)"
typography:
  display:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "66px"
    fontWeight: 400
    lineHeight: 1
  script-title:
    fontFamily: "Corinthia, Pinyon Script, cursive"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1
  numeral:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "92px"
    fontWeight: 400
    lineHeight: 0.9
  headline:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.62
  italic-line:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
  date-line:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "15px"
    fontWeight: 500
    letterSpacing: "0.32em"
  label:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.12em"
rounded:
  field: "14px"
  pill: "999px"
spacing:
  gap: "10px"
  section-y: "72px"
  section-x: "24px"
  section-stack: "24px"
  rule: "26px"
  block: "44px"
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
  countdown-tile:
    backgroundColor: "{colors.gold-pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "14px 4px 11px"
  music-coin:
    backgroundColor: "{colors.gold-pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "48px"
---

# Design System: Oltin muhr

Scope: this file records the first of seven invitation worlds in the examples-only showcase. Everything under Colors through Elevation, Shapes and the template components belongs to Oltin muhr alone; a later template brings its own world and must not inherit these tokens. The parts marked **Showcase shell** are the shared hosting conventions every template plugs into. The legacy app under `src/pages` and `src/components/invitation` is outside this system.

## Overview

**Creative North Star: "The Sealed Letter at Dusk"**

The phone screen is the envelope, edge to edge: ivory paper whose florals exist only as blind-embossed relief, closed with a cream wax seal stamped with a gold-leaf monogram. Breaking the seal is the single orchestrated moment of the page. Light comes before movement: the seal glows, gold dust lifts off it, the flaps part on amber light, a warm bloom washes the screen, and a carved ganch (alabaster) arch settles in with Samarkand's domes and minarets dissolving into gold haze behind the couple's names.

After the opening the page is calm and devotional: one centred phone-width column on ganch ivory, sepia ink, gilt hairlines, pointed-arch panels whose gold outline draws itself in view. Ornament is relief and light, not colour. Every scene is drawn in code (SVG, CSS, one canvas); there are no photographs, paintings or people.

**Key Characteristics:**
- Full-bleed envelope as the first viewport; the seal is the only control.
- Paper-on-paper relief: motifs carry the paper's own tone, shaped by a light/shadow filter.
- Gold is a material (leaf, gilt edge, coin), rendered as gradients from deep antique to pale champagne, never as a flat accent fill.
- Sepia ink throughout; no black anywhere a guest can see.
- Two faces: Corinthia script for names and spoken greetings, Bodoni Moda for everything set.
- Slow exponential ease-out; one choreographed sequence, then only ambient motion (lantern swing, flicker, breathing glow).

## Colors

A warm, single-temperature palette: ivory papers, sepia inks and a gold ramp, with amber reserved for light.

### Primary
- **Antique Gold Leaf** (gold-deep): the darkest gilt. Big date numeral, focus outlines, caret, the dark end of every gilt gradient.
- **Gilt** (gold): hairline rules, arch-panel outlines, the ampersand in the hero, map frame, selected-choice border.
- **Champagne Gold** (gold-pale): the light face of gold surfaces (buttons, tiles, music coin, selected choice) and the selection highlight. Gold surfaces are always a gradient running from roughly this tone (#f8e4ad) through #dcb466 to #c59a4a.

### Tertiary
- **Lantern Amber** (amber): light only. Seal glow, lantern glow, opening rays and the inside of the envelope. Never a text or surface colour.

### Neutral
- **Sepia Ink** (ink): all set text, headlines, icons on gold.
- **Faded Sepia** (ink-soft): secondary lines, hints, labels, the scroll cue, weekday/time.
- **Name Ink** (name-ink): the script names and script titles; a slightly warmer, more golden brown than set text.
- **Ganch Ivory** (ground): the column behind the sections, overlaid with a 220px fractal paper grain.
- **Envelope Paper** (paper) and **Paper Shade** (paper-shade): the two ends of the envelope face gradient (170deg).
- **Envelope Lining** (lining): the back of each flap, seen as it opens.
- **Table Linen** (surround): the page outside the 480px column on wide screens.
- **Card Stock** (field): inputs, choice buttons, ghost button wash.
- **Gilt Hairline** (gilt-line): 1px borders on fields and choices, calendar/date rules, the program timeline.

### Named Rules
**The Sepia Rule.** Ink is brown, never black. Black (`#000`, `rgba(0,0,0,.5)`) appears only as an alpha mask inside relief filters, where it is never painted.

**The Light Is Not Paint Rule.** Amber and the white-gold radial blooms describe light sources (seal, lanterns, envelope interior, sun disc). They never fill a card, a button or text.

## Typography

**Display Font:** Corinthia (with Pinyon Script, cursive)
**Body Font:** Bodoni Moda with optical sizing on (with Didot, Bodoni 72, Georgia, serif)

**Character:** a hand-lettered script carries what is spoken or signed (names, greetings, "Rahmat!"); a high-contrast Didone with optical sizes carries everything set. Lining numerals throughout; tabular lining figures for countdowns and program times.

### Hierarchy
- **Display** (Corinthia 400, hero names min(66px, 430px / longest name) times stage scale, line-height 1): the couple's names inside the arch. Closing signature repeats at 58px.
- **Script title** (Corinthia 400, 40px, 1): month name over the calendar; 46px for the RSVP thank-you; 33px x stage scale for the hero welcome lines.
- **Numeral** (Bodoni Moda 400, 92px, 0.9, gold-deep): the day of the month in the save-the-date block, flanked by month and year.
- **Headline** (Bodoni Moda 500, 30px, 1.12, -0.005em, balanced): section titles. 24px italic for the closing line.
- **Body** (Bodoni Moda 400, 18px, 1.62, pretty wrap): the welcome message; 16-17px for secondary paragraphs.
- **Italic line** (Bodoni Moda italic, 14-16px, 0.02em, ink-soft): the "Muhrni bosing" hint, scroll cue, weekday and time, sign-offs.
- **Date line** (Bodoni Moda 500, 15px x stage scale, 0.32em tracking): the hero date in dots.
- **Label** (Bodoni Moda 400, 11px, 0.12em, uppercase): countdown units and month/year beside the big numeral (15px, 0.28em there).

### Named Rules
**The Spoken Script Rule.** Corinthia sets only names and words a person would say or sign. Instructions, data and headings are Bodoni Moda.

**The One Line Rule.** The sealed envelope carries exactly one line of text, an italic instruction under the seal. Nothing else is printed on the paper.

## Layout

One phone-width column, max 480px, centred on the table-linen surround with a soft ambient halo; the envelope and arch fill it edge to edge at 100svh. On a phone the column is the screen.

The hero arch is composed on a fixed 400 x 860 stage scaled by `max(width/400, height/860)` (cover), so the arch, lanterns and text keep their relationships at any phone aspect. Text lines are positioned in stage units and centred horizontally.

Sections follow on ganch ivory, centred, 72px top and bottom with 24px sides; consecutive sections tighten to 24px on top. Inner blocks sit in 320-360px measures. Inside a section, related blocks are spaced 44px apart; gilt rules take 26px above and below. Grids use a 10px gap. The arch panel pads 118px top, 28px sides, 104px bottom to clear its rose sprays.

Fixed controls align to the column, not the viewport: `right: max(0px, (100vw - 480px) / 2) + 16px`, and respect safe-area insets.

### Showcase shell (shared across templates)
- Each template is one hash route (`#oltin-muhr`) and plugs in as `{ Invitation, Preview }`. The Invitation accepts `replayToken` (re-seals it) and `endSlot` (rendered after its closing section).
- The gallery shows each template's closed first viewport inside a 200 x 420 phone frame (34px radius, dark bezel), with the template name in its own script, one descriptive line, and the sample couple and date. Cards lift 6px and tilt -1deg on hover with the 0.7s ease-out.
- In an example, a 44px round back arrow sits beside the column (inside it below 600px) only while the invitation is closed, and fades after 1.2s of stillness so the first filmed frame is the invitation alone.
- The end slot offers "Qaytadan ochish" (replay) as the template's own ghost button and "Barcha namunalar" as an underlined text link.

## Elevation & Depth

Depth is physical and lit: relief, translucent paper, soft cast shadows and glows. There are no hard edges or offset shadows. The envelope is true 3D (perspective 1150px, origin 50% 46%), its flaps stacked a few px apart in Z, with a blurred brown shadow under each upper flap that fades as the flap lifts. Gold objects carry an inner top highlight, an inner gilt ring and a soft warm drop. Lanterns and the seal emit light through drop-shadows and radial glows.

### Shadow Vocabulary
- **Column halo** (`box-shadow: 0 0 80px -30px rgba(74, 51, 27, 0.35)`): the column on wide screens.
- **Gold surface** (`inset 0 1px 0 rgba(255,255,255,0.65), inset 0 0 0 1px rgba(143,106,42,0.45), 0 10px 20px -12px rgba(120,84,30,0.7)`): buttons; tiles use the same recipe with a 0.35 gilt ring and a 22px drop.
- **Flap cast** (`rgba(110, 78, 36, 0.22)` clipped to the flap shape, `blur(5px)`): paper on paper.
- **Lantern light** (`drop-shadow(0 8px 18px rgba(255,190,80,0.85)) drop-shadow(0 0 6px rgba(255,226,150,0.7))`).
- **Field focus** (`0 0 0 4px rgba(239, 217, 160, 0.45)` with a gilt border).

### Named Rules
**The Relief Not Ink Rule.** Embossed motifs (envelope florals, section sprays, ganch carving) are drawn as alpha shapes and turned into light and shadow by a filter; they always end up the tone of the surface they are carved into.

## Shapes

The governing silhouette is the pointed (Timurid) arch: the hero frame, the section panels, the venue map clip all derive from one `archPath`. Envelope geometry is triangular: the top flap meets the seal at 48% height, the bottom flap rises to 54%, the side flaps reach 64% across so they tuck under. Controls are pills (999px) or soft rectangles (14px); the seal is a scalloped wax disc; program markers are 9px gilt diamonds; the gilt rule is two fading hairlines around a four-point star.

## Components

### Buttons
Gilded and tactile.
- **Shape:** full pill (999px), 50px minimum height.
- **Primary:** champagne-to-antique gold gradient (170deg, #f8e4ad, #dcb466 60%, #c59a4a) with dark sepia text (#3f2a12), Bodoni Moda 500 15px, 0 22px padding, gold-surface shadow.
- **Hover / Active / Focus:** shadow deepens on hover; presses to scale 0.97 with the 0.25s ease-out; focus is a 2px gold-deep outline offset 3px. Disabled drops to 0.55 opacity.
- **Ghost:** card-stock wash at 50%, 1px gilt-hairline inset ring, sepia text, same pill and height.

### Choice buttons
- **Style:** 14px radius, 52px tall, card stock with a gilt hairline border, 15.5px Bodoni.
- **Selected:** (`aria-pressed`) takes the gold-surface gradient, gilt border, dark sepia text; 0.25s colour transition.

### Inputs / Fields
- **Style:** card stock, 1px gilt hairline, 14px radius, 52px tall, 14px 16px padding, 16px Bodoni, placeholder #8f7a63, gold-deep caret.
- **Focus:** border goes to gilt with a 4px champagne halo; no outline.
- **Error:** a single `role="alert"` line in brick sepia under the form.

### Countdown tiles
Four gold tiles in a 4-up grid (10px gap, 360px max), 14px radius, 32px tabular numerals, 11px uppercase unit label.

### Arch panel (signature)
A pointed-arch frame around a section's content: a translucent card-stock fill, a 1.3px gilt outline and an inner 1.6px gilt-gradient line 8px inside. Both outlines draw themselves (dash offset over 2.2s ease-out) the first time 15% of the panel enters view. Embossed rose sprays sit at the crown (112px) and lean into the lower corners (96px, rotated 18deg).

### Wax seal (signature)
Cream wax (#fdf7ea to #c7a873), a pressed well, a gold gilt ring with a dotted inner ring, and the couple's initials in Corinthia pressed in gold leaf. It sits on the top flap at 36% of the column width, breathing a soft amber glow (3.4s) while sealed. It returns at 104px over a rose spray to close the page.

### Opening choreography (signature)
Times from the tap; the scene replaces the envelope at 2700ms (kept in sync between the component and the stylesheet).
- 0ms: seal press (scale 0.94, 1.05, 1 over 520ms), glow blooms to 1.35 over 900ms, hint fades, 150 gold motes burst from the seal with a 3.6s trailing rise (canvas, DPR capped at 2).
- 600-650ms: flap shadows fade; the envelope's amber core swells over 1300ms.
- 620ms: top flap lifts to 165deg over 1500ms.
- 900ms: rays fade in and start a 14s rotation.
- 1080 / 1110 / 1150ms: left, right, bottom flaps part (82deg, 82deg, 96deg) over 1150ms with the flap ease.
- 1450ms: names rise out of blur over the light (900ms).
- 2080ms: white-gold bloom covers the screen (620ms ease-in).
- 2700ms: scene; bloom clears over 1150ms, the arch stage settles from 1.07 to 1 over 2200ms, text lines unblur in a 120ms stagger starting at 300ms, scroll cue appears at 1400ms, music coin fades in.
- Reduced motion: flaps open in 400ms, no dust, no rays, no breathing, no lantern swing, panels drawn instantly.

### Arch scene
The carved ganch archivolt (bead row, running lines, diamond chain, vine spandrels, rosettes, lattice pilasters) frames a sky of gold haze: sun disc, layered domes and minarets, a reflecting pool with ripples. Four lanterns hang from the arch edge at staggered drops, each swinging 2.6deg on its own 5.2-7.3s period with a flickering glow.

### Music coin
A 48px gold coin fixed bottom-right of the column, play/pause drawn as inline SVG, gold-surface shading, gold-deep focus outline.

### Program timeline
Time (20px, 500, tabular) right-aligned, a gilt diamond on a fading vertical hairline, title at 17px.

## Do's and Don'ts

### Do:
- **Do** render gold as a gradient material with a highlight and a darker edge (deep antique to pale champagne), not as a flat fill.
- **Do** keep every motif paper-on-paper: draw alpha shapes and let the relief filter turn them into light and shadow.
- **Do** time motion with the slow ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) and bring light in before movement.
- **Do** derive arches from the shared pointed-arch path so the hero, panels and map read as one architecture.
- **Do** keep fixed controls aligned to the 480px column and clear of safe-area insets.
- **Do** honour reduced motion with the shortened flap opening and static ornaments.

### Don't:
- **Don't** print colour ornament on the envelope; it carries only relief, the seal and one italic line.
- **Don't** use black ink or neutral grey anywhere visible; text is sepia.
- **Don't** add a second orchestrated moment after the opening; later motion stays ambient or reveal-on-view.
- **Don't** set instructions, data or headings in the script face.
- **Don't** add photographs, paintings or figures to the scene; it is architecture, light and ornament drawn in code.
- **Don't** let a later template borrow these tokens, the seal or the arch; it shares only the showcase shell.
