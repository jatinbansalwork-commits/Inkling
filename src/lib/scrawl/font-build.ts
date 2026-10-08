import { Font, Glyph, Path } from "opentype.js";
import {
  outlineStrokes,
  strokesBounds,
  translateStrokes,
  type GlyphStrokes,
} from "@/lib/scrawl/geometry";
import {
  ACCENT_COMPOSITES,
  CAP_HEIGHT,
  FONT_ASCENDER,
  FONT_DESCENDER,
  resolveSettings,
  UNITS_PER_EM,
  X_HEIGHT,
  type FontSettings,
  type FontWeightName,
} from "@/lib/scrawl/metrics";

export type GlyphMap = Record<string, GlyphStrokes>;

const MARK_GAP = 70;
const DOT_MAX_SIZE = 110;

function hasInk(strokes: GlyphStrokes | undefined): strokes is GlyphStrokes {
  return Boolean(strokes && strokes.some((stroke) => stroke.length > 0));
}

/** The tittle on i/j would collide with an accent, so small strokes above the x-height go. */
function withoutDots(strokes: GlyphStrokes): GlyphStrokes {
  const kept = strokes.filter((stroke) => {
    const bounds = strokesBounds([stroke]);
    if (!bounds) return false;
    const size = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    return !(size < DOT_MAX_SIZE && bounds.minY > X_HEIGHT * 0.85);
  });
  return kept.length > 0 ? kept : strokes;
}

function composeAccent(base: GlyphStrokes, mark: GlyphStrokes, below: boolean, upper: boolean) {
  const cleanBase = below ? base : withoutDots(base);
  const baseBounds = strokesBounds(cleanBase);
  const markBounds = strokesBounds(mark);
  if (!baseBounds || !markBounds) return cleanBase;

  const dx = (baseBounds.minX + baseBounds.maxX) / 2 - (markBounds.minX + markBounds.maxX) / 2;
  const dy = below
    ? -MARK_GAP / 2 - markBounds.maxY
    : Math.max(upper ? CAP_HEIGHT : X_HEIGHT, baseBounds.maxY) + MARK_GAP - markBounds.minY;
  return [...cleanBase, ...translateStrokes(mark, dx, dy)];
}

/** Drawn glyphs plus every accented letter whose base and mark are both drawn. */
export function expandGlyphs(glyphs: GlyphMap): GlyphMap {
  const expanded: GlyphMap = {};
  for (const [char, strokes] of Object.entries(glyphs)) {
    if (hasInk(strokes)) expanded[char] = strokes;
  }
  for (const { char, base, mark, below } of ACCENT_COMPOSITES) {
    const baseStrokes = expanded[base];
    const markStrokes = expanded[mark];
    if (!baseStrokes || !markStrokes || expanded[char]) continue;
    expanded[char] = composeAccent(baseStrokes, markStrokes, below, base !== base.toLowerCase());
  }
  return expanded;
}

function glyphName(char: string): string {
  const code = char.codePointAt(0)!;
  return `uni${code.toString(16).toUpperCase().padStart(4, "0")}`;
}

function buildGlyph(char: string, strokes: GlyphStrokes, radius: number, sideBearing: number): Glyph {
  const bounds = strokesBounds(strokes)!;
  const shiftX = sideBearing + radius - bounds.minX;
  const path = new Path();
  outlineStrokes(path, translateStrokes(strokes, shiftX, 0), radius);
  return new Glyph({
    name: glyphName(char),
    unicode: char.codePointAt(0)!,
    advanceWidth: Math.round(bounds.maxX - bounds.minX + 2 * (radius + sideBearing)),
    path,
  });
}

export function buildFontBuffer(
  name: string,
  glyphs: GlyphMap,
  weight: FontWeightName,
  settings?: Partial<FontSettings>,
): ArrayBuffer {
  const { brush, sideBearing, wordSpace } = resolveSettings(settings);
  const radius = brush[weight] / 2;
  const fontGlyphs: Glyph[] = [
    new Glyph({ name: ".notdef", advanceWidth: 500, path: new Path() }),
    new Glyph({ name: "space", unicode: 32, advanceWidth: wordSpace, path: new Path() }),
  ];

  for (const [char, strokes] of Object.entries(expandGlyphs(glyphs))) {
    if (char === " ") continue;
    fontGlyphs.push(buildGlyph(char, strokes, radius, sideBearing));
  }

  const font = new Font({
    familyName: name.trim() || "Untitled Hand",
    styleName: weight === "bold" ? "Bold" : "Regular",
    unitsPerEm: UNITS_PER_EM,
    ascender: FONT_ASCENDER,
    descender: FONT_DESCENDER,
    weightClass: weight === "bold" ? 700 : 400,
    glyphs: fontGlyphs,
    designer: name.trim() || "Untitled Hand",
    version: "Version 1.0",
  });
  return font.toArrayBuffer();
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const align4 = (n: number) => (n + 3) & ~3;

/** WOFF 1.0: the same sfnt tables, each zlib-compressed when that makes it smaller. */
export async function otfToWoff(otf: ArrayBuffer): Promise<ArrayBuffer> {
  const view = new DataView(otf);
  const bytes = new Uint8Array(otf);
  const sfntVersion = view.getUint32(0);
  const numTables = view.getUint16(4);

  const tables = await Promise.all(
    Array.from({ length: numTables }, async (_, i) => {
      const record = 12 + i * 16;
      const offset = view.getUint32(record + 8);
      const length = view.getUint32(record + 12);
      const original = bytes.subarray(offset, offset + length);
      const compressed = await deflate(original);
      return {
        tag: view.getUint32(record),
        checksum: view.getUint32(record + 4),
        origLength: length,
        data: compressed.length < length ? compressed : original,
      };
    }),
  );

  const headerSize = 44 + numTables * 20;
  const totalLength = tables.reduce((sum, table) => sum + align4(table.data.length), headerSize);
  const totalSfntSize = tables.reduce((sum, table) => sum + align4(table.origLength), 12 + numTables * 16);

  const out = new Uint8Array(totalLength);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, 0x774f4646);
  outView.setUint32(4, sfntVersion);
  outView.setUint32(8, totalLength);
  outView.setUint16(12, numTables);
  outView.setUint32(16, totalSfntSize);
  outView.setUint16(20, 1);

  let offset = headerSize;
  tables.forEach((table, i) => {
    const entry = 44 + i * 20;
    outView.setUint32(entry, table.tag);
    outView.setUint32(entry + 4, offset);
    outView.setUint32(entry + 8, table.data.length);
    outView.setUint32(entry + 12, table.origLength);
    outView.setUint32(entry + 16, table.checksum);
    out.set(table.data, offset);
    offset += align4(table.data.length);
  });

  return out.buffer;
}

export function countDrawn(glyphs: GlyphMap, among?: readonly string[]): number {
  if (among) return among.filter((char) => hasInk(glyphs[char])).length;
  return Object.values(glyphs).filter(hasInk).length;
}

export function isDrawn(glyphs: GlyphMap, char: string): boolean {
  return hasInk(glyphs[char]);
}

export function fileSafeName(name: string): string {
  return (name.trim() || "Untitled Hand").replace(/[^\w-]+/g, "");
}
