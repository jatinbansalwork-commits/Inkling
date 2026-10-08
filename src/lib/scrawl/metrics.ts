/** Font units. Strokes are stored in these units, y pointing up, baseline at 0. */
export const UNITS_PER_EM = 1000;
export const FONT_ASCENDER = 950;
export const FONT_DESCENDER = -300;

/** The drawing box spans this range, so a stroke anywhere in it lands in the font. */
export const BOX_TOP = 1000;
export const BOX_BOTTOM = -300;
export const BOX_WIDTH = 940;
export const BOX_HEIGHT = BOX_TOP - BOX_BOTTOM;

export const GUIDE_LINES = [
  { id: "asc", label: "ASC", y: 800 },
  { id: "cap", label: "CAP", y: 700 },
  { id: "x", label: "X", y: 480 },
  { id: "base", label: "BASE", y: 0 },
  { id: "desc", label: "DESC", y: -200 },
] as const;

export const X_HEIGHT = 480;
export const CAP_HEIGHT = 700;

/** Half the pen width in font units. */
export const PEN_RADIUS = { regular: 26, bold: 50 } as const;
export type FontWeightName = keyof typeof PEN_RADIUS;

export const SIDE_BEARING = 40;
export const SPACE_ADVANCE = 320;

/** Per-font knobs from the Draw and Review screens. Brush is the full pen width. */
export interface FontSettings {
  brush: Record<FontWeightName, number>;
  sideBearing: number;
  wordSpace: number;
}

export const DEFAULT_SETTINGS: FontSettings = {
  brush: { regular: PEN_RADIUS.regular * 2, bold: PEN_RADIUS.bold * 2 },
  sideBearing: SIDE_BEARING,
  wordSpace: SPACE_ADVANCE,
};

export const BRUSH_RANGE = { min: 12, max: 180 } as const;
export const SIDE_BEARING_RANGE = { min: 0, max: 160 } as const;
export const WORD_SPACE_RANGE = { min: 120, max: 600 } as const;

export function resolveSettings(settings?: Partial<FontSettings>): FontSettings {
  return {
    brush: { ...DEFAULT_SETTINGS.brush, ...settings?.brush },
    sideBearing: settings?.sideBearing ?? DEFAULT_SETTINGS.sideBearing,
    wordSpace: settings?.wordSpace ?? DEFAULT_SETTINGS.wordSpace,
  };
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");
const NUMERALS = "0123456789".split("");
const PUNCTUATION = [".", ",", ":", ";", "'", '"', "!", "?", "-", "_", "(", ")", "[", "]", "{", "}", "/", "\\", "*", "&", "@"];
const SYMBOLS = ["#", "₹", "$", "£", "€", "%", "+", "=", "<", ">", "|", "~", "^", "`"];
export const MARKS = { grave: "`", acute: "´", circumflex: "ˆ", tilde: "˜", diaeresis: "¨", ring: "˚", cedilla: "¸" } as const;

/** The glyphs drawn one by one. The grave doubles as a symbol and an accent mark. */
export const CHARACTER_GROUPS = [
  { id: "upper", label: "Uppercase", chars: UPPERCASE },
  { id: "lower", label: "Lowercase", chars: LOWERCASE },
  { id: "numerals", label: "Numerals", chars: NUMERALS },
  { id: "punctuation", label: "Punctuation", chars: PUNCTUATION },
  { id: "symbols", label: "Symbols", chars: SYMBOLS },
] as const;

export const ACCENT_MARKS: string[] = Object.values(MARKS);

export const BASE_CHARSET: string[] = CHARACTER_GROUPS.flatMap((group) => [...group.chars]);

/** Every drawable glyph: the base set plus the marks that aren't already in it. */
export const CHARSET: string[] = [...BASE_CHARSET, ...ACCENT_MARKS.filter((mark) => !BASE_CHARSET.includes(mark))];

export const GLYPH_NAMES: Partial<Record<string, string>> = {
  "&": "ampersand",
  "₹": "rupee",
  "<": "less",
  ">": "greater",
  "`": "grave",
  "´": "acute",
  "ˆ": "circumflex",
  "˜": "tilde",
  "¨": "diaeresis",
  "˚": "ring",
  "¸": "cedilla",
};

type MarkName = keyof typeof MARKS;

/** Accented letters built from a drawn base letter plus a drawn mark. */
const ACCENT_RECIPES: Record<string, [string, MarkName][]> = {
  a: [["à", "grave"], ["á", "acute"], ["â", "circumflex"], ["ã", "tilde"], ["ä", "diaeresis"], ["å", "ring"]],
  e: [["è", "grave"], ["é", "acute"], ["ê", "circumflex"], ["ë", "diaeresis"]],
  i: [["ì", "grave"], ["í", "acute"], ["î", "circumflex"], ["ï", "diaeresis"]],
  o: [["ò", "grave"], ["ó", "acute"], ["ô", "circumflex"], ["õ", "tilde"], ["ö", "diaeresis"]],
  u: [["ù", "grave"], ["ú", "acute"], ["û", "circumflex"], ["ü", "diaeresis"]],
  y: [["ý", "acute"], ["ÿ", "diaeresis"]],
  n: [["ñ", "tilde"]],
  c: [["ç", "cedilla"]],
};

export interface AccentComposite {
  char: string;
  base: string;
  mark: string;
  below: boolean;
}

export const ACCENT_COMPOSITES: AccentComposite[] = Object.entries(ACCENT_RECIPES).flatMap(
  ([base, recipes]) =>
    recipes.flatMap(([char, mark]) => {
      const lower = { char, base, mark: MARKS[mark], below: mark === "cedilla" };
      const upperChar = char.toUpperCase();
      if (upperChar === char) return [lower];
      return [lower, { ...lower, char: upperChar, base: base.toUpperCase() }];
    }),
);

export const CHARSET_WITH_ACCENTS_COUNT = CHARSET.length + ACCENT_COMPOSITES.length;

export const PANGRAM = "The quick brown fox jumps over the lazy dog.";

export const SPECIMEN_LINE =
  "Pack my box with five dozen liquor jugs, then write it again smaller to see whether the letters still hold.";
