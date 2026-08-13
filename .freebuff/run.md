# Run doc — Freebuff preview

This workspace is a GitHub profile README project (`README.md` plus an
`assets/` directory of standalone SVG images and a `.github/workflows/snake.yml`).
There is **no package.json and no dev server**; the Preview tab serves a static
HTML rendering of the README.

## Reproduce the preview artifact

Run from the workspace root:

```bash
node .freebuff/build-snake.js   # (re)generates snake.svg from live contribution data
node .freebuff/build-preview.js # renders .freebuff/preview.html from README.md
```

`build-snake.js` fetches `https://github.com/users/Saxena-Ashu/contributions`
and builds an animated contribution-snake SVG (`snake.svg` at the repo root,
plus a copy in `.freebuff/`). `build-preview.js` converts `README.md` to
cyberpunk-themed HTML, preserving tables, code blocks, and external badge
images — and inlines every `./assets/*.svg` reference (plus the local snake
SVG) so the static page renders them without a server. No dependencies are
installed; both scripts use only Node's built-in `fs`, `path`, and `https`.

The `assets/*.svg` files are committed source — the same files the README
references on GitHub via `<img src="./assets/...">`.

Two preview-only swaps in `build-preview.js` (GitHub cannot run these, so the
README keeps static/auto versions):
- the snake `<picture>` is replaced by the local `snake.svg` inline;
- the auto-rally ping pong asset is replaced by `.freebuff/pong-game.html`, a
  fully playable canvas game (mouse / ↑↓ / W S, first to 7 points, max score
  captured in localStorage, PNG capture button).

## Run the preview

No server or port is needed. Register the generated file in static mode:

- `register_preview` with `htmlPath = D:\Work\Github\.freebuff\preview.html`

The app serves the file over loopback with no process to keep alive. Re-run
`build-preview.js` and reload the preview any time `README.md` or an
`assets/*.svg` file changes.

## Known state (as of last check)

- The README is fully GitHub-compatible: zero raw `<svg>`, zero `<animate>`,
  zero scripts/iframes/canvas. All custom visuals live in `assets/` and are
  referenced as images (SMIL animation runs inside those standalone files —
  same mechanism as the contribution snake).
- External services used: shields.io badges, readme-typing-svg,
  github-readme-activity-graph, komarev profile views. The github-readme-stats
  cards remain disabled while that service is down (HTTP 503).
- The contribution-snake image 404s until the `Generate Snake` GitHub Actions
  workflow is run once on `Saxena-Ashu/Saxena-Ashu` (creates the `output`
  branch). Until then the uploaded `snake.svg` fallback renders.
