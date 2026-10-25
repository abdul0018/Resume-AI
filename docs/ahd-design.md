# Design System: Ahd

The fourth world in the showcase (`#ahd`, `src/templates/ahd`), "the vow". Its film shows two hands, each
holding a ring, coming together at a tall window. The day is grey; as the rings meet, it turns golden. The
page is a **light** one by the owner's choice, with no dark sections. Its lettering follows a reference the
owner supplied (a printed-letter wedding site), taking its type and ornament only, not its structure: it
reads like a letter on ivory paper, in espresso-brown ink with one small wine-red heart as its only colour.

## Colours

| token | value | use |
| --- | --- | --- |
| `--ah-paper` | `#f4eee5` | the page, with a faint paper grain |
| `--ah-card` | `#f9f5ee` | the date card, the venue window, the gift card |
| `--ah-ink` | `#3f3029` | text, names, rules, button frames |
| `--ah-soft` | `#84756a` | labels, quiet text |
| `--ah-wine` | `#7b2d2a` | hearts, programme beads, the slider ring, the main buttons |
| `--ah-line` | `rgba(63,48,41,.34)` | hairlines and frames |

## Type

- **Ms Madi:** a signature hand for the couple's names and the families' signature.
- **Nothing You Could Do:** pen-written capitals for headings, programme times, the venue name and the
  closing line. It has no Uzbek ‘ of its own, so `pen()` writes these with the modifier letter ʻ.
- **Crimson Pro:** the body, and spaced serif capitals for labels and buttons.

## Ornament

- **Heart rule:** a hairline with a small wine-red heart, under each heading and under the hero names.
- **Thread:** a line across the page that loops into a heart, after the date and before the closing words.
- **Programme thread:** winds down the page with a bead at each hour and ends in a small heart; the hours and
  events sit on alternate sides. It draws itself in when it comes into view.
- **Buttons:** square, a thin ink frame and serif capitals; the main ones filled in wine.

## Opening

The owner's film is in `public/film/ahd/` (6.5 s, 0.5 MB, played at 1.15×).

- **Closed:** the film's first frame with nothing written on it, only a pale round button with two rings
  between the hands.
- **Hand-over:** `lead: 1.2` brings the page in over the film's last second. A pale veil settles over the
  foot (the names, "Ikki uzuk — bir ahd").
- **First screen:** the film's last frame, the rings joined in warm light, with the hands and rings left clear
  between the two veils.
- **Without the film:** the closed picture fades under the veil.

## Page

Each section has its heading in pen capitals over the heart rule. There are no section numbers or eyebrow
labels; the page is one sheet of paper.

1. **Qadrli mehmonlar!:** the Bismillah, the parents' invitation naming the couple, and the families'
   signature.
2. **Kelin va kuyov:** a sash window. The groom is in the upper pane and the bride in the lower, each name
   in the signature hand over whose son or daughter they are. The rings are the latch on the rail; the two
   sashes slide toward it.
3. **To‘y sanasi:** the date waits behind two linen curtains.
   - The guest slides the wine-red ring along its rail; the curtains follow the finger and part.
   - Past 72% of the way they open fully, the week of the wedding shows as a calendar line with the day on a beating heart, the phone
     ticks, and the countdown comes out between thin upright rules.
   - Let go early and they fall closed. The ring is also a button for keyboards.
   - Nothing is written on the rail, only chevrons shimmering toward the open side.
   - This is the page's one authored moment; the rest of the page is simply there, with no entrance.
4. **To‘y dasturi:** the programme thread.
5. **To‘yxona:** the venue in an arched window frame, its centre bar running only through the arch. It
   holds the Yandex and Google buttons and the dress code in italic.
6. **Javobingizni kutamiz:** a reply form, with Telegram and call buttons.
7. **To‘yana:** the card and a copy button.
8. **Closing:** the thread, "Sizni intiqlik bilan kutamiz!" in pen capitals, the dua, and the signature.

The hero carries no label at its top. Only its foot is veiled, for the names and "Ikki uzuk — bir ahd".

## Music

The owner's song, an instrumental "Hijo de la luna" (`public/music/ahd.mp3`). It is the first phrase, 1.8 s
to 69 s, ending at the song's own pause with a 2.4 s fade so it loops cleanly. It is loudness-matched to the
others and encoded at 96 kb/s.
