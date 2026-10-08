import { buildFontBuffer, fileSafeName, otfToWoff, type GlyphMap } from "@/lib/scrawl/font-build";
import type { FontSettings } from "@/lib/scrawl/metrics";
import { createZip, downloadBlob, type ZipEntry } from "@/lib/scrawl/zip";

function readmeText(name: string, base: string): string {
  return [
    `${name}`,
    "",
    `${base}-Regular.otf and ${base}-Bold.otf are for desktop apps: open them and install.`,
    `${base}-Regular.woff and ${base}-Bold.woff are for websites: upload them and use @font-face.`,
    "",
    "Both weights share one family name, so apps group them together.",
    "",
  ].join("\n");
}

export interface PackageFile {
  name: string;
  size: number;
}

/** Builds the zip once so the export screen can list real file sizes before download. */
export async function buildFontPackage(name: string, glyphs: GlyphMap, settings?: Partial<FontSettings>) {
  const family = name.trim() || "Untitled Hand";
  const base = fileSafeName(family);
  const entries: ZipEntry[] = [];

  for (const weight of ["regular", "bold"] as const) {
    const style = weight === "bold" ? "Bold" : "Regular";
    const otf = buildFontBuffer(family, glyphs, weight, settings);
    const woff = await otfToWoff(otf);
    entries.push(
      { name: `${base}/${base}-${style}.otf`, data: new Uint8Array(otf) },
      { name: `${base}/${base}-${style}.woff`, data: new Uint8Array(woff) },
    );
  }
  entries.push({ name: `${base}/README.txt`, data: new TextEncoder().encode(readmeText(family, base)) });

  const zip = createZip(entries);
  const files: PackageFile[] = entries.map((entry) => ({
    name: entry.name.slice(base.length + 1),
    size: entry.data.byteLength,
  }));
  return { zip, files, filename: `${base}.zip` };
}

/** Regular and bold in OTF and WOFF, plus a readme, in one zip. */
export async function downloadFontPackage(name: string, glyphs: GlyphMap, settings?: Partial<FontSettings>) {
  const { zip, filename } = await buildFontPackage(name, glyphs, settings);
  downloadBlob(zip, filename);
}
