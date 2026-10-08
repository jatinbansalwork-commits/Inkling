"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AppHeader, PanelNote, PanelSection, RangeField } from "@/components/scrawl/app-chrome";
import { Icon } from "@/components/scrawl/scrawl-icons";
import { APP_BUTTON_OFF, APP_BUTTON_PLAIN, SCRAWL_ROUTES, segmentClass } from "@/components/scrawl/scrawl-chrome";
import {
  buildSignatureAnimation,
  SIGNATURE_HEIGHT,
  SIGNATURE_WIDTH,
  signatureReactComponent,
  signatureSvg,
  type TimedPoint,
  type TimedStroke,
} from "@/lib/scrawl/signature";
import { useHasHydrated } from "@/lib/scrawl/storage";
import { downloadBlob } from "@/lib/scrawl/zip";

const STORAGE_KEY = "scrawl:signature:v1";
const COLOURS = [
  { id: "graphite", label: "Graphite", value: "#111111" },
  { id: "blue", label: "Blue", value: "#0443b5" },
  { id: "slate", label: "Slate", value: "#7f96b5" },
] as const;
const SPEEDS = [0.5, 1, 2] as const;

type CopyTarget = "react" | "prompt" | null;

function loadSignature(): TimedStroke[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as TimedStroke[]) : [];
  } catch {
    return [];
  }
}

function agentPrompt(svg: string) {
  return [
    "Add this self-drawing signature to my site.",
    "It's a standalone SVG: each path writes itself with a CSS animation, no JavaScript needed.",
    "Inline it where the signature should appear, keep the viewBox, and size it with CSS width.",
    "Respect prefers-reduced-motion by showing the finished signature straight away.",
    "",
    svg,
  ].join("\n");
}

function StudioHeader() {
  return (
    <AppHeader
      title={<span className="text-[10px] text-sc-muted uppercase">Animate</span>}
      right={
        <>
          <Link href={SCRAWL_ROUTES.fonts} className="uppercase hover:text-sc-graphite">
            My fonts
          </Link>
          <Link href={SCRAWL_ROUTES.home} className="uppercase hover:text-sc-graphite">
            About
          </Link>
        </>
      }
    />
  );
}

export function AnimateStudio() {
  const hydrated = useHasHydrated();
  if (!hydrated) {
    return (
      <div className="flex h-dvh flex-col">
        <StudioHeader />
        <p className="p-6 text-[10px] text-sc-muted uppercase">Loading…</p>
      </div>
    );
  }
  return <Studio />;
}

function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<TimedStroke | null>(null);
  const clockRef = useRef<{ origin: number; offset: number } | null>(null);
  const [strokes, setStrokes] = useState<TimedStroke[]>(loadSignature);
  const [penWidth, setPenWidth] = useState(8);
  const [colour, setColour] = useState<string>(COLOURS[0].value);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [replayKey, setReplayKey] = useState(0);
  const [copied, setCopied] = useState<CopyTarget>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(strokes));
  }, [strokes]);

  const strokesRef = useRef(strokes);
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = width / SIGNATURE_WIDTH;
    ctx.strokeStyle = colour;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = penWidth * scale;
    const all = liveRef.current ? [...strokesRef.current, liveRef.current] : strokesRef.current;
    for (const stroke of all) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0][0] * scale, stroke[0][1] * scale);
      if (stroke.length === 1) ctx.lineTo(stroke[0][0] * scale + 0.1, stroke[0][1] * scale);
      for (const [x, y] of stroke.slice(1)) ctx.lineTo(x * scale, y * scale);
      ctx.stroke();
    }
  }, [colour, penWidth]);

  useEffect(() => {
    strokesRef.current = strokes;
    redraw();
  }, [strokes, redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [redraw]);

  const toPoint = (event: PointerEvent | React.PointerEvent): TimedPoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clock = clockRef.current!;
    return [
      Math.round(((event.clientX - rect.left) / rect.width) * SIGNATURE_WIDTH * 10) / 10,
      Math.round(((event.clientY - rect.top) / rect.height) * SIGNATURE_HEIGHT * 10) / 10,
      Math.round(event.timeStamp - clock.origin + clock.offset),
    ];
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const last = strokesRef.current.at(-1)?.at(-1);
    clockRef.current = { origin: event.timeStamp, offset: last ? last[2] + 1 : 0 };
    liveRef.current = [toPoint(event)];
    redraw();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const live = liveRef.current;
    if (!live) return;
    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const sample of coalesced.length > 0 ? coalesced : [event.nativeEvent]) {
      const point = toPoint(sample);
      const prev = live[live.length - 1];
      if (Math.hypot(point[0] - prev[0], point[1] - prev[1]) >= 2) live.push(point);
    }
    redraw();
  };

  const finish = () => {
    const live = liveRef.current;
    if (!live) return;
    liveRef.current = null;
    setStrokes((prev) => [...prev, live]);
    setReplayKey((key) => key + 1);
  };

  const animation = useMemo(() => buildSignatureAnimation(strokes, penWidth, speed), [strokes, penWidth, speed]);
  const svg = animation ? signatureSvg(animation, colour, penWidth) : "";
  const reactCode = animation ? signatureReactComponent(animation, colour, penWidth) : "";

  const copy = async (target: Exclude<CopyTarget, null>) => {
    await navigator.clipboard.writeText(target === "react" ? reactCode : agentPrompt(svg));
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="flex h-dvh flex-col bg-sc-paper select-none">
      <StudioHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row">
        <main id="main-content" className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          <section>
            <div className="flex items-baseline justify-between pb-2">
              <h1 className="text-[10px] tracking-[0.16em] text-sc-muted uppercase">Write something</h1>
              <div className="flex items-baseline gap-4 text-[10px] tracking-[0.16em] text-sc-muted uppercase">
                <button
                  type="button"
                  disabled={strokes.length === 0}
                  className="disabled:opacity-30 enabled:hover:text-sc-graphite"
                  onClick={() => setStrokes((prev) => prev.slice(0, -1))}
                >
                  Undo
                </button>
                <button type="button" disabled={strokes.length === 0} className="disabled:opacity-30 enabled:hover:text-sc-graphite" onClick={() => setStrokes([])}>
                  Clear
                </button>
              </div>
            </div>
            <div className="relative w-full border border-sc-rule bg-sc-paper" style={{ aspectRatio: `${SIGNATURE_WIDTH} / ${SIGNATURE_HEIGHT}` }}>
              <div aria-hidden className="pointer-events-none absolute inset-x-6 top-[68%] border-t border-dashed border-sc-rule" />
              <canvas
                ref={canvasRef}
                role="img"
                aria-label="Signature pad. Draw with a pen, mouse or finger."
                className="absolute inset-0 size-full cursor-crosshair touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={finish}
                onPointerCancel={finish}
                onLostPointerCapture={finish}
              />
            </div>
            <p className="pt-2 text-[11px] leading-[1.7] text-sc-muted">
              Draw with a mouse, a finger or a stylus. The pen’s timing is recorded, so the replay keeps your pauses.
            </p>
          </section>
          <section className="flex shrink-0 flex-col">
            <h2 className="pb-2 text-[10px] tracking-[0.16em] text-sc-muted uppercase">Replay</h2>
            <div className="flex h-[240px] items-center justify-center overflow-hidden border border-sc-rule p-6">
              {animation ? (
                <div
                  key={replayKey}
                  role="img"
                  aria-label="Your signature, writing itself"
                  className="size-full [&>svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <span className="text-[11px] text-sc-muted">Nothing drawn yet.</span>
              )}
            </div>
          </section>
        </main>

        <aside className="w-full shrink-0 border-sc-rule p-6 lg:w-[380px] lg:border-l">
          <PanelSection title="Ink" meta={COLOURS.find((option) => option.value === colour)?.label}>
            <div role="group" aria-label="Colour" className="flex gap-2 pt-3">
              {COLOURS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={colour === option.value}
                  onClick={() => setColour(option.value)}
                  className={`size-6 border p-[3px] pointer-coarse:size-[44px] ${colour === option.value ? "border-sc-graphite" : "border-sc-rule hover:border-sc-graphite"}`}
                >
                  <span className="block size-full" style={{ background: option.value }} />
                </button>
              ))}
            </div>
            <RangeField label="Width" value={penWidth} min={2} max={18} onChange={setPenWidth} />
          </PanelSection>
          <PanelSection title="Cadence" meta={animation ? `${animation.total.toFixed(1)}s` : "—"}>
            <div className="flex items-center justify-between gap-3 pt-3">
              <div role="group" aria-label="Playback speed" className="flex border border-sc-rule">
                {SPEEDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={speed === option}
                    className={segmentClass(speed === option, true)}
                    onClick={() => {
                      setSpeed(option);
                      setReplayKey((key) => key + 1);
                    }}
                  >
                    {option}×
                  </button>
                ))}
              </div>
              <button type="button" disabled={!animation} className={APP_BUTTON_PLAIN} onClick={() => setReplayKey((key) => key + 1)}>
                <Icon name="undo" />
                Replay
              </button>
            </div>
            <PanelNote>Long pauses are trimmed so a slow signature doesn’t sit still.</PanelNote>
          </PanelSection>
          <PanelSection title="Use it" meta={animation ? `${animation.paths.length} strokes` : "—"}>
            <p className="pt-3 text-[11px] leading-[1.7] text-sc-muted">
              Draw something and this fills in: an SVG that draws itself with no script at all, a React component that
              starts when it scrolls into view, or a prompt to hand a coding agent.
            </p>
            <div className="flex flex-wrap gap-2 pt-4">
              {animation ? (
                <>
                  <button
                    type="button"
                    className={APP_BUTTON_OFF}
                    onClick={() => downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "signature.svg")}
                  >
                    <Icon name="download" />
                    SVG
                  </button>
                  <button type="button" className={APP_BUTTON_OFF} onClick={() => copy("react")}>
                    {copied === "react" ? "Copied" : "Copy React"}
                  </button>
                  <button type="button" className={APP_BUTTON_OFF} onClick={() => copy("prompt")}>
                    {copied === "prompt" ? "Copied" : "Copy prompt"}
                  </button>
                </>
              ) : (
                <button type="button" disabled className={APP_BUTTON_PLAIN}>
                  Nothing to export
                </button>
              )}
            </div>
            {animation ? (
              <details className="mt-4 border border-sc-rule">
                <summary className="cursor-pointer px-3 py-2 text-[10px] tracking-[0.14em] text-sc-muted uppercase hover:text-sc-graphite">
                  See the component
                </summary>
                <pre className="scrawl-panel-scroll max-h-[300px] overflow-auto border-t border-sc-rule bg-[#fafafa] p-3 text-[10px] leading-relaxed tracking-normal select-text">
                  <code>{reactCode}</code>
                </pre>
              </details>
            ) : null}
          </PanelSection>
        </aside>
      </div>
    </div>
  );
}
