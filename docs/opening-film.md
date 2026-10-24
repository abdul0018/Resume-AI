# Opening film (Atlas lenta template)

The invitation can open with a pre-rendered film instead of the drawn envelope: the satin bow unties, the
doors and inner flaps open, and the film ends on the card lying in the open envelope. When it ends, the
camera moves into that card until it fills the screen and the live card (names, date, venue as real text)
takes over. Without a film, or if a phone cannot play it, the drawn envelope plays instead and ends the
same way.

## Files

Put these in `public/film/` and run `npm run build:showcase`:

| file | what |
| --- | --- |
| `opening.mp4` | the film: H.264, 9:16, 720×1280, 4–7 s, no text, `+faststart` |
| `opening.jpg` | its first frame (the closed card), shown before the tap |
| `opening.json` | `{ "card": { "x": 0.14, "y": 0.14, "w": 0.72, "h": 0.72 }, "names": 0.35 }` — where the card lies in the last frame (fractions of the frame), and the height at which the couple's names are set on the closed card |

Encode a generated film:

```sh
ffmpeg -i generated.mp4 -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" \
  -c:v libx264 -profile:v high -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -an public/film/opening.mp4
ffmpeg -i public/film/opening.mp4 -frames:v 1 -q:v 2 public/film/opening.jpg
```

## Generating it

Start from the two frames rendered from the template (closed card; card lying in the opened envelope), so the
film's card matches the live card it hands over to. Use an image-to-video model that accepts a first and a
last frame (Kling, Veo, Runway, Higgsfield), 9:16, 5 seconds, no camera movement.

Video prompt:

> Top-down product shot, perfectly static camera, soft even daylight. A cream gatefold wedding invitation with
> embossed roses lies flat, tied across the middle with a champagne-gold satin ribbon and bow. The bow gently
> loosens and unties by itself, the loops slip through the knot and the satin ribbon slides off and falls away
> out of frame. Then the left door lifts at its edge and swings open, followed by the right door. The inner
> envelope flaps fold back, revealing a cream card with a thin gold double border and cream-and-gold roses in
> two corners, lying in the open envelope. Realistic paper and satin physics, soft shadows, elegant and slow.
> No hands, no text, no camera movement, no zoom.

Negative prompt: hands, fingers, text, letters, logo, watermark, camera shake, zoom, people.
