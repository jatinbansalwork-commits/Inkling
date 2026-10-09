# @jatin_ux/inkling

Turn hand-drawn strokes into installable OTF and WOFF fonts, entirely in the browser. This is the
font engine behind [Inkling](https://jatinbansal.vercel.app/inkling).

[![npm](https://img.shields.io/npm/v/@jatin_ux/inkling)](https://www.npmjs.com/package/@jatin_ux/inkling)
[![license](https://img.shields.io/npm/l/@jatin_ux/inkling)](LICENSE)

- Strokes in, real fonts out: OTF for desktop apps, WOFF for the web
- Regular and Bold weights from the same drawing
- Accented letters (é, ñ, ü…) composed automatically
- Zero dependencies to install; works in modern browsers and Node 18+
- Fully typed

## Install

```bash
npm install @jatin_ux/inkling
# or
pnpm add @jatin_ux/inkling
# or
yarn add @jatin_ux/inkling
```

`opentype.js` is bundled in, so there's nothing else to add.

## Quick start

```ts
import { downloadFontPackage, type GlyphMap } from "@jatin_ux/inkling";

const glyphs: GlyphMap = {
  l: [[[100, 0], [100, 700]]],
  o: [[[100, 0], [400, 0], [400, 480], [100, 480], [100, 0]]],
};

// Browser only: downloads a zip with Regular + Bold, OTF + WOFF, and a readme.
await downloadFontPackage("My Hand", glyphs);
```

## How glyphs are described

Each character maps to a list of strokes, and each stroke is a list of `[x, y]` points in font units.
Strokes are traced with a round pen, so a single line becomes a solid letter.

| Constant     | Value | Meaning                                  |
| ------------ | ----- | ---------------------------------------- |
| `BOX_TOP`    | 1000  | Top of the drawing box                   |
| `BOX_BOTTOM` | -300  | Bottom of the drawing box (descenders)   |
| `BOX_WIDTH`  | 940   | Width of the drawing box                 |
| baseline     | 0     | Where letters sit                        |
| `X_HEIGHT`   | 480   | Top of lowercase letters like x          |
| `CAP_HEIGHT` | 700   | Top of capitals                          |

Draw the accent marks in `MARKS` (grave, acute, circumflex, tilde, diaeresis, ring, cedilla) and the
accented letters in `ACCENT_COMPOSITES` are built for you. `CHARSET` lists every drawable glyph and
`CHARACTER_GROUPS` splits them into uppercase, lowercase, numbers and symbols.

### Capturing strokes from a canvas

Pointer coordinates run top-down, while font units run bottom-up, so flip the y axis when you record:

```ts
import { BOX_BOTTOM, BOX_HEIGHT, BOX_WIDTH, simplifyStroke, type Stroke } from "@jatin_ux/inkling";

function toFontUnits(x: number, y: number, canvas: HTMLCanvasElement): [number, number] {
  const fx = (x / canvas.width) * BOX_WIDTH;
  const fy = BOX_BOTTOM + BOX_HEIGHT - (y / canvas.height) * BOX_HEIGHT;
  return [fx, fy];
}

const stroke: Stroke = recordedPoints.map(([x, y]) => toFontUnits(x, y, canvas));
const clean = simplifyStroke(stroke, 4); // drop jitter before saving
```

## Build a font

```ts
import { buildFontBuffer, otfToWoff } from "@jatin_ux/inkling";

const otf = buildFontBuffer("My Hand", glyphs, "regular"); // ArrayBuffer
const woff = await otfToWoff(otf);
```

Use `"bold"` for a heavier pen. Pass settings as the fourth argument:

```ts
buildFontBuffer("My Hand", glyphs, "regular", {
  sideBearing: 60, // space either side of each letter, 0–160
  wordSpace: 400, // width of a space, 120–600
  brush: { regular: 60, bold: 110 }, // pen diameter, 12–180
});
```

Defaults are in `DEFAULT_SETTINGS`; valid ranges are in `BRUSH_RANGE`, `SIDE_BEARING_RANGE` and
`WORD_SPACE_RANGE`.

### Preview a font before downloading

```ts
const otf = buildFontBuffer("Preview", glyphs, "regular");
const face = new FontFace("Preview", otf);
await face.load();
document.fonts.add(face);
element.style.fontFamily = "Preview";
```

### Save to disk in Node

```ts
import { writeFile } from "node:fs/promises";

await writeFile("MyHand-Regular.otf", Buffer.from(buildFontBuffer("My Hand", glyphs, "regular")));
```

## Package for download

| Function                                          | Returns                                                  |
| ------------------------------------------------- | -------------------------------------------------------- |
| `downloadFontPackage(name, glyphs, settings?)`    | Triggers a zip download in the browser                   |
| `buildFontPackage(name, glyphs, settings?)`       | The zip as a `Blob`, plus the file list and sizes        |
| `createZip(entries)` / `downloadBlob(blob, name)` | The zip and download helpers on their own                |

## API reference

| Export                                          | What it does                                                  |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `buildFontBuffer(name, glyphs, weight, settings?)` | Build an OTF as an `ArrayBuffer`                           |
| `otfToWoff(otf)`                                | Convert an OTF buffer to WOFF                                 |
| `expandGlyphs(glyphs)`                          | Add composed accented letters to a glyph map                  |
| `countDrawn(glyphs, among?)` / `isDrawn(glyphs, char)` | Track progress through the character set               |
| `fileSafeName(name)`                            | Turn a font name into a safe file name                        |
| `simplifyStroke(stroke, tolerance)`             | Remove redundant points from a stroke                         |
| `strokesBounds(strokes)` / `translateStrokes(strokes, dx, dy)` | Measure and move strokes                       |
| `outlineStrokes(sink, strokes, radius)`         | Trace strokes into outlines with a round pen                  |
| `resolveSettings(partial?)`                     | Fill in missing settings with defaults                        |
| Types: `GlyphMap`, `GlyphStrokes`, `Stroke`, `Point`, `Bounds`, `FontSettings`, `FontWeightName`, `PackageFile`, `ZipEntry` | |

## Browser and runtime support

Works in current Chrome, Edge, Firefox and Safari, and in Node 18+. `downloadFontPackage` and
`downloadBlob` need a browser; everything else runs anywhere.

## Troubleshooting

| Problem                               | Fix                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------- |
| Letters look upside down              | Flip the y axis when converting pointer coordinates (see above)             |
| Letters are tiny or huge              | Points must be in font units within the drawing box, not screen pixels      |
| Missing characters type as boxes      | Only drawn characters are included; check with `countDrawn`                 |
| Font won't install on Windows         | Use the `.otf` file; `.woff` is for websites                                |

## Support

- [Report a bug](https://github.com/jatinbansalwork-commits/Inkling/issues/new?template=bug_report.yml)
- [Request a feature](https://github.com/jatinbansalwork-commits/Inkling/issues/new?template=feature_request.yml)
- [Source code](https://github.com/jatinbansalwork-commits/Inkling)

## License

[MIT](LICENSE) © Jatin Bansal. Bundles opentype.js under the MIT license; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
