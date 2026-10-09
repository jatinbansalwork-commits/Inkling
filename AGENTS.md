# Agent guidelines

## Versioning (`packages/inkling`)

- `packages/inkling/package.json` `version` is always the **next** release, not the last
  published one.
- Every change that affects the npm package (font engine, exports, package docs) gets a line in
  `packages/inkling/CHANGELOG.md` under `## Unreleased (<version>)`, grouped as Added, Changed,
  Fixes or Docs. App-only changes don't need an entry.
- Don't bump the version for each change. Only bump when starting a new cycle after a release:
  patch for fixes and docs, minor for new exports or options, major for breaking changes.
- Never run `npm publish` from a local machine. Releases go through the tag workflow in
  `CONTRIBUTING.md`.

## Checks

Run `npm run lint && npm run build` at the root, and `npm run build` in `packages/inkling`, before
committing.
