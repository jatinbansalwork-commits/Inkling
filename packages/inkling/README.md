# @jatin_ux/inkling

The font engine behind [Inkling](https://github.com/jatinbansalwork-commits/Inkling): turn hand-drawn strokes into installable OTF and WOFF fonts, entirely in the browser.

## Install

```bash
npm install @jatin_ux/inkling
```

No dependencies to add; `opentype.js` is bundled in. Works in modern browsers and Node 18+.

## How glyphs are described

Each character is a list of strokes, and each stroke is a list of `[x, y]` points in font units. The drawing box runs from `BOX_BOTTOM` (-300) to `BOX_TOP` (1000) vertically and is `BOX_WIDTH` (940) wide. The baseline is `y = 0`, lowercase letters reach `X_HEIGHT` (480) and capitals reach `CAP_HEIGHT` (700). Strokes are traced with a round pen, so a single line becomes a solid letter.

```ts
import type { GlyphMap } from "@jatin_ux/inkling";

const glyphs: GlyphMap = {
  l: [[[100, 0], [100, 700]]],
  o: [[[100, 0], [400, 0], [400, 480], [100, 480], [100, 0]]],
};
```

Draw the accent marks (`MARKS`) and accented letters such as é and ñ are composed for you.

## Build a font

```ts
import { buildFontBuffer, otfToWoff } from "@jatin_ux/inkling";

const otf = buildFontBuffer("My Hand", glyphs, "regular"); // ArrayBuffer
const woff = await otfToWoff(otf);
```

Use `"bold"` for a heavier pen. Pass settings as the fourth argument to change pen size, side bearing or word spacing:

```ts
buildFontBuffer("My Hand", glyphs, "regular", { sideBearing: 60, wordSpace: 400 });
```

## Download a ready-made package

In the browser, this downloads a zip with Regular and Bold in OTF and WOFF, plus a readme:

```ts
import { downloadFontPackage } from "@jatin_ux/inkling";

await downloadFontPackage("My Hand", glyphs);
```

Use `buildFontPackage` instead to get the zip as a `Blob` along with the file list and sizes.

## License

MIT
