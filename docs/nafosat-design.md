# Design System: Nafosat

The third world in the showcase (`#nafosat`, `src/templates/nafosat`). It follows the owner's "Digital
Elegance" reference: soft white paper with dusty blue and blush, white roses and blush peonies with silver
eucalyptus, copperplate names, a big Bodoni date and dusty-blue arch panels. Like the others, it shares only
the showcase shell, the film player and the line icons.

## Colours

| token | value | use |
| --- | --- | --- |
| `--nf-paper` | `#fcf8f5` | the page; the flowers and brush stroke are already laid on it |
| `--nf-blue` | `#7f9cb4` | script names, round buttons, pills |
| `--nf-blue-deep` | `#56728a` | monogram, small capitals, numbers |
| `--nf-arch` | `#9db4c6` | the place arch |
| `--nf-ink` | `#5b6168` | body |
| `--nf-soft` | `#8a9097` | quotes |

## Type

- **Pinyon Script:** names, "Bir umrga baxtli!", the month, "Nikoh va ziyofat", "To‘yana".
- **Bodoni Moda:** the monogram, the big day, the year, card numbers.
- **Montserrat:** body and spaced capitals.
- **Cormorant Garamond italic:** quotes and lines.

## Opening

The owner's film (`public/film/nafosat/`, 8 s, one continuous take) starts on the cream wedding car on a
coastal road of roses. On the tap the car drives away and the camera follows it. The film ends on the car
under the flower arch, with the sea beyond, and that last frame is the website's first screen.

- **Speed:** played at 1.35×.
- **Hand-over:** `lead: 1.6` brings the page in over the film's last 1.2 s. A cream sky settles over the
  top and the road turns into paper at the foot (1.4 s). The monogram and names are written into the sky;
  the invitation line and date appear at the foot.
- **Seam:** the film then melts into the same frame beneath, so nothing jumps; the middle of the picture
  stays clear.
- **Closed card:** the names and date sit on a pale band over the sky; the hint is a pill over the road.
- **Without the film:** the closed picture fades out under the settling sky (reduced motion, or a phone that
  will not play it).

## Page

The reference gives the look only. The page follows an Uzbek invitation's own order:

1. Roses, the Bismillah, "Qadrli mehmonlar!", and the parents' invitation naming the couple, signed
   "Hurmat bilan" by the families.
2. Kuyov and Kelin: each name in script with whose son or daughter they are, the monogram between them.
3. To‘y sanasi: a large Bodoni day crossed by the script month, then the year, the weekday and time, and a
   countdown in arch-topped tiles.
4. To‘y dasturi: the title on a dusty-blue brush stroke, and a timeline with diamond marks.
5. To‘yxona: roses above a dusty-blue arch holding the venue, the address, round Yandex and Google buttons,
   and the dress code.
6. Javobingizni kutamiz: a band of roses, a short reply form, and round Telegram and call buttons.
7. To‘yana: a gift icon, the card and a copy pill.
8. Duo: a prayer for the couple, "Sizni intiqlik bilan kutamiz!", the families' signature, the showcase
   buttons, and roses at the foot of the page.

## Motion

- **Revealed once:** text rises out of a blur and script is written in. The flowers and brush are wiped
  open from their middle or foot, never faded. The arch rises from its foot.
- **Watched elements:** the reveal watches a wrapper, never the clipped element itself. An element that clips
  itself away is reported as in view only once its edge arrives.
