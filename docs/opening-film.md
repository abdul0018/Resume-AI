# Opening films

Each template can open with a pre-rendered film instead of its drawn opening. Atlas lenta's film (below):
the satin bow unties and the doors and inner flaps open. Gulzor's film (prompts in `docs/gulzor-images.md`):
the line of fresh flowers parts, the doors open and the camera moves down into the garden. The couple's names are set over the film's first frame in type, so one film
serves every couple. The film ends one of two ways (`end` in opening.json):

- `"scene"` (the current film): the film plays its own dissolve into the photo scene; its last frame then
  melts (1.2 s) into the live scene, laid exactly over it, whose welcome and names are written in. Cut the
  film before any baked-in text appears, and give `scene` (below) so the live scene lands on the film.
- `"card"`: the camera moves into the card lying in its last frame until it fills the screen.

For tests, `window.__FILM_OVERRIDE__ = { muhr: spec }` set before the page loads replaces the built film.

Without a film, or if a phone cannot play it (nothing moving 2.5 s after the tap), the drawn envelope plays
instead. A film that stalls part-way for 3 s hands over where it is.

## Files

Put these in `public/film/<template>/` (`muhr` for Atlas lenta, `gulzor` for Gulzor) and run
`npm run build:showcase`:

| file | what |
| --- | --- |
| `opening.mp4` | the film: H.264, 9:16, 720×1280, 4–7 s, no text, `+faststart` |
| `opening.jpg` | its first frame (the closed card), shown before the tap |
| `opening.json` | `end`, `names` and `hint` (heights on the closed card, as fractions of the frame), `cues` (seconds: `knot`, `ribbon`, `doors` [left, right], `flaps`, `end`) so the sounds land on the film's moments, and for `end: "card"` the `card` rectangle in the last frame |

`scene` locates the photograph (`photo`: x, y, w, h) and the two rose sprays (`sprays`: width and the centre of
each) in the film's last frame, in frame pixels (`frame`: [1080, 1920]). They were measured by matching
`hero.jpg` and `spray.jpg` into that frame (OpenCV SIFT + RANSAC: photo scale 1.376, offset −174, −108; sprays
497 px wide at ±12°). On any screen the live scene is placed by the same object-fit: cover mapping as the film.

The current film: `Wedding_invitation_ribbon_unties` (10 s, 1080×1920) cut at 8.25 s, the last frame before its
baked-in names begin to write. Its baked-in music button (from 7.6 s, centre 970, 1867, radius 66) is painted
out frame by frame (OpenCV inpaint over frames 174–197). Encoded to 810×1440, 2.3 MB. Its satin is silver; the prompt below asks
for champagne gold, to match the drawn envelope, should it be generated again.

Encode a generated film:

```sh
ffmpeg -i generated.mp4 -t 8.25 -an -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" \
  -c:v libx264 -profile:v high -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -an public/film/muhr/opening.mp4
ffmpeg -i public/film/muhr/opening.mp4 -frames:v 1 -q:v 2 public/film/muhr/opening.jpg
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

## Publishing on GitHub Pages

The live site, https://abdul0018.github.io/Resume-AI/ (`#oltin-muhr`, `#gulzor` for each template), is served
from the `gh-pages` branch, which holds only `index.html` and `.nojekyll`. To update it, run
`npm run build:pages` (it builds the showcase into `docs/index.html`), commit that, then copy the same file to
the root of `gh-pages` and push that branch.
