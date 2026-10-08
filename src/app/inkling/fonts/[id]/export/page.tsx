import type { Metadata } from "next";
import { FontWorkspace } from "@/components/scrawl/font-workspace";

export const metadata: Metadata = {
  title: "Export · Inkling",
  robots: { index: false, follow: false },
};

export default async function FontExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FontWorkspace id={id} tab="export" />;
}
