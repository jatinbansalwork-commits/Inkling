# Contributing to Inkling

Thanks for helping out. Bug reports, ideas and pull requests are all welcome.

## Reporting a bug

[Open a bug report](https://github.com/jatinbansalwork-commits/Inkling/issues/new?template=bug_report.yml)
and include:

- What you were doing (drawing, reviewing, exporting, animating a signature)
- What you expected and what happened
- Browser and OS, and where you installed the font if it's an install problem
- If you can, the exported font file or a screenshot

## Suggesting a feature

[Request a feature](https://github.com/jatinbansalwork-commits/Inkling/issues/new?template=feature_request.yml).
Describe what you're trying to make before the feature you have in mind.

## Working on the code

```bash
git clone https://github.com/jatinbansalwork-commits/Inkling.git
cd Inkling
npm install
npm run dev          # app at http://localhost:3000/inkling
```

The font engine lives in `src/lib/scrawl/` and the UI in `src/components/scrawl/`. The npm package in
`packages/inkling/` builds from the same engine source.

To check the package build:

```bash
cd packages/inkling
npm install
npm run build
```

Before opening a pull request:

1. Run `npm run lint` and `npm run build` at the repo root.
2. If you touched the font engine, export a font and install it on at least one OS to check it.
3. Keep the pull request focused on one change and describe what it does and why.

## Releasing (maintainers)

1. Bump `version` in `packages/inkling/package.json`.
2. From `packages/inkling`, run `npm publish --access public`.
3. Tag the release: `git tag inkling@<version> && git push --tags`.
