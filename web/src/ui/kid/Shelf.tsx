/* A shelf (plan key 2o; a wooden plank since sprint 2): a row of project cards that scrolls by swipe, or by the ▶ button for a child who taps. */
import { useRef, type ReactNode } from "react";
import { S } from "../../strings";
import { ArrowRight } from "../icons";
import { TARGET, useAge } from "./AgeContext";

export function Shelf({ title, children }: { title: ReactNode; children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const px = TARGET[useAge()];
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-[length:var(--fs-kid-label-b)] font-bold text-ink-1">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={row} className="relative z-[1] -mb-3 flex min-w-0 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-1 pt-2" style={{ scrollbarWidth: "none", scrollPaddingLeft: 4 }}>
            {children}
          </div>
          <div className="plank" aria-hidden="true" />
        </div>
        <button
          type="button"
          aria-label={S.kid.more}
          onClick={() => row.current?.scrollBy({ left: row.current.clientWidth * 0.8, behavior: "smooth" })}
          style={{ width: px, height: px }}
          className="kid press soft grid shrink-0 place-items-center rounded-full border-2 border-line bg-surface-2 text-ink-1"
        >
          <ArrowRight size={32} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
