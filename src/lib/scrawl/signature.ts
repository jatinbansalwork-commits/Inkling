import { simplifyStroke, type Point } from "@/lib/scrawl/geometry";

/** x, y in canvas units and t in ms since the first pen-down. */
export type TimedPoint = [number, number, number];
export type TimedStroke = TimedPoint[];

export const SIGNATURE_WIDTH = 1200;
export const SIGNATURE_HEIGHT = 450;

/** Long hesitations between strokes are trimmed so playback doesn't stall. */
const MAX_GAP_MS = 220;
const MIN_STROKE_MS = 60;

export interface AnimatedPath {
  d: string;
  delay: number;
  duration: number;
}

export interface SignatureAnimation {
  viewBox: string;
  paths: AnimatedPath[];
  total: number;
}

function pathData(points: Point[]): string {
  const r = (n: number) => Math.round(n * 10) / 10;
  if (points.length === 1) return `M${r(points[0][0])} ${r(points[0][1])}h0.1`;
  let d = `M${r(points[0][0])} ${r(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i][0] + points[i + 1][0]) / 2;
    const my = (points[i][1] + points[i + 1][1]) / 2;
    d += `Q${r(points[i][0])} ${r(points[i][1])} ${r(mx)} ${r(my)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${r(last[0])} ${r(last[1])}`;
}

export function buildSignatureAnimation(strokes: TimedStroke[], penWidth: number, speed = 1): SignatureAnimation | null {
  const inked = strokes.filter((stroke) => stroke.length > 0);
  if (inked.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of inked) {
    for (const [x, y] of stroke) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  const pad = penWidth * 2;
  const viewBox = [minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2]
    .map((n) => Math.round(n))
    .join(" ");

  let clock = 0;
  let previousEnd: number | null = null;
  const paths = inked.map((stroke) => {
    const start = stroke[0][2];
    const end = stroke[stroke.length - 1][2];
    if (previousEnd !== null) clock += Math.min(Math.max(start - previousEnd, 0), MAX_GAP_MS);
    previousEnd = end;
    const duration = Math.max(end - start, MIN_STROKE_MS);
    const path: AnimatedPath = {
      d: pathData(simplifyStroke(stroke.map(([x, y]) => [x, y] as Point), 0.8)),
      delay: clock / 1000 / speed,
      duration: duration / 1000 / speed,
    };
    clock += duration;
    return path;
  });

  return { viewBox, paths, total: clock / 1000 / speed };
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export function signatureSvg(animation: SignatureAnimation, colour: string, penWidth: number): string {
  const paths = animation.paths
    .map(
      (path) =>
        `  <path d="${path.d}" pathLength="1" style="animation-delay:${round(path.delay)}s;animation-duration:${round(path.duration)}s"/>`,
    )
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${animation.viewBox}" fill="none" stroke="${colour}" stroke-width="${penWidth}" stroke-linecap="round" stroke-linejoin="round">
  <style>path{stroke-dasharray:1 2;stroke-dashoffset:1.01;animation-name:write;animation-timing-function:linear;animation-fill-mode:forwards}@keyframes write{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){path{animation:none;stroke-dashoffset:0}}</style>
${paths}
</svg>
`;
}

export function signatureReactComponent(animation: SignatureAnimation, colour: string, penWidth: number): string {
  const strokes = animation.paths
    .map((path) => `  { d: "${path.d}", delay: ${round(path.delay)}, duration: ${round(path.duration)} },`)
    .join("\n");
  return `"use client";

import { useEffect, useRef, useState } from "react";

const STROKES = [
${strokes}
];

/** Writes itself the first time it scrolls into view. */
export function Signature({ color = "${colour}", width = ${penWidth}, className = "" }) {
  const ref = useRef(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlay(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="${animation.viewBox}"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Signature"
    >
      {STROKES.map((stroke, i) => (
        <path
          key={i}
          d={stroke.d}
          pathLength={1}
          strokeDasharray="1 2"
          strokeDashoffset={play ? 0 : 1.01}
          style={{ transition: \`stroke-dashoffset \${stroke.duration}s linear \${stroke.delay}s\` }}
        />
      ))}
    </svg>
  );
}
`;
}
