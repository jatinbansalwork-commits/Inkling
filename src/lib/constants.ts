export const SITE_NAME = "JB Portfolio";

/** Platform page canvas — matches detail.design `--surface` / CSS `--site-canvas`. */
export const SITE_CANVAS = "#09090b";

/** Soft sky accent — Manifest, footer (`--brand-accent`). */
export const BRAND_ACCENT = "#a3d9ff";

/**
 * Presence cyan — cursor label, case-study minimap beam, 404 CTA, darkroom accents.
 * Matches CSS `--presence-accent`.
 */
export const PRESENCE_ACCENT = "#02BCEA";
export const PRESENCE_ACCENT_FOREGROUND = "#0A0A0A";

/** Near-black studio canvas when darkroom mode is on (`--darkroom-canvas`). */
export const DARKROOM_CANVAS = "#050507";

export const ROUTES = {
  home: "/",
  craft: "/craft",
  garage: "/garage",
  projects: "/projects",
  ciscoPolicyCopilot: "/projects/cisco-policy-copilot",
  ideas: "/ideas",
  archive: "/archive",
  fieldNotesOne: "/notes/1",
  scrawl: "/inkling",
} as const;

/** Index Craft slide — opens Design to Build in a new tab. */
export const CRAFT_EXTERNAL_URL = "https://design-to-build.vercel.app/" as const;

export const FRAMES = [
  {
    id: "hero",
    type: "hero" as const,
    variant: "main" as const,
    label: SITE_NAME,
  },
  {
    id: "projects",
    type: "section" as const,
    variant: "slide" as const,
    label: "Case Studies",
    monogram: "Project",
    monogramPan: true,
    href: ROUTES.projects,
  },
  {
    id: "experiments",
    type: "section" as const,
    variant: "slide" as const,
    label: "Craft",
    monogram: "Craft",
    href: CRAFT_EXTERNAL_URL,
  },
  {
    id: "archive",
    type: "section" as const,
    variant: "slide" as const,
    label: "Case Notes",
    fieldNotesTitle: "JB's Case Notes",
    href: ROUTES.fieldNotesOne,
  },
  {
    id: "design-review-checklist",
    type: "section" as const,
    variant: "slide" as const,
    label: "Design Review",
    mobileNavLabel: "Review",
    monogramImage: "/assets/index/article-cursor-hand.png",
    monogramWireframeImage: "/assets/index/article-cursor-hand-wireframe.png",
    href: `${ROUTES.craft}/design-review-checklist`,
  },
  {
    id: "garage",
    type: "section" as const,
    variant: "slide" as const,
    label: "Garage",
    monogram: "Garage",
    monogramTyping: true,
    href: ROUTES.garage,
  },
  {
    id: "scrawl",
    type: "section" as const,
    variant: "slide" as const,
    label: "Inkling",
    scrawlDemo: true,
    href: ROUTES.scrawl,
    openInNewTab: true,
  },
  {
    id: "manifest",
    type: "manifest" as const,
    variant: "default" as const,
    label: "Manifest",
  },
  {
    id: "contact",
    type: "contact" as const,
    variant: "default" as const,
    label: "Contact",
  },
] as const;

/** Total slides on the index page — derived from `FRAMES`. */
export const SLIDE_COUNT = FRAMES.length;

export const FRAME_WIDTH = 1200;
export const FRAME_HEIGHT = 720;
export const FRAME_STRIDE = 1240;
/** Scroll distance between index slides at the settled 0.6 scale — see `getIndexScrollPerFrame`. */
export const SCROLL_PER_FRAME = 744;

/** Full horizontal track width for all frames. */
export const TRACK_WIDTH = FRAME_WIDTH + (SLIDE_COUNT - 1) * FRAME_STRIDE;

/** Intra-slide parallax — content lag inside slide panels. */
export const PARALLAX_STEP_DIVISOR_DESKTOP = 3;
export const PARALLAX_STEP_DIVISOR_TOUCH = 5;
export const PARALLAX_MAX_DEFAULT = Math.round(FRAME_STRIDE * 0.65);

export const MINIMAP_LINE_WIDTH = 1;
export const MINIMAP_LINE_GAP = 9;
export const MINIMAP_LINE_HEIGHT = 18;
export const MINIMAP_LINE_COUNT = 20;
export const MINIMAP_TRACKER_WIDTH = 30;
export const MINIMAP_RANGE = 160;

/** Bottom offset for floating index chrome (slide nav) — respects home-indicator safe area. */
export const INDEX_FLOATING_BOTTOM =
  "bottom-[max(2rem,env(safe-area-inset-bottom))]";

/** Scroll hint sits above slide nav + safe area. */
export const INDEX_SCROLL_HINT_BOTTOM =
  "bottom-[max(7.25rem,calc(env(safe-area-inset-bottom)+6.25rem))]";

/** Minimap / top index chrome — clear notch and Dynamic Island. */
export const INDEX_MINIMAP_TOP =
  "top-[max(4rem,env(safe-area-inset-top))]";

/** Canvas scale floor + viewport fit for the index slider. */
export const SCALE_MIN = 0.6;
export const SCALE_BASE_MIN = 0.2;
export const SCALE_SCROLL_FACTOR = 0.0001;
export const SCALE_VIEWPORT_WIDTH = 1300;
export const SCALE_VIEWPORT_HEIGHT = 1020;
/** Manifest slide rests 15% larger; fades to 1× over the last scroll segment. */
export const INDEX_MANIFEST_STAGE_SCALE = 1.15;

export const HERO_LINES = [
  "Howdy, I'm JB.",
  "Designing security solutions — for 300,000+ organizations worldwide.",
] as const;

export const HERO_COPY = HERO_LINES.join(" ");

export const MANIFEST_LINES = [
  "Make it soulful.",
  "Make it fast.",
  "Make it beautiful.",
  "Make it consistent.",
  "Make it timeless.",
  "Make it.",
] as const;

export const CONTACT_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jatin-bansal-design/",
    position: "top-left" as const,
  },
  {
    label: "JB Manual",
    href: "https://uxjatin.notion.site/Jatin-user-manual-4026f4a37be346d98265f180d53ce38e",
    position: "top-right" as const,
  },
  {
    label: "Resume",
    href: "https://drive.google.com/file/d/131bqNVXBR5imDFiYrRZl705ON4L7I3Fa/view?usp=sharing",
    position: "bottom-right" as const,
  },
  {
    label: "GitHub",
    href: "https://github.com/jatinbansalwork-commits",
    position: "bottom-left" as const,
  },
] as const;

export const CONTACT_EMAIL = "jatinbansal.work@gmail.com";

/** Direct line for hiring enquiries in JB_AI. */
export const JB_CONTACT_PHONE = "6362408280";
export const JB_CONTACT_PHONE_TEL = `tel:+91${JB_CONTACT_PHONE}`;
