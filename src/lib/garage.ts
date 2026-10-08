export type GarageStatus = "new" | "tuning" | "complete";

export interface GarageEntry {
  slug: string;
  title: string;
  summary: string;
  status: GarageStatus;
  updated: string;
  /** Finishes the header sentence that starts with the title. */
  tagline: string;
  /** Short lessons from building it, shown under the playground. */
  notes: string[];
}

export const GARAGE_TAGLINE = "A workbench for interface components";

export interface GarageNavItem {
  label: string;
  /** Route segment under /garage. Items without one are not built yet and render struck through. */
  slug?: string;
}

export interface GarageNavGroup {
  title: string;
  items: GarageNavItem[];
}

export const GARAGE_NAV: GarageNavGroup[] = [
  {
    title: "Introduction",
    items: [{ label: "Purpose", slug: "" }, { label: "Principles" }, { label: "Styling" }],
  },
  {
    title: "Foundations",
    items: [{ label: "Colours" }, { label: "Typography" }, { label: "Iconography" }],
  },
  {
    title: "Controls",
    items: [
      { label: "Button", slug: "button" },
      { label: "Input", slug: "input" },
      { label: "Select" },
      { label: "Textarea" },
      { label: "Checkbox" },
      { label: "Radio" },
      { label: "Switch" },
      { label: "Slider" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Command Menu" },
      { label: "Dialog" },
      { label: "Combobox" },
      { label: "Tooltip" },
      { label: "Sidebar" },
    ],
  },
];

export const GARAGE_ENTRIES: GarageEntry[] = [
  {
    slug: "button",
    title: "Button",
    summary: "One button, three independent props, and all the small details that make a press feel physical.",
    tagline: "starts an action when pressed.",
    status: "complete",
    updated: "Oct 2026",
    notes: [
      "Below roughly 0.9 scale the press stops reading as feedback and starts reading as a glitch.",
      "Low damping is fun for ten seconds and tiring after that. Most buttons want to settle in one bounce, or none.",
      "The shadow carries as much of the press as the scale does. Drop it and the button feels flat even with a perfect spring.",
    ],
  },
  {
    slug: "input",
    title: "Input",
    summary: "A single-line text field that shares its sizes, colours and shapes with the Button, so the two line up in a form.",
    tagline: "takes a single line of text.",
    status: "new",
    updated: "Oct 2026",
    notes: [
      "Heights match the Button exactly, so an input and a button sit on one line without nudging.",
      "Disabled stays focusable through aria-disabled and readOnly, the same rule the Button follows.",
      "The colour only shows up on focus, in the border, ring and caret. At rest every input looks the same.",
    ],
  },
  {
    slug: "gooey-tooltip",
    title: "Gooey Tooltip",
    tagline: "melts out of its trigger instead of fading in.",
    summary: "A panel that melts out of its trigger instead of fading in, so it's obvious where it came from.",
    status: "new",
    updated: "Oct 2026",
    notes: [
      "The goo is a blur followed by a hard alpha threshold. More blur gives a thicker, slower-looking bridge.",
      "Text never goes through the filter. It sits on its own layer and fades in once the shape has settled, so it stays sharp.",
      "Turn the goo off to see the same motion without the filter. It works, but you lose the sense that the panel belongs to the button.",
    ],
  },
  {
    slug: "minimap",
    title: "Minimap",
    tagline: "magnifies a strip of ticks under the cursor.",
    summary: "A strip of ticks that swells under the cursor like a magnifier, with a playhead that springs to wherever you click.",
    status: "tuning",
    updated: "Oct 2026",
    notes: [
      "Each tick's height comes from a bell curve around the pointer, so neighbours rise together instead of one at a time.",
      "Spread matters more than lift. Too narrow and it looks like a single spike; too wide and the magnifier effect disappears.",
      "Fading the swell in and out on enter and leave stops the ticks snapping when the pointer crosses the edge.",
    ],
  },
  {
    slug: "dev-tools",
    title: "Dev Tools Menu",
    tagline: "grows from a badge into a full menu.",
    summary: "A floating badge that grows into a full menu, keeping one continuous shape the whole way.",
    status: "new",
    updated: "Oct 2026",
    notes: [
      "One container animates its size and corner radius, so the badge and the menu read as the same object.",
      "Content cross-fades with a little blur. Without it, text visibly stretches during the morph.",
      "The hover highlight shares one animated pill across rows, so it slides instead of blinking.",
    ],
  },
];

export function getGarageEntry(slug: string): GarageEntry | undefined {
  return GARAGE_ENTRIES.find((entry) => entry.slug === slug);
}

export const GARAGE_STATUS_LABEL: Record<GarageStatus, string> = {
  new: "New",
  tuning: "Tuning",
  complete: "Complete",
};
