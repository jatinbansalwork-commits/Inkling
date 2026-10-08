export type Point = [number, number];
export type Stroke = Point[];
export type GlyphStrokes = Stroke[];

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function perpendicularDistance(point: Point, start: Point, end: Point): number {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  return Math.abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0]) / length;
}

/** Ramer–Douglas–Peucker, iterative so long strokes can't blow the stack. */
export function simplifyStroke(stroke: Stroke, tolerance: number): Stroke {
  if (stroke.length < 3) return stroke;
  const keep = new Uint8Array(stroke.length);
  keep[0] = 1;
  keep[stroke.length - 1] = 1;
  const stack: [number, number][] = [[0, stroke.length - 1]];

  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    let maxDistance = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const distance = perpendicularDistance(stroke[i], stroke[first], stroke[last]);
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }
    if (index !== -1 && maxDistance > tolerance) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return stroke.filter((_, i) => keep[i] === 1);
}

export function strokesBounds(strokes: GlyphStrokes): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of strokes) {
    for (const [x, y] of stroke) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

export function translateStrokes(strokes: GlyphStrokes, dx: number, dy: number): GlyphStrokes {
  return strokes.map((stroke) => stroke.map(([x, y]) => [x + dx, y + dy] as Point));
}

/** Contour sinks shared by the font path and the canvas renderer. */
export interface OutlineSink {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
  close(): void;
}

const KAPPA = 0.5522847498;

/** Counter-clockwise (y up) so every contour winds the same way and overlaps union cleanly. */
function circle(sink: OutlineSink, cx: number, cy: number, r: number) {
  const k = r * KAPPA;
  sink.moveTo(cx + r, cy);
  sink.curveTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r);
  sink.curveTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy);
  sink.curveTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r);
  sink.curveTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy);
  sink.close();
}

function segment(sink: OutlineSink, a: Point, b: Point, r: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy);
  if (length < 0.5) return;
  const nx = (-dy / length) * r;
  const ny = (dx / length) * r;
  sink.moveTo(a[0] - nx, a[1] - ny);
  sink.lineTo(b[0] - nx, b[1] - ny);
  sink.lineTo(b[0] + nx, b[1] + ny);
  sink.lineTo(a[0] + nx, a[1] + ny);
  sink.close();
}

/**
 * A round pen dragged along each stroke: a disc at every vertex plus a band
 * between neighbours. Nonzero winding fills the union, so no boolean ops needed.
 */
export function outlineStrokes(sink: OutlineSink, strokes: GlyphStrokes, radius: number) {
  for (const raw of strokes) {
    const stroke = simplifyStroke(raw, 2.5);
    stroke.forEach((point, i) => {
      circle(sink, point[0], point[1], radius);
      if (i > 0) segment(sink, stroke[i - 1], point, radius);
    });
  }
}
