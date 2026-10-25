/**
 * Builds the examples-only showcase as ONE self-contained HTML file:
 * JS, CSS and the example's music are inlined, so it can be hosted anywhere
 * (or published as a claude.ai Artifact) without other files.
 *
 * Output: dist/showcase/taklifnoma-namunalari.html
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

execSync("npx vite build --config vite.showcase.config.ts", { stdio: "inherit" });

const dir = "dist/showcase";
const html = fs.readFileSync(path.join(dir, "showcase.html"), "utf8");
const read = (p) => fs.readFileSync(path.join(dir, p.replace(/^\.\//, "")), "utf8");
const safeScript = (js) => js.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--");

const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => read(m[1])).join("\n");
const js = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => read(m[1])).join("\n");

const music = Object.fromEntries(
  ["toylar", "nashid", "nafosat", "ahd"].map((id) => [id, `data:audio/mpeg;base64,${fs.readFileSync(`public/music/${id}.mp3`).toString("base64")}`]),
);

// Each template's opening film, when one has been prepared in public/film/<template>/: opening.mp4 (H.264),
// its first frame opening.jpg, and opening.json (see docs/opening-film.md).
const filmRoot = "public/film";
const films = Object.fromEntries(
  fs
    .readdirSync(filmRoot)
    .filter((id) => fs.existsSync(`${filmRoot}/${id}/opening.mp4`))
    .map((id) => {
      const dir = `${filmRoot}/${id}`;
      return [
        id,
        {
          src: `data:video/mp4;base64,${fs.readFileSync(`${dir}/opening.mp4`).toString("base64")}`,
          poster: `data:image/jpeg;base64,${fs.readFileSync(`${dir}/opening.jpg`).toString("base64")}`,
          ...JSON.parse(fs.readFileSync(`${dir}/opening.json`, "utf8")),
        },
      ];
    }),
);

// A page fragment: the host wraps it in <!doctype html><head>…<body>.
const page = `<title>Taklifnoma namunalari</title>
<meta name="description" content="Qo‘lda ochiladigan premium to‘y taklifnomalari namunalari." />
<meta name="theme-color" content="#f8f5ef" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600&family=Corinthia:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Great+Vibes&family=Pinyon+Script&family=Montserrat:wght@400;500;600&family=Ms+Madi&family=Nothing+You+Could+Do&family=Crimson+Pro:ital,wght@0,400;0,500;1,400&family=Manrope:wght@400;500;600;700&display=swap" />
<style>
${css}
html, body { background: #f8f5ef; color: #141414; }
</style>
<div id="root"></div>
<script>window.__VISOL_MUSIC__ = ${JSON.stringify(music)}; window.__VISOL_FILMS__ = ${JSON.stringify(films)};</script>
<script type="module">
${safeScript(js)}
</script>
`;

const out = path.join(dir, "taklifnoma-namunalari.html");
fs.writeFileSync(out, page);
// Standalone version with a full document shell, for hosting on any static server.
fs.writeFileSync(
  path.join(dir, "index.html"),
  `<!doctype html>\n<html lang="uz">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />\n${page.replace('<div id="root">', '</head>\n<body>\n<div id="root">')}</body>\n</html>\n`,
);
console.log(`\n${out}: ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
