"use client";

import Link from "next/link";
import type { UpdateFont } from "@/components/scrawl/font-workspace";
import { AppHeader, FontTabs, Progress, StatusDot } from "@/components/scrawl/app-chrome";
import { Icon } from "@/components/scrawl/scrawl-icons";
import { SCRAWL_ROUTES, type FontTab } from "@/components/scrawl/scrawl-chrome";
import { countDrawn, expandGlyphs, type GlyphMap } from "@/lib/scrawl/font-build";
import { BASE_CHARSET } from "@/lib/scrawl/metrics";
import type { ScrawlFont } from "@/lib/scrawl/storage";

export function WorkspaceHeader({ font, update, tab }: { font: ScrawlFont; update: UpdateFont; tab: FontTab }) {
  return (
    <AppHeader
      title={
        <input
          aria-label="Font name"
          value={font.name}
          maxLength={40}
          spellCheck={false}
          onChange={(event) => update({ name: event.target.value })}
          className="hidden w-[18ch] min-w-0 bg-transparent text-[10px] text-sc-muted uppercase outline-none hover:text-sc-graphite focus:text-sc-graphite sm:inline"
        />
      }
      nav={<FontTabs id={font.id} active={tab} />}
      right={
        <>
          <Progress drawn={countDrawn(font.glyphs, BASE_CHARSET)} total={BASE_CHARSET.length} />
          <StatusDot label="Saved in this browser · nothing uploaded" />
          <Link
            href={SCRAWL_ROUTES.fonts}
            className="hidden items-center gap-1.5 text-[10px] tracking-[0.14em] text-sc-muted uppercase hover:text-sc-graphite sm:flex"
          >
            My fonts
            <Icon name="folder" size={12} />
          </Link>
        </>
      }
    />
  );
}

export interface TextRun {
  text: string;
  drawn: boolean;
}

/** Splits sample text so characters that aren't drawn yet can fall back to a placeholder face. */
export function toRuns(text: string, glyphs: GlyphMap): TextRun[] {
  const available = new Set(Object.keys(expandGlyphs(glyphs)));
  const runs: TextRun[] = [];
  for (const char of text) {
    const drawn = char === " " || char === "\n" || available.has(char);
    const last = runs[runs.length - 1];
    if (last && last.drawn === drawn) last.text += char;
    else runs.push({ text: char, drawn });
  }
  return runs;
}

export function SetText({ text, glyphs, family, className = "" }: { text: string; glyphs: GlyphMap; family: string | null; className?: string }) {
  return (
    <p className={`break-words whitespace-pre-wrap ${className}`}>
      {toRuns(text, glyphs).map((run, i) =>
        run.drawn && family ? (
          <span key={i} className="text-sc-graphite" style={{ fontFamily: `"${family}"`, letterSpacing: "normal" }}>
            {run.text}
          </span>
        ) : (
          <span key={i} className="text-sc-muted">
            {run.text}
          </span>
        ),
      )}
    </p>
  );
}
