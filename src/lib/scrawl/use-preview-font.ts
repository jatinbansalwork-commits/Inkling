"use client";

import { useEffect, useState } from "react";
import { buildFontBuffer, countDrawn, type GlyphMap } from "@/lib/scrawl/font-build";
import type { FontSettings, FontWeightName } from "@/lib/scrawl/metrics";

let faceCounter = 0;

/**
 * Compiles the glyphs into a real OpenType font and registers it with the page,
 * so the tester is typeset by the browser exactly as the download will be.
 */
export function usePreviewFont(
  glyphs: GlyphMap,
  weight: FontWeightName,
  settings?: Partial<FontSettings>,
  delay = 250,
): string | null {
  const [family, setFamily] = useState<string | null>(null);
  const settingsKey = JSON.stringify(settings ?? {});

  useEffect(() => {
    if (countDrawn(glyphs) === 0) return;
    let face: FontFace | null = null;
    let cancelled = false;
    const parsed = JSON.parse(settingsKey) as Partial<FontSettings>;

    const timer = window.setTimeout(async () => {
      const name = `scrawl-preview-${++faceCounter}`;
      try {
        face = new FontFace(name, buildFontBuffer(name, glyphs, weight, parsed));
        await face.load();
        if (cancelled) return;
        document.fonts.add(face);
        setFamily(name);
      } catch {
        face = null;
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      const previous = face;
      if (previous) window.setTimeout(() => document.fonts.delete(previous), delay + 400);
    };
  }, [glyphs, weight, settingsKey, delay]);

  return countDrawn(glyphs) === 0 ? null : family;
}
