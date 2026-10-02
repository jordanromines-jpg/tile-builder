/* The swap note (plan key 2o): what stands in for what, drawn and written. */
import type { ShapeId } from "../../engine/catalog";
import { TileChip } from "../TileChip";

export function SwapNote({ from, to, text }: { from: ShapeId; to: ShapeId; text: string }) {
  return (
    <p className="flex items-center gap-3 rounded-md bg-accent-soft px-4 py-2 font-kid text-[length:var(--fs-kid-label-c)] text-ink-1">
      <TileChip shape={from} size="sm" />
      <span aria-hidden="true">→</span>
      <TileChip shape={to} size="sm" instead />
      <span className="text-[length:var(--fs-parent-body)] font-bold">{text}</span>
    </p>
  );
}
