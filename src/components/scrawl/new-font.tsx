"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fontRoute } from "@/components/scrawl/scrawl-chrome";
import { createFont, getFont, useHasHydrated } from "@/lib/scrawl/storage";

/** Starts a fresh font and opens it. An old `?font=` link opens that font instead. */
export function NewFont() {
  const hydrated = useHasHydrated();
  const router = useRouter();
  const requested = useSearchParams().get("font");
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    const id = requested && getFont(requested) ? requested : createFont("Untitled Hand").id;
    router.replace(fontRoute(id));
  }, [hydrated, requested, router]);

  return (
    <main id="main-content" className="flex h-dvh items-center justify-center">
      <p className="text-[10px] tracking-[0.16em] text-sc-muted uppercase">Opening…</p>
    </main>
  );
}
