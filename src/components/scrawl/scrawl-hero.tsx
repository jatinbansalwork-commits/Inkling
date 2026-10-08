"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlyphPad } from "@/components/scrawl/glyph-pad";
import { CONTAINER, fontRoute, HERO_BUTTON_GHOST, HERO_BUTTON_PRIMARY } from "@/components/scrawl/scrawl-chrome";
import type { GlyphStrokes } from "@/lib/scrawl/geometry";
import { createFont } from "@/lib/scrawl/storage";

const HERO_PADS = [
  { char: "P", visibility: "flex" },
  { char: "h", visibility: "hidden sm:flex" },
  { char: "k", visibility: "hidden lg:flex" },
] as const;

export function ScrawlHero() {
  const router = useRouter();
  const [strokes, setStrokes] = useState<Record<string, GlyphStrokes>>({});
  const [opening, setOpening] = useState(false);
  const hasInk = HERO_PADS.some(({ char }) => (strokes[char]?.length ?? 0) > 0);

  const start = () => {
    setOpening(true);
    const font = createFont("Untitled Hand", strokes);
    router.push(fontRoute(font.id));
  };

  return (
    <section className={`${CONTAINER} pt-10 pb-24 sm:pt-16`}>
      <h1 className="text-center font-sc-hand text-[clamp(38px,7vw,76px)] leading-[1.1] tracking-normal text-sc-graphite">
        Turn your handwriting into a font.
      </h1>
      <div className="mx-auto flex w-full max-w-[430px] flex-col pt-12 sm:max-w-[880px] lg:max-w-[1180px]">
        <div className="flex w-full flex-col items-center">
          <div className="flex h-[min(62vh,560px)] w-full items-stretch justify-center gap-5 sm:gap-8">
            {HERO_PADS.map(({ char, visibility }, i) => (
              <div key={char} className={`min-w-0 flex-1 flex-col ${visibility}`}>
                <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                  <GlyphPad
                    fit
                    char={char}
                    strokes={strokes[char] ?? []}
                    showLabels={i === 0}
                    onChange={(next) => setStrokes((prev) => ({ ...prev, [char]: next }))}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-6">
            <button type="button" className={HERO_BUTTON_PRIMARY} disabled={opening} onClick={start}>
              {opening ? "Opening…" : "Make Your Font"}
            </button>
            <button type="button" className={HERO_BUTTON_GHOST} disabled={!hasInk || opening} onClick={() => setStrokes({})}>
              Clear
            </button>
          </div>
          <p
            aria-hidden={hasInk}
            className={`pt-4 font-sc-annot text-[10px] tracking-[0.16em] uppercase text-sc-muted transition-opacity duration-300 ${hasInk ? "opacity-0" : "opacity-100"}`}
          >
            Draw over the guide — pen, mouse or finger
          </p>
        </div>
      </div>
    </section>
  );
}
