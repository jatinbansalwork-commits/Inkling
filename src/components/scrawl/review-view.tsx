"use client";

import { useState } from "react";
import type { UpdateFont } from "@/components/scrawl/font-workspace";
import { PanelNote, PanelSection, RangeField, StatRow } from "@/components/scrawl/app-chrome";
import { GlyphThumb } from "@/components/scrawl/glyph-thumb";
import { APP_BUTTON_OFF, APP_BUTTON_ON } from "@/components/scrawl/scrawl-chrome";
import { SetText, WorkspaceHeader } from "@/components/scrawl/workspace-header";
import { isDrawn } from "@/lib/scrawl/font-build";
import { strokesBounds, translateStrokes } from "@/lib/scrawl/geometry";
import {
  BASE_CHARSET,
  BOX_HEIGHT,
  BOX_TOP,
  resolveSettings,
  SIDE_BEARING_RANGE,
  WORD_SPACE_RANGE,
} from "@/lib/scrawl/metrics";
import type { ScrawlFont } from "@/lib/scrawl/storage";
import { usePreviewFont } from "@/lib/scrawl/use-preview-font";

/** Letters that should rest on the baseline. Descenders and floating punctuation are left alone. */
const SITS_ON_BASELINE = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhiklmnorstuvwxz0123456789".split("")); // cspell:disable-line
const OUT_OF_LINE_TOLERANCE = 50;
const NUDGE = 10;

const SAMPLE_LINES = ["The quick brown fox jumped over the lazy dog", "AVATAR To Yo r. f) 0123"];

function baselineOffset(font: ScrawlFont, char: string): number | null {
  const bounds = strokesBounds(font.glyphs[char] ?? []);
  return bounds ? Math.round(bounds.minY) : null;
}

export function ReviewView({ font, update }: { font: ScrawlFont; update: UpdateFont }) {
  const [selected, setSelected] = useState<string | null>(null);
  const settings = resolveSettings(font.settings);
  const radius = settings.brush.regular / 2;
  const family = usePreviewFont(font.glyphs, "regular", font.settings);

  const drawn = BASE_CHARSET.filter((char) => isDrawn(font.glyphs, char));
  const outOfLine = drawn.filter((char) => {
    const offset = baselineOffset(font, char);
    return SITS_ON_BASELINE.has(char) && offset !== null && Math.abs(offset) > OUT_OF_LINE_TOLERANCE;
  });

  const setSetting = (key: "sideBearing" | "wordSpace", value: number) =>
    update((prev) => ({ settings: { ...prev.settings, [key]: value } }));

  const nudge = (char: string, dy: number) =>
    update((prev) => ({ glyphs: { ...prev.glyphs, [char]: translateStrokes(prev.glyphs[char] ?? [], 0, dy) } }));

  const selectedOffset = selected ? baselineOffset(font, selected) : null;

  return (
    <div className="flex h-dvh flex-col pb-[env(safe-area-inset-bottom)]">
      <WorkspaceHeader font={font} update={update} tab="review" />
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-sc-rule px-4 py-2 sm:px-6">
        <button type="button" aria-pressed className={APP_BUTTON_ON}>
          Spacing
        </button>
        <span className={`text-[10px] uppercase ${outOfLine.length ? "text-sc-accent" : "text-sc-muted"}`}>
          {outOfLine.length} out of line
        </span>
      </div>

      <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:overflow-y-auto">
          <section>
            <div className="flex items-baseline justify-between border-b border-sc-rule pb-3">
              <h2 className="text-[11px] tracking-[0.18em] uppercase">Shared baseline</h2>
              <span className="text-[10px] text-sc-muted tabular-nums">{drawn.length || "—"}</span>
            </div>
            {drawn.length === 0 ? (
              <p className="py-4 text-[10px] text-sc-muted uppercase">Nothing drawn yet</p>
            ) : (
              <div className="relative flex flex-wrap gap-y-2 py-4">
                {drawn.map((char) => {
                  const bounds = strokesBounds(font.glyphs[char])!;
                  const x = bounds.minX - radius - 10;
                  const width = bounds.maxX - bounds.minX + 2 * radius + 20;
                  const crooked = outOfLine.includes(char);
                  return (
                    <button
                      key={char}
                      type="button"
                      aria-label={`${char}${crooked ? ", out of line" : ""}`}
                      aria-pressed={selected === char}
                      onClick={() => setSelected(selected === char ? null : char)}
                      className={`relative h-[72px] border-b ${selected === char ? "bg-[#f4f4f4]" : "hover:bg-[#fafafa]"} ${
                        crooked ? "border-sc-accent text-sc-accent" : "border-sc-rule text-sc-graphite"
                      }`}
                      style={{ aspectRatio: `${width} / ${BOX_HEIGHT}` }}
                    >
                      <span aria-hidden className="absolute inset-x-0 border-t border-dashed border-sc-rule" style={{ top: `${(BOX_TOP / BOX_HEIGHT) * 100}%` }} />
                      <GlyphThumb strokes={font.glyphs[char]} radius={radius} viewBox={`${x} 0 ${width} ${BOX_HEIGHT}`} className="relative size-full" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-6">
            <div className="flex items-baseline justify-between border-b border-sc-rule pb-3">
              <h2 className="text-[10px] tracking-[0.18em] uppercase">Set with current spacing</h2>
              <span className="text-[10px] text-sc-muted">AV · To · Yo · r. · f)</span>
            </div>
            {SAMPLE_LINES.map((line) => (
              <SetText key={line} text={line} glyphs={font.glyphs} family={family} className="pt-3 text-[clamp(22px,2.6vw,34px)] leading-[1.25] tracking-normal" />
            ))}
          </section>
        </div>

        <aside aria-label="Spacing" className="w-full shrink-0 border-sc-rule px-5 py-4 pb-16 lg:w-[300px] lg:overflow-y-auto lg:border-l">
          <PanelSection title="Spacing" meta={settings.sideBearing}>
            <PanelNote>Measured from the ink, not the box</PanelNote>
            <RangeField
              label="Flank white"
              value={settings.sideBearing}
              min={SIDE_BEARING_RANGE.min}
              max={SIDE_BEARING_RANGE.max}
              onChange={(value) => setSetting("sideBearing", value)}
            />
            <RangeField
              label="Word space"
              value={settings.wordSpace}
              min={WORD_SPACE_RANGE.min}
              max={WORD_SPACE_RANGE.max}
              step={10}
              onChange={(value) => setSetting("wordSpace", value)}
            />
          </PanelSection>
          <PanelSection title="Glyph" meta={selected ?? "—"}>
            {selected ? (
              <>
                <StatRow label="Sits at" value={selectedOffset === null ? "—" : `${selectedOffset > 0 ? "+" : ""}${selectedOffset}`} />
                <div className="flex gap-2 pt-3">
                  <button type="button" className={APP_BUTTON_OFF} onClick={() => nudge(selected, NUDGE)}>
                    Up {NUDGE}
                  </button>
                  <button type="button" className={APP_BUTTON_OFF} onClick={() => nudge(selected, -NUDGE)}>
                    Down {NUDGE}
                  </button>
                  <button
                    type="button"
                    className={APP_BUTTON_OFF}
                    disabled={!selectedOffset}
                    onClick={() => selectedOffset && nudge(selected, -selectedOffset)}
                  >
                    To base
                  </button>
                </div>
              </>
            ) : (
              <PanelNote>Pick a glyph to nudge its height. Red ones sit more than {OUT_OF_LINE_TOLERANCE} units off the line.</PanelNote>
            )}
          </PanelSection>
        </aside>
      </main>
    </div>
  );
}
