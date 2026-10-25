# Design System: Ahd

The fourth world in the showcase (`#ahd`, `src/templates/ahd`), "the vow". Its film shows two hands, each
holding a ring, coming together at a tall window. The day is grey; as the rings meet, it turns golden. The
page is a **light** editorial one by the owner's choice, with no dark sections. It uses warm ivory paper,
brown-grey ink instead of black, one golden accent taken from the film's autumn bush, and the window's thin
pale bars as its rules.

## Colours

| token | value | use |
| --- | --- | --- |
| `--ah-paper` | `#f7f2ea` | the page |
| `--ah-linen` | `#efe7da` | alternate sections: date, venue, To‘yana |
| `--ah-ink` | `#4a433b` | text, names |
| `--ah-soft` | `#8b8277` | labels, quiet text |
| `--ah-gold` | `#c19a3e` | section numbers, the day, times, buttons, rings |
| `--ah-line` | `rgba(160,140,110,.38)` | the window's bars: rules, frames |

## Type

- **Playfair Display:** names, the day and month, times, card numbers; italic for names and lines.
- **Manrope 600:** spaced capitals for headings and buttons.
- **Manrope:** body.

## Opening

The owner's film is in `public/film/ahd/` (6.5 s, 0.5 MB, played at 1.15×).

- **Closed:** the film's first frame with nothing written on it, only a pale round button with two rings
  between the hands.
- **Hand-over:** `lead: 1.2` brings the page in over the film's last second. A pale veil settles over the
  top (the ceremony) and the foot (the names, "Ikki uzuk — bir ahd").
- **First screen:** the film's last frame, the rings joined in warm light, with the hands and rings left clear
  between the two veils.
- **Without the film:** the closed picture fades under the veil.

## Page

Each section has its own heading word in Playfair italic, over a window transom: a golden hairline with a
small square latch. There are no section numbers or eyebrow labels; plain paper and linen alternate to
separate the sections.

1. **Qadrli mehmonlar!:** the Bismillah, the parents' invitation naming the couple, and the families'
   signature.
2. **Kelin va kuyov:** a sash window. The groom is in the upper pane and the bride in the lower, each name
   in Playfair italic over whose son or daughter they are. The rings are the latch on the rail; the two
   sashes slide toward it.
3. **To‘y sanasi:** the date waits behind two linen curtains.
   - The guest slides the golden ring along its rail; the curtains follow the finger and part.
   - Past 72% of the way they open fully, the day glints, the phone ticks, and the countdown comes out.
   - Let go early and they fall closed. The ring is also a button for keyboards.
   - Nothing is written on the rail, only chevrons shimmering toward the open side.
   - This is the page's one authored moment; the rest of the page is simply there, with no entrance.
4. **To‘y dasturi:** times in gold between thin rules.
5. **To‘yxona:** the venue in an arched window frame, its centre bar running only through the arch. It
   holds the Yandex and Google buttons and the dress code in italic.
6. **Javobingizni kutamiz:** a reply form, with Telegram and call buttons.
7. **To‘yana:** the card and a copy button.
8. **Closing:** the rings, the dua, "Sizni intiqlik bilan kutamiz", and the signature.

The hero carries no label at its top. Only its foot is veiled, for the names and "Ikki uzuk — bir ahd".

## Music

The owner's song, an instrumental "Hijo de la luna" (`public/music/ahd.mp3`). It is the first phrase, 1.8 s
to 69 s, ending at the song's own pause with a 2.4 s fade so it loops cleanly. It is loudness-matched to the
others and encoded at 96 kb/s.
