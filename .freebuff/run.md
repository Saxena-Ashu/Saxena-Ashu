# Run doc — Freebuff preview

This workspace is a GitHub profile README project (`README.md` only, plus a
`.github/workflows/snake.yml`). There is **no package.json and no dev server**;
the Preview tab serves a static HTML rendering of the README.

## Reproduce the preview artifact

Run from the workspace root:

```bash
node .freebuff/build-snake.js   # (re)generates snake.svg from live contribution data
node .freebuff/build-preview.js # renders .freebuff/preview.html from README.md
```

`build-snake.js` fetches `https://github.com/users/Saxena-Ashu/contributions`
and builds an animated contribution-snake SVG (`snake.svg` at the repo root,
plus a copy in `.freebuff/`). `build-preview.js` converts `README.md` to
GitHub-dark themed HTML, preserving all inline SVG/SMIL animations, tables,
code blocks, and external badge images — and inlines the local snake SVG into
the preview. No dependencies are installed; both scripts use only Node's
built-in `fs`, `path`, and `https`.

Two preview-only swaps in `build-preview.js` (GitHub cannot run these, so the
README keeps static/auto versions):
- the snake `<picture>` is replaced by the local `snake.svg` inline;
- the auto-rally ping pong SVG is replaced by `.freebuff/pong-game.html`, a
  fully playable canvas game (mouse / ↑↓ / W S, first to 7 points, max score
  captured in localStorage, PNG capture button).

## Run the preview

No server or port is needed. Register the generated file in static mode:

- `register_preview` with `htmlPath = D:\Work\Github\.freebuff\preview.html`

The app serves the file over loopback with no process to keep alive. Re-run
`build-preview.js` and reload the preview any time `README.md` changes.

## Known state (as of last check)

- All external image services load (shields.io badges, readme-typing-svg,
  capsule-render, github-readme-activity-graph, komarev profile views).
- The contribution-snake image 404s until the `Generate Snake` GitHub Actions
  workflow is run once on `Saxena-Ashu/Saxena-Ashu` (creates the `output`
  branch). This is expected, not a preview defect.
