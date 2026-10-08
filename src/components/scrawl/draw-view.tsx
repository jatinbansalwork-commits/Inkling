"use client";

import { useCallback, useEffect, useState } from "react";
import type { UpdateFont } from "@/components/scrawl/font-workspace";
import { PanelNote, PanelSection, RangeField, StatRow } from "@/components/scrawl/app-chrome";
import { GlyphPad, GUIDE_FACES, type GuideFaceId, type PadTool } from "@/components/scrawl/glyph-pad";
import { GlyphThumb } from "@/components/scrawl/glyph-thumb";
import { Icon } from "@/components/scrawl/scrawl-icons";
import { APP_BUTTON_OFF, APP_BUTTON_ON, APP_BUTTON_PLAIN, segmentClass } from "@/components/scrawl/scrawl-chrome";
import { SetText, WorkspaceHeader } from "@/components/scrawl/workspace-header";
import { countDrawn, isDrawn } from "@/lib/scrawl/font-build";
import { strokesBounds, type GlyphStrokes } from "@/lib/scrawl/geometry";
import {
  ACCENT_MARKS,
  BASE_CHARSET,
  BRUSH_RANGE,
  CHARACTER_GROUPS,
  CHARSET,
  GLYPH_NAMES,
  PANGRAM,
  PEN_RADIUS,
  resolveSettings,
  type FontWeightName,
} from "@/lib/scrawl/metrics";
import type { ScrawlFont } from "@/lib/scrawl/storage";
import { usePreviewFont } from "@/lib/scrawl/use-preview-font";

const EMPTY: GlyphStrokes = [];
const THUMB_VIEWBOX = "-180 -150 1300 1600";

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable]"));
}

const codepoint = (char: string) => `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`;

function GlyphButton({ char, current, strokes, onSelect }: { char: string; current: boolean; strokes: GlyphStrokes | undefined; onSelect: () => void }) {
  const drawn = (strokes?.length ?? 0) > 0;
  const state = current
    ? "border-sc-graphite bg-sc-graphite text-white"
    : drawn
      ? "border-sc-rule text-sc-graphite hover:border-sc-graphite"
      : "border-sc-rule text-sc-muted hover:text-sc-graphite";
  return (
    <button
      type="button"
      title={GLYPH_NAMES[char]}
      aria-label={`${GLYPH_NAMES[char] ?? char}${drawn ? ", drawn" : ""}`}
      aria-current={current ? "true" : undefined}
      onClick={onSelect}
      className={`flex size-8 shrink-0 items-center justify-center overflow-hidden border text-[10px] pointer-coarse:size-[44px] ${state}`}
    >
      {drawn ? <GlyphThumb strokes={strokes!} radius={PEN_RADIUS.regular * 1.4} viewBox={THUMB_VIEWBOX} className="size-full" /> : char}
    </button>
  );
}

function GlyphSidebar({ font, char, onSelect }: { font: ScrawlFont; char: string; onSelect: (char: string) => void }) {
  const [accentsOpen, setAccentsOpen] = useState(() => ACCENT_MARKS.includes(char) && !BASE_CHARSET.includes(char));
  const left = BASE_CHARSET.length - countDrawn(font.glyphs, BASE_CHARSET);

  return (
    <aside aria-label="Glyphs" className="hidden min-h-0 w-[280px] shrink-0 border-r border-sc-rule lg:block">
      <div className="h-full py-4">
        <div className="scrawl-panel-scroll h-full overflow-y-auto px-5 pb-16">
          {CHARACTER_GROUPS.map((group) => (
            <section key={group.id} className="border-t border-sc-rule pt-3 first:border-t-0">
              <div className="flex items-baseline justify-between pb-2">
                <h2 className="text-[10px] tracking-[0.18em] uppercase">{group.label}</h2>
                <span className="text-[10px] text-sc-muted tabular-nums">
                  {countDrawn(font.glyphs, group.chars)}/{group.chars.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-px pb-3">
                {group.chars.map((c) => (
                  <GlyphButton key={c} char={c} current={c === char} strokes={font.glyphs[c]} onSelect={() => onSelect(c)} />
                ))}
              </div>
            </section>
          ))}
          <section className="border-t border-sc-rule pt-3">
            <button
              type="button"
              aria-expanded={accentsOpen}
              onClick={() => setAccentsOpen((open) => !open)}
              className="flex w-full items-baseline justify-between pb-2 text-sc-muted hover:text-sc-graphite"
            >
              <h2 className="text-[10px] tracking-[0.18em] text-sc-graphite uppercase">{accentsOpen ? "−" : "+"} Accents</h2>
              <span className="text-[10px] tabular-nums uppercase">
                {countDrawn(font.glyphs, ACCENT_MARKS)}/{ACCENT_MARKS.length} marks
              </span>
            </button>
            {accentsOpen ? (
              <>
                <div className="flex flex-wrap gap-px pb-3">
                  {ACCENT_MARKS.map((c) => (
                    <GlyphButton key={c} char={c} current={c === char} strokes={font.glyphs[c]} onSelect={() => onSelect(c)} />
                  ))}
                </div>
                <p className="pb-3 text-[10px] leading-relaxed text-sc-muted uppercase">
                  Draw a mark once and every letter that wears it is built for you.
                </p>
              </>
            ) : null}
          </section>
          <p className="pt-4 text-[10px] leading-relaxed text-sc-muted uppercase">{left === 0 ? "Set complete" : `${left} left`}</p>
        </div>
      </div>
    </aside>
  );
}

export function DrawView({ font, update }: { font: ScrawlFont; update: UpdateFont }) {
  const [index, setIndex] = useState(() => {
    const firstEmpty = BASE_CHARSET.findIndex((c) => !isDrawn(font.glyphs, c));
    return firstEmpty === -1 ? 0 : firstEmpty;
  });
  const [weight, setWeight] = useState<FontWeightName>("regular");
  const [tool, setTool] = useState<PadTool>("draw");
  const [guideFace, setGuideFace] = useState<GuideFaceId>("sans");
  const [trace, setTrace] = useState(true);
  const [showGlyphs, setShowGlyphs] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [sample, setSample] = useState(PANGRAM);

  const settings = resolveSettings(font.settings);
  const char = CHARSET[index];
  const strokes = font.glyphs[char] ?? EMPTY;
  const brush = settings.brush[weight];
  const family = usePreviewFont(showPreview ? font.glyphs : {}, weight, font.settings);

  const setStrokes = useCallback(
    (next: GlyphStrokes) => update((prev) => ({ glyphs: { ...prev.glyphs, [char]: next } })),
    [update, char],
  );
  const go = useCallback((step: number) => setIndex((prev) => Math.min(CHARSET.length - 1, Math.max(0, prev + step))), []);
  const undo = useCallback(() => setStrokes(strokes.slice(0, -1)), [setStrokes, strokes]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key.toLowerCase() === "z" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        undo();
      } else if (event.key.toLowerCase() === "e") setTool("erase");
      else if (event.key.toLowerCase() === "d") setTool("draw");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, undo]);

  const setBrush = (value: number) => update((prev) => ({ settings: { ...prev.settings, brush: { ...resolveSettings(prev.settings).brush, [weight]: value } } }));

  const bounds = strokesBounds(strokes);
  const points = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
  const face = GUIDE_FACES.find((option) => option.id === guideFace)!;
  const prev = index > 0 ? CHARSET[index - 1] : null;
  const next = index < CHARSET.length - 1 ? CHARSET[index + 1] : null;

  return (
    <div className="flex h-dvh flex-col pb-[env(safe-area-inset-bottom)]">
      <WorkspaceHeader font={font} update={update} tab="draw" />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="hidden sm:contents">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-sc-rule px-4 py-2 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-2 lg:flex">
                <button type="button" aria-pressed={showGlyphs} className={showGlyphs ? APP_BUTTON_ON : APP_BUTTON_OFF} onClick={() => setShowGlyphs((v) => !v)}>
                  <Icon name="grid" />
                  Glyphs
                </button>
                <button type="button" aria-pressed={showSettings} className={showSettings ? APP_BUTTON_ON : APP_BUTTON_OFF} onClick={() => setShowSettings((v) => !v)}>
                  <Icon name="sliders" />
                  Settings
                </button>
              </div>
              <span className="hidden h-4 w-px bg-sc-rule lg:block" />
              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Weight" className="flex border border-sc-rule">
                  {(["regular", "bold"] as const).map((option) => (
                    <button key={option} type="button" aria-pressed={weight === option} className={segmentClass(weight === option)} onClick={() => setWeight(option)}>
                      {option === "regular" ? <span className="text-[11px] tracking-normal normal-case">Aa</span> : null}
                      {option}
                    </button>
                  ))}
                </div>
                <button type="button" aria-pressed={trace} className={trace ? APP_BUTTON_ON : APP_BUTTON_OFF} onClick={() => setTrace((v) => !v)}>
                  <Icon name="eye" />
                  Trace
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
              <button type="button" aria-pressed={showPreview} className={showPreview ? APP_BUTTON_ON : APP_BUTTON_OFF} onClick={() => setShowPreview((v) => !v)}>
                <Icon name="text" />
                Preview
              </button>
            </div>
          </div>
        </div>

        <main id="main-content" className="relative flex min-h-0 flex-1">
          {showGlyphs ? <GlyphSidebar font={font} char={char} onSelect={(c) => setIndex(CHARSET.indexOf(c))} /> : null}

          <section aria-label="Canvas" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
            <div className="relative flex min-h-0 flex-1 flex-col items-center gap-2 p-4 sm:p-6">
              <div className="flex w-full max-w-full shrink-0 items-center justify-between gap-3">
                <button
                  type="button"
                  aria-label={prev ? `Previous glyph, ${prev}` : undefined}
                  aria-hidden={!prev}
                  tabIndex={prev ? 0 : -1}
                  onClick={() => go(-1)}
                  className={`flex shrink-0 items-center gap-2 border border-sc-rule px-2.5 py-1.5 text-sc-muted hover:border-sc-graphite hover:text-sc-graphite pointer-coarse:min-h-[44px] pointer-coarse:px-4 ${prev ? "" : "invisible"}`}
                >
                  <Icon name="caret-left" />
                  <span className="text-[13px] leading-none text-sc-graphite">{prev ?? CHARSET[0]}</span>
                </button>
                <span className="flex min-w-0 items-baseline gap-3">
                  <span className="text-[34px] leading-none tracking-[0.06em]">{char}</span>
                  <span className="flex items-baseline gap-3 text-[10px] text-sc-muted tabular-nums">
                    <span>
                      {String(index + 1).padStart(3, "0")}/{CHARSET.length}
                    </span>
                    <span className="hidden sm:inline">{codepoint(char)}</span>
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={next ? `Next glyph, ${next}` : undefined}
                  aria-hidden={!next}
                  tabIndex={next ? 0 : -1}
                  onClick={() => go(1)}
                  className={`flex shrink-0 items-center gap-2 border border-sc-rule px-2.5 py-1.5 text-sc-muted hover:border-sc-graphite hover:text-sc-graphite pointer-coarse:min-h-[44px] pointer-coarse:px-4 ${next ? "" : "invisible"}`}
                >
                  <span className="text-[13px] leading-none text-sc-graphite">{next ?? CHARSET[0]}</span>
                  <Icon name="caret-right" />
                </button>
              </div>
              <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                <GlyphPad
                  fit
                  char={char}
                  strokes={strokes}
                  onChange={setStrokes}
                  radius={brush / 2}
                  tool={tool}
                  guideFace={guideFace}
                  showGhost={trace}
                />
              </div>
            </div>

            {showPreview ? (
              <div className="shrink-0 border-t border-sc-rule px-4 py-4 sm:px-6">
                <div className="flex items-baseline justify-between gap-4 pb-2">
                  <span className="text-[10px] tracking-[0.18em] uppercase">Preview · {weight}</span>
                  <span className="text-[10px] text-sc-muted uppercase">Grey letters aren’t drawn yet</span>
                </div>
                <SetText text={sample} glyphs={font.glyphs} family={family} className="max-h-[140px] overflow-y-auto text-[40px] leading-[1.15]" />
                <label className="mt-3 block">
                  <span className="sr-only">Preview text</span>
                  <input
                    value={sample}
                    onChange={(event) => setSample(event.target.value)}
                    className="w-full border border-sc-rule bg-sc-paper px-2 py-1.5 text-[11px] outline-none focus:border-sc-graphite"
                  />
                </label>
              </div>
            ) : null}

            <div className="relative shrink-0">
              <div className="flex items-center justify-between gap-3 border-t border-sc-rule px-4 py-2 sm:justify-center sm:px-6">
                <div className="flex items-center gap-3">
                  <div role="group" aria-label="Tool" className="flex border border-sc-rule">
                    <button type="button" aria-pressed={tool === "draw"} className={segmentClass(tool === "draw", true)} onClick={() => setTool("draw")}>
                      <Icon name="pencil" />
                      Draw
                    </button>
                    <button type="button" aria-pressed={tool === "erase"} className={segmentClass(tool === "erase", true)} onClick={() => setTool("erase")}>
                      <Icon name="eraser" />
                      Erase
                    </button>
                  </div>
                  <button type="button" disabled={strokes.length === 0} className={APP_BUTTON_PLAIN} onClick={undo}>
                    <Icon name="undo" />
                    Undo
                  </button>
                </div>
                <button type="button" disabled={strokes.length === 0} className={APP_BUTTON_PLAIN} onClick={() => setStrokes([])}>
                  <Icon name="trash" />
                  Clear
                </button>
              </div>
            </div>
          </section>

          {showSettings ? (
            <aside aria-label="Settings" className="hidden min-h-0 w-[300px] shrink-0 border-l border-sc-rule lg:block">
              <div className="scrawl-panel-scroll h-full overflow-y-auto px-5 py-4 pb-16">
                <PanelSection title="Brush" meta={weight}>
                  <RangeField label="Weight" value={brush} min={BRUSH_RANGE.min} max={BRUSH_RANGE.max} onChange={setBrush} />
                  <PanelNote>The same strokes build both weights. Bold is just a fatter pen.</PanelNote>
                </PanelSection>
                <PanelSection title="Sheet" meta={trace ? "Traced" : "Blank"}>
                  <label className="block pt-3 select-none">
                    <span className="text-[10px] text-sc-muted uppercase">Guide face</span>
                    <span className="relative mt-1 flex items-center">
                      <select
                        value={guideFace}
                        onChange={(event) => setGuideFace(event.target.value as GuideFaceId)}
                        className="w-full appearance-none border border-sc-rule bg-sc-paper py-1.5 pr-7 pl-2 text-[10px] tracking-[0.1em] uppercase hover:border-sc-graphite focus-visible:border-sc-graphite pointer-coarse:min-h-[44px]"
                      >
                        {GUIDE_FACES.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 text-[10px] text-sc-muted">▾</span>
                    </span>
                  </label>
                  <PanelNote>{face.label}, loaded with the page. Sized to the cap line.</PanelNote>
                </PanelSection>
                <PanelSection title="Glyph" meta={strokes.length ? "Drawn" : "Empty"}>
                  <StatRow label="Strokes" value={strokes.length} />
                  <StatRow label="Points" value={points} />
                  <StatRow label="Contours" value={points ? points * 2 - strokes.length : 0} />
                  <StatRow label="Ink width" value={bounds ? Math.round(bounds.maxX - bounds.minX + brush) : "—"} />
                  <StatRow label="Side bearings" value={bounds ? `${settings.sideBearing} · ${settings.sideBearing}` : "—"} />
                </PanelSection>
                <PanelSection title="Keys">
                  <StatRow label="Next · previous" value="→ ←" />
                  <StatRow label="Undo" value="⌘Z" />
                  <StatRow label="Draw · erase" value="D · E" />
                </PanelSection>
              </div>
            </aside>
          ) : null}
        </main>
      </div>
    </div>
  );
}
