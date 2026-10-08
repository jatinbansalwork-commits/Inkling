import type { Metadata } from "next";
import { SCRAWL_FONT_VARIABLES } from "@/lib/scrawl/fonts";
import { buildPageMetadata } from "@/lib/seo";
import "./inkling.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Inkling — Create a Font in Your Own Handwriting",
  description:
    "Draw each letter in the browser, watch it set as you type, and download OTF and WOFF files that are yours to keep. A product study by Jatin Bansal.",
  path: "/inkling",
  keywords: ["handwriting font", "font maker", "OpenType", "product design", "Jatin Bansal"],
});

export default function ScrawlLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`scrawl-root ${SCRAWL_FONT_VARIABLES} min-h-dvh`}>{children}</div>;
}
