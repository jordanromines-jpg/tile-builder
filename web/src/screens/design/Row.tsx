import type { ReactNode } from "react";

export function Row({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="border-t border-line py-6">
      <h2 className="mb-1 font-display text-[length:var(--fs-parent-heading)] font-semibold">{title}</h2>
      {note && <p className="mb-3 max-w-prose text-ink-2">{note}</p>}
      <div className="flex flex-wrap items-end gap-4">{children}</div>
    </section>
  );
}
