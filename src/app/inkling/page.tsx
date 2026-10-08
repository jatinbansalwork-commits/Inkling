import { FloodFooter, SiteHeader } from "@/components/scrawl/scrawl-chrome";
import { ScrawlHero } from "@/components/scrawl/scrawl-hero";
import {
  AnimateBand,
  CharacterMapBand,
  FaqBand,
  MyFontsBand,
  StatementBand,
} from "@/components/scrawl/scrawl-landing";

export default function ScrawlPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <ScrawlHero />
        <StatementBand />
        <CharacterMapBand />
        <AnimateBand />
        <MyFontsBand />
        <FaqBand />
      </main>
      <FloodFooter />
    </>
  );
}
