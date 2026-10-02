/* The build badge (plan key 2o), always a shape and words, never colour alone:
   can  — a check and "You can build it!"
   swap — two arrows and "You can build it with a swap"
   need — the missing tiles drawn with their counts and "Need 2 more" */
import type { ShapeId } from "../../engine/catalog";
import { S } from "../../strings";
import { Check } from "../icons";
import { TileChip } from "../TileChip";

export type BuildState = "can" | "swap" | "need";
export interface Missing {
  shape: ShapeId;
  count: number;
}

export function missingTotal(missing: Missing[]): number {
  return missing.reduce((n, m) => n + m.count, 0);
}

export function badgeText(state: BuildState, missing: Missing[] = []): string {
  if (state === "can") return S.kid.can;
  if (state === "swap") return S.kid.swap;
  return S.kid.need(missingTotal(missing));
}

export function BuildBadge({ state, missing = [], size = "sm" }: { state: BuildState; missing?: Missing[]; size?: "sm" | "md" }) {
  const text = badgeText(state, missing);
  const font = size === "sm" ? "var(--fs-parent-body)" : "var(--fs-kid-label-c)";
  if (state === "need") {
    return (
      <span className="inline-flex flex-wrap items-center gap-2 rounded-md bg-wait-bg px-3 py-1 font-kid font-bold text-wait-ink" style={{ fontSize: font }}>
        <span>{text}</span>
        {missing.map((m) => (
          <TileChip key={m.shape} shape={m.shape} count={m.count} size="sm" className="[&_svg]:!h-7 [&_svg]:!w-7 [&>span:last-child]:!text-[20px]" />
        ))}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 rounded-md px-3 py-1 font-kid font-bold ${state === "can" ? "bg-can-bg text-can-ink" : "bg-accent-soft text-ink-1"}`} style={{ fontSize: font }}>
      {state === "can" ? <Check size={20} weight="bold" aria-hidden="true" /> : <span aria-hidden="true">⇄</span>}
      <span>{text}</span>
    </span>
  );
}
