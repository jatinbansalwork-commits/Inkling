"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UpdateFont } from "@/components/scrawl/font-workspace";
import { PanelNote, PanelSection, StatRow } from "@/components/scrawl/app-chrome";
import { Icon } from "@/components/scrawl/scrawl-icons";
import { APP_BUTTON_OFF, BIG_BUTTON, fontRoute } from "@/components/scrawl/scrawl-chrome";
import { SetText, WorkspaceHeader } from "@/components/scrawl/workspace-header";
import { buildFontPackage, type PackageFile } from "@/lib/scrawl/export";
import { countDrawn, expandGlyphs } from "@/lib/scrawl/font-build";
import { BASE_CHARSET, CHARSET, PANGRAM, resolveSettings } from "@/lib/scrawl/metrics";
import type { ScrawlFont } from "@/lib/scrawl/storage";
import { usePreviewFont } from "@/lib/scrawl/use-preview-font";
import { downloadBlob } from "@/lib/scrawl/zip";

interface BuiltPackage {
  key: string;
  zip: Blob;
  files: PackageFile[];
  filename: string;
}

const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))}KB`;

export function ExportView({ font, update }: { font: ScrawlFont; update: UpdateFont }) {
  const [built, setBuilt] = useState<BuiltPackage | null>(null);
  const settings = resolveSettings(font.settings);
  const drawn = countDrawn(font.glyphs, BASE_CHARSET);
  const composed = Object.keys(expandGlyphs(font.glyphs)).length - countDrawn(font.glyphs, CHARSET);
  const family = usePreviewFont(font.glyphs, "regular", font.settings);
  const key = JSON.stringify([font.name, font.settings, drawn]);

  useEffect(() => {
    if (drawn === 0) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const result = await buildFontPackage(font.name, font.glyphs, font.settings);
      if (!cancelled) setBuilt({ key, ...result });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [drawn, font.name, font.glyphs, font.settings, key]);

  const ready = built && built.key === key ? built : null;
  const total = ready ? ready.zip.size : 0;

  return (
    <div className="flex h-dvh flex-col pb-[env(safe-area-inset-bottom)]">
      <WorkspaceHeader font={font} update={update} tab="export" />
      <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:overflow-y-auto">
          <div className="flex items-baseline justify-between border-b border-sc-rule pb-3">
            <h1 className="text-[11px] tracking-[0.18em] uppercase">Get the font</h1>
            <span className="text-[10px] text-sc-muted tabular-nums">
              {drawn}/{BASE_CHARSET.length}
            </span>
          </div>

          {drawn === 0 ? (
            <div className="py-6">
              <p className="text-[10px] text-sc-muted uppercase">Nothing to export yet. Draw a letter or two first.</p>
              <Link href={fontRoute(font.id, "draw")} className={`${APP_BUTTON_OFF} mt-4 inline-flex`}>
                <Icon name="pencil" />
                Back to drawing
              </Link>
            </div>
          ) : (
            <>
              <SetText text={font.name || "Untitled Hand"} glyphs={font.glyphs} family={family} className="pt-8 text-[clamp(44px,7vw,96px)] leading-[1.05] tracking-normal" />
              <SetText text={PANGRAM} glyphs={font.glyphs} family={family} className="pt-4 text-[clamp(20px,2.4vw,30px)] leading-[1.3] tracking-normal" />

              <div className="mt-10 max-w-[560px]">
                <div className="flex items-baseline justify-between border-b border-sc-rule pb-3">
                  <h2 className="text-[10px] tracking-[0.18em] uppercase">In the download</h2>
                  <span className="text-[10px] text-sc-muted uppercase tabular-nums">{ready ? `${kb(total)} zip` : "Building…"}</span>
                </div>
                <ul>
                  {(ready?.files ?? []).map((file) => (
                    <li key={file.name} className="flex items-baseline justify-between gap-5 border-b border-sc-rule py-2.5 text-[10px]">
                      <span className="min-w-0 truncate">{file.name}</span>
                      <span className="shrink-0 text-sc-muted tabular-nums">{kb(file.size)}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-4 text-[10px] leading-relaxed text-sc-muted uppercase">
                  OTF goes into your font manager, WOFF goes on a website. Both weights share one family name.
                </p>
                <div className="max-w-[280px] pt-6">
                  <button type="button" className={BIG_BUTTON} disabled={!ready} onClick={() => ready && downloadBlob(ready.zip, ready.filename)}>
                    {ready ? "Download" : "Building…"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <aside aria-label="Summary" className="w-full shrink-0 border-sc-rule px-5 py-4 pb-16 lg:w-[300px] lg:overflow-y-auto lg:border-l">
          <PanelSection title="Build" meta={drawn ? "Ready" : "Empty"}>
            <StatRow label="Glyphs drawn" value={`${drawn}/${BASE_CHARSET.length}`} />
            <StatRow label="Accents composed" value={composed} />
            <StatRow label="Weights" value="Regular · Bold" />
            <StatRow label="Formats" value="OTF · WOFF" />
          </PanelSection>
          <PanelSection title="Settings">
            <StatRow label="Brush" value={`${settings.brush.regular} · ${settings.brush.bold}`} />
            <StatRow label="Flank white" value={settings.sideBearing} />
            <StatRow label="Word space" value={settings.wordSpace} />
            <PanelNote>Change these in Draw and Review. Re-exports are unlimited.</PanelNote>
          </PanelSection>
        </aside>
      </main>
    </div>
  );
}
