# Inkling

Turn your handwriting into a real font. Draw each letter once in the browser, review the result,
and download installable OTF and WOFF files you can use in Figma, Word, macOS, Windows or on the web.
Inkling also animates your signature as an SVG that writes itself.

**Try it:** [jatinbansal.vercel.app/inkling](https://jatinbansal.vercel.app/inkling)
**npm:** [`@jatin_ux/inkling`](https://www.npmjs.com/package/@jatin_ux/inkling), the font engine on its own

## Features

- **Make a font.** Draw uppercase, lowercase, numbers and punctuation on a guided grid. Accented
  letters such as é and ñ are composed automatically from the marks you draw.
- **Review and tune.** Preview your font live, then adjust pen weight, letter spacing and word spacing.
- **Export.** Download a zip with Regular and Bold in OTF (desktop apps) and WOFF (websites).
- **Animate a signature.** Write your name once and export it as a standalone SVG or a React
  component that draws itself, with no JavaScript needed for the SVG.
- **Private by default.** Everything runs in your browser. Fonts are saved to local storage and
  never uploaded.

## Install your font

| Where            | How                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------ |
| macOS            | Double-click the `.otf` file and choose **Install Font**                              |
| Windows          | Right-click the `.otf` file and choose **Install**                                   |
| Figma, Word etc. | Install on your computer first, then restart the app                                 |
| A website        | Use the `.woff` file with `@font-face` (see below)                                   |

```css
@font-face {
  font-family: "My Hand";
  src: url("/fonts/MyHand-Regular.woff") format("woff");
  font-weight: 400;
}
```

## Use the font engine in your own app

```bash
npm install @jatin_ux/inkling
```

```ts
import { downloadFontPackage, type GlyphMap } from "@jatin_ux/inkling";

const glyphs: GlyphMap = {
  l: [[[100, 0], [100, 700]]],
  o: [[[100, 0], [400, 0], [400, 480], [100, 480], [100, 0]]],
};

await downloadFontPackage("My Hand", glyphs);
```

See the [package README](packages/inkling/README.md) for the coordinate system, settings and the full API.

## Run the app locally

Requires Node 20 or later.

```bash
git clone https://github.com/jatinbansalwork-commits/Inkling.git
cd Inkling
npm install
npm run dev
```

Open [localhost:3000/inkling](http://localhost:3000/inkling).

| Script          | What it does               |
| --------------- | -------------------------- |
| `npm run dev`   | Start the app in dev mode  |
| `npm run build` | Production build           |
| `npm run lint`  | Lint with ESLint           |

## Project layout

```
src/app/inkling/          Routes: landing, make, my fonts, draw, review, export, animate
src/components/scrawl/    The drawing pad, workspace, export and signature studio
src/lib/scrawl/           Font engine: geometry, metrics, OTF/WOFF building, zip export
packages/inkling/         The published npm package (@jatin_ux/inkling)
```

## Help and feedback

- **Found a bug?** [Open a bug report](https://github.com/jatinbansalwork-commits/Inkling/issues/new?template=bug_report.yml).
- **Have an idea?** [Request a feature](https://github.com/jatinbansalwork-commits/Inkling/issues/new?template=feature_request.yml).
- **Want to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Jatin Bansal. Font files you create with Inkling are yours to use however you like.
