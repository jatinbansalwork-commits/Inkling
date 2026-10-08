"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { WRITE_ON_MS, WRITE_ON_TIMELINE as TIMELINE, WRITE_ON_WORD } from "@/lib/scrawl/write-on-word";

/** Dash offsets on a `pathLength=1`, `2 3` dash: 3 hides the stroke, 1 shows all of it. */
const HIDDEN = 3;
const SHOWN = 1;

/** userSpaceOnUse masks default to a box measured from 0,0, which crops a viewBox that starts far above it. */
const MASK_BOX = (() => {
  const [x, y, width, height] = WRITE_ON_WORD.viewBox.split(" ").map(Number);
  return { x, y, width, height };
})();

const penEase = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

function offsetAt(time: number, { start, dur }: (typeof TIMELINE)[number]) {
  if (time >= start + dur) return SHOWN;
  if (time <= start) return HIDDEN;
  return 2 - penEase((time - start) / dur);
}

/** Writes “animate” stroke by stroke, in pen order, once it scrolls into view. */
export function WriteOnView({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const maskId = `wo${useId().replace(/[^A-Za-z0-9]/g, "")}`;

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const pens = Array.from(svg.querySelectorAll<SVGPathElement>("[data-pen]"));
    const last = pens.map(() => NaN);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const paint = (time: number) => {
      pens.forEach((pen, i) => {
        const offset = offsetAt(time, TIMELINE[i]);
        if (Math.abs(offset - last[i]) < 1e-4) return;
        last[i] = offset;
        pen.setAttribute("stroke-dashoffset", Number.isInteger(offset) ? String(offset) : offset.toFixed(4));
      });
    };

    let time = 0;
    let frame = 0;
    let then = 0;
    let started = false;
    let inView = false;

    const tick = (now: number) => {
      time = Math.min(WRITE_ON_MS, time + now - then);
      then = now;
      paint(time);
      frame = time < WRITE_ON_MS ? requestAnimationFrame(tick) : 0;
    };

    const sync = () => {
      const run = started && inView && !document.hidden && !reduce.matches && time < WRITE_ON_MS;
      if (run && !frame) {
        then = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const onReduceChange = () => {
      if (reduce.matches) paint((time = WRITE_ON_MS));
      sync();
    };

    paint(reduce.matches ? WRITE_ON_MS : 0);

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (inView) started = true;
        sync();
      },
      { threshold: 0.01 },
    );
    observer.observe(svg);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", onReduceChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", onReduceChange);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={WRITE_ON_WORD.viewBox}
      role="img"
      aria-label={WRITE_ON_WORD.text}
      className={className}
    >
      <defs>
        {WRITE_ON_WORD.glyphs.map((glyph, gi) => (
          <mask key={gi} id={`${maskId}-${gi}`} maskUnits="userSpaceOnUse" {...MASK_BOX}>
            {glyph.strokes.map((stroke, si) => (
              <path
                key={si}
                data-pen
                d={stroke.d}
                fill="none"
                stroke="#fff"
                strokeWidth={WRITE_ON_WORD.penWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="2 3"
                strokeDashoffset={SHOWN}
              />
            ))}
          </mask>
        ))}
      </defs>
      {WRITE_ON_WORD.glyphs.map((glyph, gi) => (
        <path key={gi} d={glyph.outline} fill="currentColor" mask={`url(#${maskId}-${gi})`} />
      ))}
    </svg>
  );
}
