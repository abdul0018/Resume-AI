# Taklifnomation

Digital wedding invitations for the Uzbek market, shown and sold through Instagram. Each invitation opens
with a short cinematic film, then turns into a phone-sized invitation page in Uzbek.

**Live showcase:** https://abdul0018.github.io/Taklifnomation/

## Templates

| Template | Link | Opening | Look |
| --- | --- | --- | --- |
| **Atlas lenta** | [`#oltin-muhr`](https://abdul0018.github.io/Taklifnomation/#oltin-muhr) | A satin bow unties, a gatefold opens, and the scene melts into the couple's photograph. | Champagne and gold, Bodoni and Corinthia, scratch-card date, invitation card |
| **Gulzor** | [`#gulzor`](https://abdul0018.github.io/Taklifnomation/#gulzor) | A line of white flowers parts, the doors open, and the camera goes into the garden arch. | Cream, sage and blush, Bismillah, Ar-Rum 30:21, a dua for the couple, watercolour map, nasheed |
| **Nafosat** | [`#nafosat`](https://abdul0018.github.io/Taklifnomation/#nafosat) | The wedding car drives away down a coastal road of roses; the page opens on the car under the flower arch. | Dusty blue and blush, roses and peonies, copperplate names, Bodoni date, blue arch |

Every invitation page has:

- music that starts with the tap;
- the date with a live countdown;
- the day's programme;
- the venue with Yandex and Google map links;
- a reply form;
- To'yana, a gift card number with a copy button.

All of it works one-handed on a phone, including inside Instagram's and Telegram's in-app browsers.

## How it is built

- **React 19 + TypeScript + Vite + Tailwind 4.** Each template lives in `src/templates/<name>/`, with its
  own component, CSS and assets.
- **Opening films** are the owner's AI-generated videos (H.264, 720×1280) in `public/film/<template>/`,
  played by the shared player `src/templates/film/Film.tsx`.
  - The player plays each film at 1.35×, times the opening sounds to it, and then melts it into the live
    page laid exactly beneath its last frame.
  - If a phone cannot play the film, a drawn or still opening takes over.
- **Photos and flowers** are prepared ahead of time. The flower pictures are laid on each template's paper
  colour, so no phone shows white boxes around them.
- **Music** is in `public/music/`, one track per template.
- **The showcase** (`src/showcase/`) is a gallery of the templates. `npm run build:showcase` bundles it
  into one self-contained HTML file (about 15 MB) with the code, fonts links, pictures, music and films
  inside, so it can be hosted anywhere.

Design notes for each template:

- [`DESIGN.md`](DESIGN.md): Atlas lenta, and the shared showcase shell.
- [`docs/gulzor-design.md`](docs/gulzor-design.md): Gulzor.
- [`docs/nafosat-design.md`](docs/nafosat-design.md): Nafosat.

Notes on the films:

- [`docs/opening-film.md`](docs/opening-film.md): how to prepare and encode a film.
- [`docs/gulzor-images.md`](docs/gulzor-images.md): the image and film prompts for Gulzor.

## Run and build

Requires **Node.js 22.13+**.

```bash
npm install
npm run build:showcase   # → dist/showcase/index.html (one file, open it in a browser)
npm run build:pages      # the same, also copied to docs/index.html
```

### Publishing

The live site is served by GitHub Pages from the `gh-pages` branch, which holds only `index.html` and
`.nojekyll`. To publish a change:

1. Run `npm run build:pages`.
2. Copy `dist/showcase/index.html` to the root of `gh-pages`.
3. Push `gh-pages`. Pages updates within a minute or two.

### Netlify

`netlify.toml` builds the showcase (`npm run build:showcase`, Node 22) and publishes `dist/showcase`, so
connecting the repository to Netlify needs no settings. The root `index.html` is the earlier app's
development entry, so publishing the root, or running `npm run build`, gives a blank page.

### Adding a template

1. Create `src/templates/<name>/` with its invitation component.
2. Put its film in `public/film/<name>/` (`opening.mp4`, `opening.jpg`, `opening.json`) and its song in
   `public/music/`.
3. List the template in `src/showcase/Showcase.tsx`, and the song in `scripts/build-showcase.mjs`.

## The ordering app (earlier version)

The repository also holds the first version of the product. It is a full Express app with its own six
SVG-drawn templates:

- `/yaratish`: an invitation builder;
- `/buyurtma/:id`: order and payment pages;
- `/i/:slug`: guest invitation pages with RSVPs;
- `/admin`: an admin panel, on SQLite.

It lives in `server/`, `src/pages/` and `src/components/`. It is not used by the showcase above.

```bash
npm run dev          # http://localhost:3000 (admin password "admin" in development)
npm run build && npm start
```

Production needs `ADMIN_PASSWORD` and `SESSION_SECRET`, and optionally `APP_URL`, `DATA_DIR`, `PORT`,
`TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` (see `.env.example`).
