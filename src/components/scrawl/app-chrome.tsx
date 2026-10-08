import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/scrawl/scrawl-icons";
import { fontRoute, PRODUCT_NAME, SCRAWL_ROUTES, type FontTab } from "@/components/scrawl/scrawl-chrome";

interface AppHeaderProps {
  title?: ReactNode;
  nav?: ReactNode;
  right?: ReactNode;
  homeHref?: string;
  sticky?: boolean;
}

/** The thin top bar shared by the editor, the studio and My Fonts. */
export function AppHeader({ title, nav, right, homeHref = SCRAWL_ROUTES.fonts, sticky = false }: AppHeaderProps) {
  return (
    <header
      className={`z-40 flex shrink-0 items-center justify-between gap-x-6 gap-y-1 border-b border-sc-rule bg-sc-paper px-4 py-2.5 sm:px-6 ${
        sticky ? "sticky top-0" : "relative"
      }`}
    >
      <div className="flex min-w-0 items-center gap-5">
        <Link href={homeHref} className="tracking-[0.3em] uppercase hover:opacity-60">
          {PRODUCT_NAME}
        </Link>
        {title}
        {nav}
      </div>
      {right ? <div className="flex items-center gap-4 text-[10px] text-sc-muted">{right}</div> : null}
    </header>
  );
}

const TABS: { id: FontTab; label: string; icon: IconName }[] = [
  { id: "draw", label: "Draw", icon: "pencil" },
  { id: "review", label: "Review", icon: "ruler" },
  { id: "export", label: "Export", icon: "download" },
];

export function FontTabs({ id, active }: { id: string; active: FontTab }) {
  return (
    <nav aria-label="Font" className="hidden items-center gap-4 sm:flex">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={fontRoute(id, tab.id)}
          aria-current={tab.id === active ? "page" : undefined}
          className={`flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase ${
            tab.id === active ? "text-sc-graphite" : "text-sc-muted hover:text-sc-graphite"
          }`}
        >
          <Icon name={tab.icon} size={12} />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function Progress({ drawn, total }: { drawn: number; total: number }) {
  return (
    <span className="flex items-center gap-2 text-[10px] tabular-nums" title={`${drawn} of ${total} drawn`}>
      <span className="text-sc-graphite">
        {drawn}/{total}
      </span>
      <span className="relative hidden h-px w-[52px] bg-sc-rule sm:block">
        <span className="absolute top-0 left-0 h-px bg-sc-graphite" style={{ width: `${(drawn / total) * 100}%` }} />
      </span>
    </span>
  );
}

export function StatusDot({ label }: { label: string }) {
  return (
    <span className="group relative flex items-center">
      <span role="status" aria-label={label} className="block size-[7px] shrink-0 rounded-full border border-[#3f9142] bg-[#3f9142]" />
      <span className="pointer-events-none absolute top-[15px] right-[-8px] z-50 hidden border border-sc-graphite bg-sc-paper px-2.5 py-1.5 text-[10px] tracking-[0.14em] whitespace-nowrap text-sc-graphite uppercase shadow-[0_8px_28px_-14px_rgba(0,0,0,0.45)] group-hover:block">
        {label}
      </span>
    </span>
  );
}

export function PanelSection({ title, meta, children }: { title: ReactNode; meta?: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-t border-sc-rule pt-3 pb-3 first:border-t-0">
      <div className="flex items-baseline justify-between pb-1">
        <h2 className="text-[10px] tracking-[0.18em] uppercase">{title}</h2>
        {meta !== undefined ? <span className="text-[10px] text-sc-muted uppercase">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export function RangeField({ label, value, min, max, step = 1, suffix = "", onChange }: RangeFieldProps) {
  return (
    <label className="block pt-3 select-none">
      <span className="flex items-baseline justify-between">
        <span className="text-[10px] text-sc-muted uppercase">{label}</span>
        <span className="text-[10px] tabular-nums">
          {value}
          {suffix}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="flex items-baseline justify-between gap-3 pt-3">
      <span className="shrink-0 text-[10px] text-sc-muted uppercase">{label}</span>
      <span className="min-w-0 text-right text-[10px] break-all tabular-nums">{value}</span>
    </span>
  );
}

export function PanelNote({ children }: { children: ReactNode }) {
  return <p className="pt-3 text-[10px] leading-relaxed text-sc-muted uppercase">{children}</p>;
}
