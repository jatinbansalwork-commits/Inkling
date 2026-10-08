import { Suspense } from "react";
import type { Metadata } from "next";
import { NewFont } from "@/components/scrawl/new-font";

export const metadata: Metadata = {
  title: "Make Your Font · Inkling",
  robots: { index: false, follow: true },
};

export default function ScrawlMakePage() {
  return (
    <Suspense>
      <NewFont />
    </Suspense>
  );
}
