import { Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans, Shadows_Into_Light_Two } from "next/font/google";

/** App chrome: the editor, studio and every small uppercase control. */
export const scrawlMono = Geist_Mono({
  variable: "--font-scrawl-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/** Specimen-sheet annotations on the marketing pages. */
export const scrawlAnnot = IBM_Plex_Mono({
  variable: "--font-scrawl-annot",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/** Long-form body copy. */
export const scrawlBody = IBM_Plex_Sans({
  variable: "--font-scrawl-body",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

/** House hand until the visitor draws their own. */
export const scrawlHand = Shadows_Into_Light_Two({
  variable: "--font-scrawl-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const SCRAWL_FONT_VARIABLES = [scrawlMono, scrawlAnnot, scrawlBody, scrawlHand]
  .map((font) => font.variable)
  .join(" ");
