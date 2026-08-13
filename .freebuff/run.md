# Run doc — Freebuff preview

This workspace is a GitHub profile README project: `README.md`, an `assets/`
directory of standalone SVG images (8 components x dark/light), a `ping-pong/`
manual game page, a `snake.svg`, and `.github/workflows/snake.yml`. There is
**no package.json and no dev server**; the Preview tab serves a static HTML
rendering of the README.

## Reproduce the preview artifact

Run from the workspace root:

```bash
node .freebuff/build-assets.js  # (re)generates assets/*-dark.svg + *-light.svg from palettes
node .freebuff/build-snake.js   # (re)generates snake.svg from live contribution data
node .freebuff/build-preview.js # renders .freebuff/preview.html from README.md
```

- `build-assets.js` generates all 16 assets from shared palettes (dark:
  `#0D1117/#00D4FF/#0077FF/#8B5CF6`; light: `#F8FAFC/#0369A1/#2563EB/#7C3AED`).
- `build-snake.js` fetches `https://github.com/users/Saxena-Ashu/contributions`
  and builds an animated contribution-snake SVG (`snake.svg` at the repo root,
  plus a copy in `.freebuff/`).
- `build-preview.js` converts `README.md` to HTML with full dark/light theme
  support (CSS variables + `prefers-color-scheme`). It inlines each local-asset
  `<picture>` block twice — `.theme-dark` / `.theme-light` — so the static page
  switches themes with the OS setting. No dependencies are installed; all
  scripts use only Node's built-in `fs`, `path`, and `https`.

Preview-only swaps in `build-preview.js` (GitHub cannot run these, so the
README keeps static versions):
- the snake `<picture>` is replaced by the local `snake.svg` inline;
- the ping-pong `<picture>` is replaced by `.freebuff/pong-game.html`, a
  playable canvas game (mouse / ↑↓ / W S, first to 7, max score in localStorage).

The real manual game lives at `ping-pong/` (`index.html`, `style.css`,
`game.js`) — player vs computer, W/S + arrows + mouse, start/pause/restart,
first to 7, dark/light via `prefers-color-scheme`. The README's PLAY button
points at the GitHub Pages URL for that folder.

## Run the preview

No server or port is needed. Register the generated file in static mode:

- `register_preview` with `htmlPath = D:\Work\Github\.freebuff\preview.html`

The app serves the file over loopback with no process to keep alive. Re-run
`build-preview.js` and reload the preview any time `README.md` or an
`assets/*.svg` file changes.

## Known state (as of last check)

- README is fully GitHub-compatible: zero raw `<svg>`, zero `<animate>`, zero
  scripts/iframes/canvas. All custom visuals are standalone assets switched
  via `<picture><source media="(prefers-color-scheme: ...)">`.
- Section order: About → Engineering Impact → Tech Stack → Engineering
  Capabilities → Technologies → Experience → Projects (TECHVOYM case study
  with architecture pipeline) → Education → Achievements → GitHub Activity
  → Ping Pong → Contact.
- Animation is intentionally minimal: title gradient + cursor, open-to-work
  pulse, divider sweep, metrics/capability fills on load, orbit rotation.
  Competencies and the TECHVOYM pipeline are static by design.
- External services: shields.io badges, readme-typing-svg,
  github-readme-activity-graph, komarev profile views, capsule-render.
  github-readme-stats cards remain disabled while that service is down (503).
- The contribution-snake image 404s until the `Generate Snake` workflow runs
  once (creates the `output` branch); the uploaded `snake.svg` fallback renders
  until then.
- The ping-pong PLAY button only works after GitHub Pages is enabled for
  `Saxena-Ashu/Saxena-Ashu` (Settings → Pages → Deploy from branch → main/root).
