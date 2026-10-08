import Link from "next/link";
import { ArrowLink, CONTAINER, PRODUCT_NAME, SCRAWL_ROUTES, SectionHead } from "@/components/scrawl/scrawl-chrome";
import { FaqAccordion } from "@/components/scrawl/faq-accordion";
import { WriteOnView } from "@/components/scrawl/write-on-view";
import { BASE_CHARSET, CHARSET, CHARSET_WITH_ACCENTS_COUNT } from "@/lib/scrawl/metrics";
import { WRITE_ON_MS } from "@/lib/scrawl/write-on-word";

const BODY = "max-w-[54ch] font-sc-body text-[16px] leading-[1.7] text-sc-graphite";

const MY_FONTS_ROWS = [
  ["Fonts", "As many as you like"],
  ["Weights", "Regular · Bold"],
  ["Formats", "OTF · WOFF"],
  ["Re-exports", "Unlimited"],
  ["Account", "Not needed"],
  ["Where your fonts live", "This browser"],
] as const;

const FAQ = [
  {
    q: "What do I draw with?",
    a: "Anything that points. A stylus on a tablet is best, a finger on a phone is fine, and a mouse works if you take it slowly. A trackpad is the hardest of the lot.",
  },
  {
    q: "How long does a font take?",
    a: `About twenty minutes for all ${BASE_CHARSET.length} characters. Lowercase alone takes five and is enough to start typing.`,
  },
  {
    q: "What do I get at the end?",
    a: "A zip with Regular and Bold in OTF for desktop apps and WOFF for websites, plus a short readme. Accented letters like é and ñ are built for you from the marks you draw.",
  },
  {
    q: "How many fonts can I make?",
    a: "As many as you like. Every font you start is kept in My Fonts, so you can try a neat hand, a messy one and a marker version side by side.",
  },
  {
    q: "Can I change it after downloading?",
    a: "Yes. The font stays in My Fonts in this browser. Redraw a letter and download again as often as you like.",
  },
  {
    q: "Do I need an account to start?",
    a: "No. Everything is saved in this browser. Clearing your site data deletes your fonts, so keep a download of any you care about.",
  },
] as const;

const ANIMATE_SECONDS = (WRITE_ON_MS / 1000).toFixed(1);

export function StatementBand() {
  return (
    <section className="bg-sc-flood text-sc-flood-text">
      <div className={`${CONTAINER} py-16`}>
        <SectionHead left="Specimen · Statement" right={PRODUCT_NAME} tone="flood" />
        <p className="max-w-[13ch] py-16 font-sc-hand text-[clamp(52px,11vw,136px)] leading-[1.02]">
          You already have a typeface.
        </p>
        <p className="font-sc-annot text-[10px] tracking-[0.16em] uppercase text-sc-flood-chrome">
          It’s on every birthday card you’ve ever written.
        </p>
      </div>
    </section>
  );
}

export function CharacterMapBand() {
  return (
    <section className="border-t border-sc-rule bg-sc-paper">
      <div className={`${CONTAINER} py-20`}>
        <SectionHead left="Specimen · Character Map" right={`${CHARSET.length} characters`} />
        <CharacterGrid chars={CHARSET} className="mt-10" />
        <div className="flex items-baseline justify-between gap-5 pt-4 font-sc-annot text-[10px] tracking-[0.16em] uppercase text-sc-muted">
          <span>Uppercase · Lowercase · Numerals · Punctuation · Symbols</span>
          <span className="tabular-nums">{CHARSET_WITH_ACCENTS_COUNT} with the accents</span>
        </div>
      </div>
    </section>
  );
}

export function CharacterGrid({
  chars,
  className = "",
  fontClass = "font-sc-hand",
}: {
  chars: readonly string[];
  className?: string;
  fontClass?: string;
}) {
  return (
    <div className={`grid grid-cols-7 border-t border-l border-sc-rule sm:grid-cols-10 lg:grid-cols-[repeat(15,minmax(0,1fr))] ${className}`}>
      {chars.map((char) => (
        <span
          key={char}
          title={char}
          className={`flex aspect-square items-center justify-center border-r border-b border-sc-rule ${fontClass} text-[clamp(15px,1.8vw,24px)] text-sc-graphite`}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export function AnimateBand() {
  return (
    <section className="border-t border-sc-rule bg-sc-paper">
      <div className={`${CONTAINER} py-20`}>
        <SectionHead left="Specimen · Animate" right={`${ANIMATE_SECONDS} seconds`} />
        <p className={`${BODY} pt-10`}>
          A font isn’t the only thing your hand can make. Sign your name once and {PRODUCT_NAME} keeps
          the motion, not just the shape. Export it as an SVG that writes itself, or as a React
          component that starts writing when it scrolls into view.
        </p>
        <p className={`${BODY} pt-5`}>
          It’s free and there’s no sign-up. Everything stays in your browser, so there’s no server
          for your signature to end up on.
        </p>
        <div className="max-w-[820px] pt-16 pb-16">
          <WriteOnView className="h-auto w-full text-sc-graphite" />
        </div>
        <ArrowLink href={SCRAWL_ROUTES.animate}>Write your own →</ArrowLink>
      </div>
    </section>
  );
}

export function MyFontsBand() {
  return (
    <section className="bg-sc-midnight-paper text-sc-midnight-ink">
      <div className={`${CONTAINER} py-20`}>
        <SectionHead left="My Fonts" right="No limit" tone="midnight" />
        <div className="grid gap-14 pt-12 lg:grid-cols-2">
          <div>
            <p className="font-sc-body text-[clamp(72px,13vw,140px)] leading-[0.9] text-sc-midnight-accent">∞</p>
            <h2 className="max-w-[18ch] pt-6 font-sc-body text-[clamp(24px,3.2vw,34px)] leading-[1.25] font-semibold">
              Make one hand, or make ten.
            </h2>
            <p className="max-w-[54ch] pt-5 font-sc-body text-[16px] leading-[1.7]">
              Every font you start is saved in this browser. Draw a neat one, a rushed one and a marker
              one, flick between them in My Fonts, and download any of them whenever you like.
            </p>
            <Link
              href={SCRAWL_ROUTES.fonts}
              className="mt-10 inline-block border-t border-sc-midnight-rule pt-6 font-sc-annot text-[11px] tracking-[0.16em] uppercase text-sc-midnight-muted transition-colors duration-150 hover:text-sc-midnight-ink"
            >
              Open my fonts →
            </Link>
          </div>
          <ul className="font-sc-annot text-[11px] tracking-[0.14em] uppercase">
            {MY_FONTS_ROWS.map(([label, value], i) => (
              <li
                key={label}
                className={`flex items-baseline justify-between gap-5 border-b border-sc-midnight-rule py-3 ${i === 0 ? "border-t" : ""}`}
              >
                <span>{label}</span>
                <span className="text-right text-sc-midnight-muted">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function FaqBand() {
  return (
    <section className="border-t border-sc-rule bg-sc-paper">
      <div className={`${CONTAINER} py-20`}>
        <SectionHead left="Questions" right={FAQ.length} />
        <div className="pt-2">
          <FaqAccordion items={FAQ} />
        </div>
      </div>
    </section>
  );
}
