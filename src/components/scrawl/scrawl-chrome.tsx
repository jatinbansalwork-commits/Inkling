import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";

export const PRODUCT_NAME = "Inkling";

export type FontTab = "draw" | "review" | "export";

export const SCRAWL_ROUTES = {
  home: "/inkling",
  make: "/inkling/make",
  fonts: "/inkling/fonts",
  animate: "/inkling/animate",
} as const;

export const fontRoute = (id: string, tab: FontTab = "draw") => `${SCRAWL_ROUTES.fonts}/${id}/${tab}`;

export const CONTAINER = "mx-auto max-w-[1180px] px-6 sm:px-10";
export const ANNOT = "font-sc-annot text-[10px] tracking-[0.16em] uppercase";
export const MUTED_LINK = "transition-colors duration-150 hover:text-sc-graphite";

export const HERO_BUTTON_PRIMARY =
  "border border-sc-graphite bg-sc-graphite px-4 py-2.5 font-sc-annot text-[11px] tracking-[0.16em] uppercase text-sc-paper transition-colors duration-150 enabled:hover:border-sc-accent enabled:hover:bg-sc-accent disabled:opacity-30";
export const HERO_BUTTON_GHOST =
  "border border-sc-rule px-4 py-2.5 font-sc-annot text-[11px] tracking-[0.16em] uppercase text-sc-muted transition-colors duration-150 enabled:hover:border-sc-graphite enabled:hover:text-sc-graphite disabled:opacity-30";

const APP_BUTTON =
  "flex items-center justify-center gap-1.5 border px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase pointer-coarse:min-h-[44px] disabled:opacity-30";
export const APP_BUTTON_ON = `${APP_BUTTON} border-sc-graphite text-sc-graphite`;
export const APP_BUTTON_OFF = `${APP_BUTTON} border-sc-rule text-sc-muted enabled:hover:border-sc-graphite enabled:hover:text-sc-graphite`;
export const APP_BUTTON_PLAIN = `${APP_BUTTON} border-sc-rule enabled:hover:border-sc-graphite`;
export const APP_BUTTON_SOLID = `${APP_BUTTON} border-sc-graphite bg-sc-graphite text-white enabled:hover:opacity-80`;
export const BIG_BUTTON = `${APP_BUTTON_SOLID} w-full px-8 py-4 text-[12px] tracking-[0.2em]`;

export function segmentClass(active: boolean, solid = false) {
  const base = "flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase pointer-coarse:min-h-[44px]";
  if (active) return `${base} ${solid ? "bg-sc-graphite text-white" : "text-sc-graphite"}`;
  return `${base} text-sc-muted hover:text-sc-graphite`;
}

const SITE_NAV = [
  { href: SCRAWL_ROUTES.fonts, label: "My Fonts" },
  { href: SCRAWL_ROUTES.animate, label: "Animate" },
];

export function SiteHeader() {
  return (
    <header className={`${CONTAINER} flex items-baseline justify-between py-6`}>
      <Link
        href={SCRAWL_ROUTES.home}
        className="font-sc-annot text-[11px] tracking-[0.3em] uppercase text-sc-graphite transition-opacity duration-150 hover:opacity-60"
      >
        {PRODUCT_NAME}
      </Link>
      <nav aria-label={PRODUCT_NAME} className="flex items-baseline gap-6 font-sc-annot text-[11px] tracking-[0.16em] uppercase text-sc-muted">
        {SITE_NAV.map((item) => (
          <Link key={item.href} href={item.href} className={MUTED_LINK}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

type Tone = "paper" | "flood" | "midnight";

const TONES: Record<Tone, string> = {
  paper: "border-sc-rule text-sc-muted",
  flood: "border-sc-flood-chrome text-sc-flood-chrome",
  midnight: "border-sc-midnight-rule text-sc-midnight-muted",
};

/** Specimen-sheet header: what the section is on the left, one fact on the right. */
export function SectionHead({ left, right, tone = "paper" }: { left: ReactNode; right?: ReactNode; tone?: Tone }) {
  return (
    <div className={`flex items-baseline justify-between gap-5 border-b pb-3 ${ANNOT} ${TONES[tone]}`}>
      <span>{left}</span>
      {right !== undefined ? <span className="text-right tabular-nums">{right}</span> : null}
    </div>
  );
}

export function SpecRows({ rows, className = "" }: { rows: readonly (readonly [string, string])[]; className?: string }) {
  return (
    <ul className={`font-sc-annot text-[10px] tracking-[0.14em] uppercase ${className}`}>
      {rows.map(([label, value]) => (
        <li key={label} className="flex items-baseline justify-between gap-5 border-b border-sc-rule py-3 first:border-t">
          <span className="text-sc-muted">{label}</span>
          <span className="text-right text-sc-graphite">{value}</span>
        </li>
      ))}
    </ul>
  );
}

export function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-block border-t border-sc-rule pt-6 font-sc-annot text-[11px] tracking-[0.16em] uppercase text-sc-muted transition-colors duration-150 hover:text-sc-graphite ${className}`}
    >
      {children}
    </Link>
  );
}

/** The landing page's full-bleed footer with the wordmark cropped off the bottom. */
export function FloodFooter() {
  return (
    <footer className="relative overflow-hidden bg-sc-flood text-sc-flood-text">
      <div className={`${CONTAINER} pt-24`}>
        <nav
          aria-label={`${PRODUCT_NAME} footer`}
          className="flex flex-wrap items-baseline gap-x-8 gap-y-3 pb-4 font-sc-annot text-[11px] tracking-[0.16em] uppercase text-sc-flood-chrome"
        >
          <Link href={ROUTES.home} className="transition-colors duration-150 hover:text-sc-flood-text">
            ← Portfolio
          </Link>
        </nav>
        <p className="font-sc-annot text-[11px] tracking-[0.16em] uppercase text-sc-flood-text">
          Built by{" "}
          <Link href={ROUTES.home} className="underline decoration-1 underline-offset-4 transition-opacity duration-150 hover:opacity-70">
            Jatin Bansal
          </Link>
        </p>
      </div>
      <div className={CONTAINER}>
        <p
          aria-hidden
          className="mt-8 block pb-[0.24em] font-sc-hand text-[min(19vw,272px)] leading-[1.05] whitespace-nowrap select-none text-sc-flood-text lowercase"
        >
          {PRODUCT_NAME}
        </p>
      </div>
    </footer>
  );
}

/** Inner pages close with a single quiet row of links. */
export function PlainFooter() {
  return (
    <footer className={`${CONTAINER} pb-16`}>
      <nav
        aria-label={`${PRODUCT_NAME} footer`}
        className={`flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-sc-rule pt-6 ${ANNOT} text-sc-muted`}
      >
        <Link href={SCRAWL_ROUTES.home} className={MUTED_LINK}>
          ← {PRODUCT_NAME}
        </Link>
      </nav>
    </footer>
  );
}
