import type { GlyphStrokes } from "@/lib/scrawl/geometry";
import { BOX_HEIGHT, BOX_TOP, BOX_WIDTH, PEN_RADIUS } from "@/lib/scrawl/metrics";

function toPoints(stroke: GlyphStrokes[number]): string {
  return stroke.map(([x, y]) => `${x},${BOX_TOP - y}`).join(" ");
}

interface GlyphThumbProps {
  strokes: GlyphStrokes;
  className?: string;
  radius?: number;
  viewBox?: string;
}

/** Static rendering of drawn strokes in the em box, for grids and cards. */
export function GlyphThumb({ strokes, className = "", radius = PEN_RADIUS.regular, viewBox }: GlyphThumbProps) {
  return (
    <svg viewBox={viewBox ?? `0 0 ${BOX_WIDTH} ${BOX_HEIGHT}`} className={className} aria-hidden>
      {strokes.map((stroke, i) =>
        stroke.length === 1 ? (
          <circle key={i} cx={stroke[0][0]} cy={BOX_TOP - stroke[0][1]} r={radius} fill="currentColor" />
        ) : (
          <polyline
            key={i}
            points={toPoints(stroke)}
            fill="none"
            stroke="currentColor"
            strokeWidth={radius * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
}
