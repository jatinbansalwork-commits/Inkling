"use client";

import { useId, useState } from "react";

type FaqItem = { readonly q: string; readonly a: string };

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="border-t border-sc-rule first:border-t-0">
      <h3 className="tracking-normal">
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          data-open={open || undefined}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full cursor-pointer items-baseline justify-between gap-6 py-5 text-left"
        >
          <span className="font-sc-body text-[17px] leading-[1.45] font-semibold text-sc-graphite transition-colors duration-150 group-hover:text-sc-accent">
            {item.q}
          </span>
          <span
            aria-hidden
            className="shrink-0 font-sc-annot text-[13px] leading-none text-sc-muted transition-colors duration-150 group-hover:text-sc-accent group-data-open:text-sc-accent"
          >
            {open ? "−" : "+"}
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[62ch] pb-6 font-sc-body text-[15.5px] leading-[1.7] text-sc-muted">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

/** Questions that slide open and closed, one panel per row. */
export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="border-b border-sc-rule">
      {items.map((item) => (
        <FaqRow key={item.q} item={item} />
      ))}
    </div>
  );
}
