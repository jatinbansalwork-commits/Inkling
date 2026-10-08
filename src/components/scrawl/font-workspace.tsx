"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/scrawl/app-chrome";
import { DrawView } from "@/components/scrawl/draw-view";
import { ExportView } from "@/components/scrawl/export-view";
import { ReviewView } from "@/components/scrawl/review-view";
import { APP_BUTTON_OFF, SCRAWL_ROUTES, type FontTab } from "@/components/scrawl/scrawl-chrome";
import { getFont, updateFont, useHasHydrated, type ScrawlFont } from "@/lib/scrawl/storage";

export type FontPatch = Partial<Pick<ScrawlFont, "name" | "glyphs" | "settings">>;
export type UpdateFont = (patch: FontPatch | ((font: ScrawlFont) => FontPatch)) => void;

/** Edits a local copy of the font and writes it back shortly after, and once more on the way out. */
function useFontDraft(initial: ScrawlFont) {
  const [draft, setDraft] = useState(initial);
  const latest = useRef(draft);
  const dirty = useRef(false);

  useEffect(() => {
    latest.current = draft;
    if (!dirty.current) return;
    const timer = window.setTimeout(() => {
      dirty.current = false;
      updateFont(draft.id, { name: draft.name, glyphs: draft.glyphs, settings: draft.settings });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draft]);

  useEffect(
    () => () => {
      if (!dirty.current) return;
      const font = latest.current;
      updateFont(font.id, { name: font.name, glyphs: font.glyphs, settings: font.settings });
    },
    [],
  );

  const update: UpdateFont = useCallback((patch) => {
    dirty.current = true;
    setDraft((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
  }, []);

  return [draft, update] as const;
}

function Workspace({ initial, tab }: { initial: ScrawlFont; tab: FontTab }) {
  const [font, update] = useFontDraft(initial);
  if (tab === "review") return <ReviewView font={font} update={update} />;
  if (tab === "export") return <ExportView font={font} update={update} />;
  return <DrawView font={font} update={update} />;
}

export function FontWorkspace({ id, tab }: { id: string; tab: FontTab }) {
  const hydrated = useHasHydrated();
  const font = hydrated ? getFont(id) : undefined;

  if (!hydrated || !font) {
    return (
      <div className="flex h-dvh flex-col">
        <AppHeader />
        <main id="main-content" className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-[10px] tracking-[0.16em] text-sc-muted uppercase">
            {hydrated ? "That font isn’t saved in this browser" : "Loading…"}
          </p>
          {hydrated ? (
            <div className="flex gap-2">
              <Link href={SCRAWL_ROUTES.fonts} className={APP_BUTTON_OFF}>
                My fonts
              </Link>
              <Link href={SCRAWL_ROUTES.make} className={APP_BUTTON_OFF}>
                Start a new one
              </Link>
            </div>
          ) : null}
        </main>
      </div>
    );
  }

  return <Workspace key={id} initial={font} tab={tab} />;
}
