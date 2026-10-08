import type { Metadata } from "next";
import { AnimateStudio } from "@/components/scrawl/animate-studio";

export const metadata: Metadata = {
  title: "Animate Your Signature · Inkling",
  description: "Write your name once and export it as an SVG or React component that draws itself.",
};

export default function ScrawlAnimatePage() {
  return <AnimateStudio />;
}
