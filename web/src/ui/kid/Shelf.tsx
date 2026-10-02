/* A shelf (plan key 2o): a row of project cards that scrolls by swipe, or by the ▶ button for a child who taps. */
import { useRef, type ReactNode } from "react";
import { S } from "../../strings";
import { ArrowRight } from "../icons";
import { TARGET, useAge } from "./AgeContext";

export function Shelf({ title, children }: { title: ReactNode; children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const px = TARGET[useAge()];
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-[length:var(--fs-kid-label-b)] font-semibold text-ink-1">{title}</h2>
      <div className="flex items-stretch gap-3">
        <div ref={row} className="flex min-w-0 flex-1 snap-x gap-4 overflow-x-auto scroll-smooth pb-2" style={{ scrollbarWidth: "none" }}>
          {children}
        </div>
        <button
          type="button"
          aria-label={S.kid.more}
          onClick={() => row.current?.scrollBy({ left: row.current.clientWidth * 0.8, behavior: "smooth" })}
          style={{ width: px }}
          className="kid grid shrink-0 place-items-center rounded-lg border-2 border-line bg-surface-2 text-ink-1 active:scale-95"
        >
          <ArrowRight size={32} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
