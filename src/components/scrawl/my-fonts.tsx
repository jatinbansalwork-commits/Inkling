"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/scrawl/app-chrome";
import { GlyphThumb } from "@/components/scrawl/glyph-thumb";
import { Icon } from "@/components/scrawl/scrawl-icons";
import { APP_BUTTON_OFF, APP_BUTTON_SOLID, fontRoute, SCRAWL_ROUTES, SectionHead } from "@/components/scrawl/scrawl-chrome";
import { downloadFontPackage } from "@/lib/scrawl/export";
import { countDrawn, isDrawn } from "@/lib/scrawl/font-build";
import { BASE_CHARSET, resolveSettings } from "@/lib/scrawl/metrics";
import { deleteFont, useHasHydrated, useScrawlFonts, type ScrawlFont } from "@/lib/scrawl/storage";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function FontRow({ font }: { font: ScrawlFont }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const drawn = countDrawn(font.glyphs, BASE_CHARSET);
  const sample = BASE_CHARSET.filter((char) => isDrawn(font.glyphs, char)).slice(0, 14);
  const radius = resolveSettings(font.settings).brush.regular / 2;

  return (
    <li className="grid gap-x-10 gap-y-5 border-b border-sc-rule py-8 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <Link href={fontRoute(font.id)} className="font-sc-hand text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-normal text-sc-graphite hover:text-sc-accent">
            {font.name || "Untitled Hand"}
          </Link>
          <span className="font-sc-annot text-[10px] tracking-[0.16em] text-sc-muted uppercase tabular-nums">
            {drawn}/{BASE_CHARSET.length} drawn · Edited {DATE.format(font.updatedAt)}
          </span>
        </div>
        <div className="mt-4 flex h-14 items-end gap-1 text-sc-graphite">
          {sample.length > 0 ? (
            sample.map((char) => <GlyphThumb key={char} strokes={font.glyphs[char]} radius={radius} className="h-full w-auto" />)
          ) : (
            <span className="self-center text-[10px] text-sc-muted uppercase">Nothing drawn yet</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-2 lg:justify-end">
        <Link href={fontRoute(font.id)} className={APP_BUTTON_SOLID}>
          <Icon name="pencil" />
          Open
        </Link>
        <button
          type="button"
          className={APP_BUTTON_OFF}
          disabled={drawn === 0 || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await downloadFontPackage(font.name, font.glyphs, font.settings);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Icon name="download" />
          {busy ? "Building…" : "Download"}
        </button>
        {confirming ? (
          <>
            <button type="button" className={`${APP_BUTTON_OFF} text-sc-accent!`} onClick={() => deleteFont(font.id)}>
              Yes, delete
            </button>
            <button type="button" className={APP_BUTTON_OFF} onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </>
        ) : (
          <button type="button" className={APP_BUTTON_OFF} onClick={() => setConfirming(true)}>
            <Icon name="trash" />
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

export function MyFonts() {
  const fonts = useScrawlFonts();
  const hydrated = useHasHydrated();

  return (
    <>
      <AppHeader
        sticky
        homeHref={SCRAWL_ROUTES.home}
        title={<span className="font-sc-annot text-[10px] tracking-[0.16em] text-sc-muted uppercase">My fonts</span>}
        right={
          <Link
            href={SCRAWL_ROUTES.make}
            className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-sc-muted uppercase hover:text-sc-graphite"
          >
            New font
            <Icon name="plus" size={12} />
          </Link>
        }
      />
      <main id="main-content" className="mx-auto max-w-[1180px] px-6 pt-14 pb-32 sm:px-10">
        <h1 className="font-sc-hand text-[clamp(34px,5.5vw,58px)] leading-[1.1] tracking-normal text-sc-graphite">My fonts</h1>
        <div className="mt-10">
          <SectionHead left="Drawn in this browser" right={hydrated ? fonts.length : "—"} />
        </div>
        {!hydrated ? (
          <p className="pt-8 font-sc-annot text-[10px] tracking-[0.16em] text-sc-muted uppercase">Loading…</p>
        ) : fonts.length === 0 ? (
          <div className="pt-8">
            <p className="max-w-[54ch] font-sc-body text-[16px] leading-[1.7] tracking-normal text-sc-graphite">
              Nothing here yet. Fonts you start are saved in this browser and nowhere else, so they’ll show up here the
              next time you visit on this device.
            </p>
            <Link href={SCRAWL_ROUTES.make} className={`${APP_BUTTON_SOLID} mt-6 inline-flex`}>
              <Icon name="plus" />
              Start a font
            </Link>
          </div>
        ) : (
          <ul>
            {fonts.map((font) => (
              <FontRow key={font.id} font={font} />
            ))}
          </ul>
        )}
        <p className="max-w-[58ch] pt-10 font-sc-body text-[13px] leading-[1.6] tracking-normal text-sc-muted">
          Clearing your browser’s site data clears these too. Download anything you want to keep.
        </p>
      </main>
    </>
  );
}
