"use client";

import { useCallback, useEffect, useRef } from "react";
import type { GlyphStrokes, Point, Stroke } from "@/lib/scrawl/geometry";
import { BOX_HEIGHT, BOX_TOP, BOX_WIDTH, GUIDE_LINES, PEN_RADIUS } from "@/lib/scrawl/metrics";

const INK = "#111111";

export const GUIDE_FACES = [
  { id: "sans", label: "IBM Plex Sans", family: "var(--font-scrawl-body), Helvetica, Arial, sans-serif" },
  { id: "hand", label: "Shadows Into Light Two", family: "var(--font-scrawl-hand), cursive" },
  { id: "serif", label: "Georgia", family: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Geist Mono", family: "var(--font-scrawl-mono), ui-monospace, monospace" },
] as const;

export type GuideFaceId = (typeof GUIDE_FACES)[number]["id"];
export type PadTool = "draw" | "erase";
export function drawStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: GlyphStrokes,
  width: number,
  height: number,
  radius: number = PEN_RADIUS.regular,
) {
  const sx = width / BOX_WIDTH;
  const sy = height / BOX_HEIGHT;
  const toPx = ([x, y]: Point): Point => [x * sx, (BOX_TOP - y) * sy];

  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = radius * 2 * sx;

  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    const points = stroke.map(toPx);
    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0][0], points[0][1], radius * sx, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length - 1; i++) {
      const mx = (points[i][0] + points[i + 1][0]) / 2;
      const my = (points[i][1] + points[i + 1][1]) / 2;
      ctx.quadraticCurveTo(points[i][0], points[i][1], mx, my);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
  }
}

function distanceToSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function strokeHit(stroke: Stroke, point: Point, reach: number) {
  if (stroke.length === 1) return Math.hypot(point[0] - stroke[0][0], point[1] - stroke[0][1]) <= reach;
  for (let i = 1; i < stroke.length; i++) {
    if (distanceToSegment(point, stroke[i - 1], stroke[i]) <= reach) return true;
  }
  return false;
}

interface GlyphPadProps {
  char: string;
  strokes: GlyphStrokes;
  onChange: (strokes: GlyphStrokes) => void;
  radius?: number;
  tool?: PadTool;
  guideFace?: GuideFaceId;
  showGhost?: boolean;
  showLabels?: boolean;
  /** Fill the parent box, keeping the em-box proportions. Otherwise take the full width. */
  fit?: boolean;
}

/** One em box: guide lines and a ghost letter underneath, ink on a canvas on top. */
export function GlyphPad({
  char,
  strokes,
  onChange,
  radius = PEN_RADIUS.regular,
  tool = "draw",
  guideFace = "sans",
  showGhost = true,
  showLabels = true,
  fit = false,
}: GlyphPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<Stroke | null>(null);
  const erasingRef = useRef(false);
  const penSeenRef = useRef(false);
  const strokesRef = useRef(strokes);
  const radiusRef = useRef(radius);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const live = liveRef.current;
    drawStrokes(ctx, live ? [...strokesRef.current, live] : strokesRef.current, width, height, radiusRef.current);
  }, []);

  useEffect(() => {
    strokesRef.current = strokes;
    radiusRef.current = radius;
    redraw();
  }, [strokes, radius, redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [redraw]);

  const toFontUnits = (event: PointerEvent | React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * BOX_WIDTH;
    const y = BOX_TOP - ((event.clientY - rect.top) / rect.height) * BOX_HEIGHT;
    return [Math.round(x), Math.round(y)];
  };

  const eraseAt = (point: Point) => {
    const reach = radiusRef.current + 24;
    const kept = strokesRef.current.filter((stroke) => !strokeHit(stroke, point, reach));
    if (kept.length !== strokesRef.current.length) {
      strokesRef.current = kept;
      onChange(kept);
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    // Once a stylus shows up, fingers are treated as a resting palm. Phones without one still draw by touch.
    if (event.pointerType === "pen") penSeenRef.current = true;
    else if (event.pointerType === "touch" && penSeenRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (tool === "erase") {
      erasingRef.current = true;
      eraseAt(toFontUnits(event));
      return;
    }
    liveRef.current = [toFontUnits(event)];
    redraw();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (erasingRef.current) {
      eraseAt(toFontUnits(event));
      return;
    }
    const live = liveRef.current;
    if (!live) return;
    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [];
    const samples = coalesced.length > 0 ? coalesced : [event.nativeEvent];
    for (const sample of samples) {
      const point = toFontUnits(sample);
      const prev = live[live.length - 1];
      if (Math.hypot(point[0] - prev[0], point[1] - prev[1]) >= 3) live.push(point);
    }
    redraw();
  };

  const finish = () => {
    erasingRef.current = false;
    const live = liveRef.current;
    if (!live) return;
    liveRef.current = null;
    onChange([...strokesRef.current, live]);
  };

  const face = GUIDE_FACES.find((option) => option.id === guideFace) ?? GUIDE_FACES[0];

  const box = (
    <div
      className="relative border border-sc-rule bg-sc-paper select-none"
      style={
        fit
          ? { width: `min(100cqw, calc(100cqh * ${BOX_WIDTH} / ${BOX_HEIGHT}))`, aspectRatio: `${BOX_WIDTH} / ${BOX_HEIGHT}` }
          : { width: "100%", aspectRatio: `${BOX_WIDTH} / ${BOX_HEIGHT}` }
      }
    >
      <svg viewBox={`0 0 ${BOX_WIDTH} ${BOX_HEIGHT}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        {showGhost ? (
          <text x={BOX_WIDTH / 2} y={BOX_TOP} textAnchor="middle" fill="#ebebeb" fontSize={1000} style={{ fontFamily: face.family }}>
            {char}
          </text>
        ) : null}
        {GUIDE_LINES.map((line) => (
          <line
            key={line.id}
            x1={0}
            x2={BOX_WIDTH}
            y1={BOX_TOP - line.y}
            y2={BOX_TOP - line.y}
            stroke={line.id === "base" ? "#d4d4d4" : "#e6e6e6"}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {showLabels
        ? GUIDE_LINES.map((line) => (
            <span
              key={line.id}
              aria-hidden
              className="pointer-events-none absolute left-1 -translate-y-full pb-px text-[7px] leading-none tracking-[0.12em] text-sc-muted sm:text-[8px]"
              style={{ top: `${((BOX_TOP - line.y) / BOX_HEIGHT) * 100}%` }}
            >
              {line.label}
            </span>
          ))
        : null}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Drawing area for ${char}. Draw with a pen, mouse or finger.`}
        className={`absolute inset-0 size-full touch-none ${tool === "erase" ? "cursor-cell" : "cursor-crosshair"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={finish}
      />
    </div>
  );

  if (!fit) return box;
  return <div className="flex size-full items-center justify-center [container-type:size]">{box}</div>;
}
