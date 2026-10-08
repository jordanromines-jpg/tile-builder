/* The look picker (3.0): each look shown live (a little card and button drawn in that look, because a look's styles
   apply to any element marked data-look, not only to the page), its name, and one line. Used in grown-ups Settings, in
   the first-run card and on the Library (Jordan: "Also on the Library"). Picking one changes the whole app at once. */
import { chooseLook } from "../looks/apply";
import { LOOKS, type LookId } from "../looks/looks";
import { useLook } from "../looks/useLook";
import { TilePicture } from "./TileChip";

function Preview({ look }: { look: LookId }) {
  return (
    <span data-look={look} className="ts-preview pointer-events-none relative flex h-[120px] w-full items-end justify-between gap-3 overflow-hidden rounded-md bg-surface p-3" aria-hidden="true">
      <span className="ts-card soft flex h-full flex-1 flex-col overflow-hidden rounded-[14px] border-2 border-line bg-surface-2">
        <span className="ts-card-picture flex flex-1 items-center justify-center bg-stage">
          <TilePicture shape="tri-equilateral" colour="red" px={28} />
          <TilePicture shape="square" colour="blue" px={28} />
          <TilePicture shape="square" colour="yellow" px={28} />
        </span>
        <span className="ts-card-title px-2 py-1 font-display text-[15px] font-bold text-ink-1">A castle</span>
      </span>
      <span className="ts-button ts-button-accent ts-button-primary soft grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-accent font-kid text-[13px] font-bold text-accent-ink">Next</span>
    </span>
  );
}

export function LookPicker({ size = "big", show = LOOKS.map((l) => l.id) }: { size?: "big" | "small"; show?: LookId[] }) {
  const current = useLook();
  return (
    <div role="radiogroup" aria-label="Look" className={`ts-looks grid gap-4 ${size === "big" ? "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"}`}>
      {LOOKS.filter((l) => show.includes(l.id)).map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={current === l.id}
          onClick={() => chooseLook(l.id)}
          className="ts-look press flex flex-col gap-2 rounded-lg border-2 border-line bg-surface-2 p-3 text-left aria-checked:border-accent aria-checked:ring-4 aria-checked:ring-focus"
        >
          <Preview look={l.id} />
          <span className="font-display text-[20px] font-bold text-ink-1">{l.name}</span>
          {size === "big" && <span className="text-ink-2">{l.blurb}</span>}
        </button>
      ))}
    </div>
  );
}
