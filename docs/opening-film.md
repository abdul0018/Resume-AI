# Opening film (Atlas lenta template)

The invitation can open with a pre-rendered film instead of the drawn envelope: the satin bow unties and
the doors and inner flaps open. The couple's names are set over the film's first frame in type, so one film
serves every couple. The film ends one of two ways (`end` in opening.json):

- `"scene"` (the current film): it dissolves into the live photo scene, which comes into focus while its
  welcome and names are written in. Cut the film before any baked-in text or buttons appear.
- `"card"`: the camera moves into the card lying in its last frame until it fills the screen.

Without a film, or if a phone cannot play it (nothing moving 2.5 s after the tap), the drawn envelope plays
instead. A film that stalls part-way for 3 s hands over where it is.

## Files

Put these in `public/film/` and run `npm run build:showcase`:

| file | what |
| --- | --- |
| `opening.mp4` | the film: H.264, 9:16, 720×1280, 4–7 s, no text, `+faststart` |
| `opening.jpg` | its first frame (the closed card), shown before the tap |
| `opening.json` | `end`, `names` and `hint` (heights on the closed card, as fractions of the frame), `cues` (seconds: `knot`, `ribbon`, `doors` [left, right], `flaps`, `end`) so the sounds land on the film's moments, and for `end: "card"` the `card` rectangle in the last frame |

The current film: `Wedding_invitation_ribbon_unties` (10 s, 1080×1920) cut at 7.30 s, before the dissolve shows
the baked-in names and music button, encoded to 720×1280, 1.4 MB. Its satin is silver; the prompt below asks
for champagne gold, to match the drawn envelope, should it be generated again.

Encode a generated film:

```sh
ffmpeg -i generated.mp4 -t 7.30 -an -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" \
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
