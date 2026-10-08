import { redirect } from "next/navigation";
import { fontRoute } from "@/components/scrawl/scrawl-chrome";

export default async function FontPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(fontRoute(id, "draw"));
}
