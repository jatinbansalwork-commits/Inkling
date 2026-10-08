import type { Metadata } from "next";
import { MyFonts } from "@/components/scrawl/my-fonts";

export const metadata: Metadata = {
  title: "My Fonts · Inkling",
  robots: { index: false, follow: true },
};

export default function ScrawlFontsPage() {
  return <MyFonts />;
}
