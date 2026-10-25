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

The film (`public/film/nafosat/`) shows the cream wedding car on a coastal road of roses, seen from a low
chase camera. On the tap it drives away under the flower arch.

- **Speed:** played at 1.35×.
- **Cut:** frame 230 (9.6 s), just before the generated film jumps and the car pops out.
- **Hand-over:** `lead: 1.7` hands over 1.7 s of film time before the end. From then on, a cream mist laid
  above the film rises (1.6 s) and the car drives into it.
- **First screen:** the hero photograph is the film's last frame, under the same mist. The roses wipe down
  from the top, and the monogram, quote, names and date are written in.
- **The road:** it shows faintly below the mist and dissolves into the paper at the foot of the screen.
- **Closed card:** the names and date sit on a pale band over the sky; the hint is a pill over the road.
- **Without the film:** the closed picture fades out under the rising mist (reduced motion, or a phone that
  will not play it).

## Page

1. The invitation line on a white card over a band of roses, then "Bir umrga baxtli!".
2. The date: a large Bodoni day crossed by the script month, then the year, the weekday and time, the days
   left, and a round WhatsApp button that confirms attendance with a ready message.
3. Roses above a dusty-blue arch with a dashed inner line. Inside: the monogram, "Nikoh va ziyofat", the
   venue, the address, a round map button, a Yandex link, and Saint-Exupéry's line about looking in the same
   direction.
4. To‘yana: roses, a gift icon, the card and a copy pill.
5. A dusty-blue brush stroke with a line about two hearts.
6. Closing: "Sizni intiqlik bilan kutamiz", the names, the contact, the showcase buttons, and roses at the
   foot of the page.

## Motion

- **Revealed once:** text rises out of a blur and script is written in. The flowers and brush are wiped
  open from their middle or foot, never faded. The arch rises from its foot.
- **Watched elements:** the reveal watches a wrapper, never the clipped element itself. An element that clips
  itself away is reported as in view only once its edge arrives.
