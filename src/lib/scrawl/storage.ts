"use client";

import { useSyncExternalStore } from "react";
import type { GlyphMap } from "@/lib/scrawl/font-build";
import type { FontSettings } from "@/lib/scrawl/metrics";

export interface ScrawlFont {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  glyphs: GlyphMap;
  settings?: Partial<FontSettings>;
}

const FONTS_KEY = "scrawl:fonts:v1";
const EMPTY: ScrawlFont[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedFonts: ScrawlFont[] = EMPTY;

function readFonts(): ScrawlFont[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(FONTS_KEY);
  if (raw === cachedRaw) return cachedFonts;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedFonts = Array.isArray(parsed) ? (parsed as ScrawlFont[]) : EMPTY;
  } catch {
    cachedFonts = EMPTY;
  }
  return cachedFonts;
}

function writeFonts(fonts: ScrawlFont[]) {
  window.localStorage.setItem(FONTS_KEY, JSON.stringify(fonts));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === FONTS_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useScrawlFonts(): ScrawlFont[] {
  return useSyncExternalStore(subscribe, readFonts, () => EMPTY);
}

/** False during SSR and the hydration pass, so empty states don't flash. */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function getFont(id: string): ScrawlFont | undefined {
  return readFonts().find((font) => font.id === id);
}

export function createFont(name: string, glyphs: GlyphMap = {}): ScrawlFont {
  const now = Date.now();
  const font: ScrawlFont = {
    id: `${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name,
    createdAt: now,
    updatedAt: now,
    glyphs,
  };
  writeFonts([font, ...readFonts()]);
  return font;
}

export function updateFont(id: string, patch: Partial<Pick<ScrawlFont, "name" | "glyphs" | "settings">>) {
  writeFonts(
    readFonts().map((font) => (font.id === id ? { ...font, ...patch, updatedAt: Date.now() } : font)),
  );
}

export function deleteFont(id: string) {
  writeFonts(readFonts().filter((font) => font.id !== id));
}
