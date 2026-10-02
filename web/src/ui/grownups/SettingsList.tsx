/* A settings list (plan key 2q): rows with a rule between them on one card. */
import type { ReactNode } from "react";

export function SettingsList({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="font-display text-[length:var(--fs-parent-heading)] font-semibold">{title}</h2>}
      <div className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface-2 [&>*]:px-4 [&>*]:py-3">{children}</div>
    </section>
  );
}
