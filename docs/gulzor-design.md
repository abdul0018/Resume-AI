# Design System: Gulzor

The second invitation world in the showcase (`#gulzor`, `src/templates/gulzor`), made after the owner's
garden-wedding reference. It is a spring garden in cream, sage and blush: white garden roses, script names,
letterspaced serif capitals, thin line icons, and cream panels with soft wave edges. It shares only the
showcase shell and the film player with Atlas lenta, never its tokens or rasters.

## Colours

| token | value | use |
| --- | --- | --- |
| `--gz-paper` | `#f8f5ef` | panels, the page |
| `--gz-ground` | `#f1ede4` | the quote band, under the blush roses |
| `--gz-ink` | `#4a5244` | headings, names, numbers |
| `--gz-text` | `#596055` | body |
| `--gz-soft` | `#7f8577` | kickers, labels |
| `--gz-sage` | `#93a083` | sprig dividers, timeline dots |
| `--gz-sage-deep` | `#63715a` | icons, pill borders, solid pills, the pin |
| `--gz-wash` | `#dde2d1` | the reply panel |
| `--gz-linen` | `#c3cbb5` | the linen the closed card lies on |
| `--gz-line` | `rgba(110,126,96,.36)` | hairlines |

The dress-code swatches are the palette itself: zaytun `#a9b49b`, xaki `#bdb491`, gulobi `#dcaca5`,
krem `#efe7d9`, pushti `#e9bdb6`.

## Type

- **Great Vibes** (`--gz-script`): the couple's names, "Aziz mehmonlar!", "Sizni kutib qolamiz!",
  "Sizni intiqlik bilan kutamiz!", the signature. It is never used for instructions or body copy.
- **Cormorant Garamond 500** (`--gz-serif`), with lining figures: everything else.
  - Body 18px/1.55.
  - Headings 19px capitals, 0.24em tracking.
  - Kickers 12px capitals, 0.32em tracking.
  - Times 20px; the countdown 30px.
  - Pills 12.5px capitals, 600, 0.2em tracking.

## Layout

- One column, max 480px, on `#e3e5d9`.
- Panels have 28px side padding.
- Each panel that lies over a photograph, or over a panel of another colour, rises over it on a 40px wave
  (`Wave`, four shapes) filled with its own colour.

The page runs:

1. **Hero.** The garden arch, full screen, with white lettering:
   - kicker;
   - the names, staggered left and right, with a small "va" between;
   - the invitation line;
   - the date with dots;
   - a hairline blossom mark;
   - "Ikki qalb, bir taqdir, yangi boshlanish" at the lower right.
2. **Welcome.** Its wave rises over the hero. Script greeting, message, heart, signature, then the bouquet
   photograph fading up out of the paper.
3. **The day.**
   - Blossoms hang from the top.
   - "Eng muhimi / Sana va vaqt" with a calendar row and a pin row (the pin row links down to the map).
   - The countdown.
   - "Kun tartibi": a timeline with icons, a thread and dots.
   - "Kiyinish uslubi" with the swatches.
   - The table photograph in an arch.
   - "Sizni kutib qolamiz!"; blossoms rise from the bottom.
4. **Quote.** Blush roses at the top right; "Muhabbat — qalbda gullaydigan eng go‘zal gul".
5. **Way there.** Google and Yandex pills, and the illustrated map: an organic blob, the pin dropping onto the
   house, the venue label.
6. **Replies.** The sage panel. A "Tasdiqlash" pill opens a short form in place. Phone, Telegram and WhatsApp
   circles appear when `contactPhone` is set.
7. **To‘yana.** A cream card with a sage edge and the copy pill.
8. **Closing.** The contact number, "Sizni intiqlik bilan kutamiz!", a heart rule and blossoms.

## Opening

**Drawn** (`GardenCard`; the times are ms after the tap). A cream gatefold lies on sage linen, inset 7% at the
sides, 8% at the top and 11% at the foot. A line of drawn white garden flowers runs across its middle, tied
with a sage silk bow.

| ms | what happens |
| --- | --- |
| 0–950 | the bow loosens, slips and lifts away |
| 0–1750 | the flower line gives, then its halves slide off either side; petals fall from 700 ms |
| 1250–2650 | the left door lifts at its edge and swings open |
| 1500–2900 | the right door does the same; each face darkens as it turns from the light |
| 2500–4300 | the camera moves down into the card |
| 3500–4400 | the card fades; the page takes over at 4500 ms |

During the camera move, the photograph inside grows with the card, locked to its edges: both use the same
curve about the same point (scale 0.86 to 1.10, then a settle to 1.04).

**Film.** The owner's film (`public/film/gulzor/`, 10 s, 720 x 1280, 2.6 MB) plays instead. The closed card is
its first frame, with the names at 24.5% and the date at 66.5% of the frame set over it, and the hint on the
linen at 84.5%. The film ends on the garden arch. The hero photograph is that very last frame, so the film
melts into it without a seam (1.2 s), and the lettering is written in after. Its sounds land on the film's own
moments:

| cue | s |
| --- | --- |
| bow | 1.4 |
| flowers part | 2.3 |
| doors | 4.1, 5.3 |
| camera | 6.2 |
| bells | 9.4 |

**Reduced motion.** The card fades away in 450 ms onto a still hero.

## Motion on the page

Each element is revealed once, as it scrolls into view:

| element | how it appears |
| --- | --- |
| text | rises 16 px out of a 3 px blur (900 ms) |
| headings | their tracking closes from 0.46em |
| script | written in left to right by a moving mask |
| line icons | drawn stroke by stroke |
| timeline | its thread runs down; each moment arrives 180 ms after the last |
| swatches | pop in |
| arch photograph | opens from its foot |
| map | painted out from the house; the pin drops and pulses |

The photographed flowers are multiplied onto the paper, so they are wiped in and never faded.

## Photographs

The owner's pictures are in place. The hero is the film's last frame; the others are cropped to their
flowers: the bouquet square, the blossom borders to their flowered strip, the roses to their right-hand
spray, and the map to 4:5 with the manor house at 51.5%, 43%.

The template reads any file in `src/templates/gulzor/assets` by name: `hero`, `bouquet`, `blossoms-top`,
`blossoms-bottom`, `roses`, `table` and `map` (jpg, png or webp). Until one is supplied, its place is drawn:

- **hero:** a stand-in out-of-focus garden;
- **bouquet, blossoms, roses, table:** sprays of the drawn flowers;
- **map:** a watercolour garden map in SVG.

The prompts are in `docs/gulzor-images.md`.

## Islamic character

The invitation is a nikoh, so the page speaks as one:

- **Hero:** the Bismillah opens it in Amiri (with `bismillah` on), under the title "Nikoh to‘yiga taklifnoma";
  the line at its foot reads "Alloh qovushtirgan ikki qalb".
- **Welcome:** it greets with "Assalomu alaykum!", and the day's section is headed "Alloh nasib etsa".
- **Quote:** ar-Rum 30:21 ("…and He placed between you affection and mercy") in Arabic, with its Uzbek
  meaning and the reference.
- **Dua:** before the closing, the Prophet's ﷺ prayer for a married couple (Abu Dovud, Termiziy) in Arabic
  and Uzbek.
- **Ornaments:** the table sits in a pointed arch with a double hairline frame. Eight-pointed stars (two
  interlaced squares) mark the hero and the dividers. The programme's prayer moments take a crescent-and-star
  icon.
- **Music:** the sample plays Muhammad al-Muqit's wedding nasheed (`nashid`, its first 112 s with a fade,
  loudness-matched, 96 kb/s).
- **Arabic type:** Amiri is loaded whole (400, 700); the browser downloads only its Arabic subset.
