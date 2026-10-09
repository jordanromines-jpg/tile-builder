/* The Tiles screen (plan keys 3d, 5e): start from a set, then − and + per shape; colours in a fold; which brands; which
   tall triangle; and what that means: "You can build 14 of 30 projects." Every change saves at once. */
import { useState } from "react";
import { BRAND_IDS, BRANDS, COLOURS, COLOUR_NAMES, SHAPE_IDS, SHAPES, TALL_LEG_CHOICES, type ShapeId } from "../../engine/catalog";
import { canBuildCount, inventoryTotal } from "../../engine/match";
import { SETS, type SetPreset } from "../../engine/sets";
import type { Inventory } from "../../engine/types";
import { PROJECT_INFO, SKELETONS } from "../../projects/load";
import { saveInventory } from "../../store/db";
import { EMPTY_INVENTORY, useInventory } from "../../store/hooks";
import { addSet, applySet, effectiveLeg, setColourCount, setCount, setTallLeg, toggleBrand } from "../../store/inventory";
import { Button } from "../../ui/grownups/Button";
import { ConfirmDialog } from "../../ui/grownups/Dialog";
import { Stepper } from "../../ui/grownups/Stepper";
import { TilePicture } from "../../ui/TileChip";
import { Frame } from "./Frame";
import { summaryLine } from "./Home";

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const CORE: ShapeId[] = ["square", "square-large", "tri-equilateral", "tri-right", "tri-isosceles-tall"];

/** Two squares stacked beside a tall triangle with the given legs: which one looks like yours? */
function LegPicture({ leg }: { leg: number }) {
  const h = Math.sqrt(leg * leg - 0.25);
  const k = 40;
  const H = 2.3 * k;
  return (
    <svg viewBox={`0 0 ${2.3 * k} ${H + 4}`} width={2.3 * k} height={H + 4} aria-hidden="true">
      {[0, 1].map((i) => (
        <rect key={i} x={2} y={H - (i + 1) * k + 2} width={k - 4} height={k - 4} fill="var(--surface-3)" stroke="var(--ink-3)" strokeWidth={3} />
      ))}
      <polygon points={`${k + 6},${H} ${2 * k + 6},${H} ${1.5 * k + 6},${H - h * k}`} fill="var(--tile-purple)" fillOpacity={0.45} stroke="var(--tile-purple-rim)" strokeWidth={3} />
    </svg>
  );
}

export function Tiles() {
  const live = useInventory();
  const inv = live ?? EMPTY_INVENTORY;
  const [preset, setPreset] = useState<SetPreset | null>(null);
  const [special, setSpecial] = useState(false);
  const save = (next: Inventory) => void saveInventory(next);
  const showExtras = special || inv.brands.includes("connetix") || SHAPE_IDS.some((s) => !CORE.includes(s) && (inv.counts[s]?.any ?? 0) > 0);
  const shapes = showExtras ? SHAPE_IDS : CORE;
  // 4.3: the colours the family's brands make (every colour when it isn't known)
  const colours = COLOURS.filter((col) => !inv.brands.length || inv.brands.includes("generic") || inv.brands.some((b) => BRANDS[b].colours.includes(col)));
  const leg = effectiveLeg(inv);
  return (
    <Frame title="Your tiles">
      <p className="text-[length:var(--fs-parent-heading)]" data-testid="summary">
        {summaryLine(inventoryTotal(inv), canBuildCount(SKELETONS, inv), PROJECT_INFO.length)}
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[length:var(--fs-parent-heading)] font-semibold">Start from a set</h2>
        <p className="text-ink-2">Pick the set you have, then count up or down for the tiles that are lost or extra. Two sets? Pick one, then the other, and add it.</p>
        <div className="flex flex-wrap gap-2">
          {SETS.map((s) => (
            <Button key={s.id} onClick={() => setPreset(s)}>
              {s.name}
            </Button>
          ))}
        </div>
        <ConfirmDialog
          open={!!preset}
          onOpenChange={(o) => !o && setPreset(null)}
          title={`Use ${preset?.name ?? ""}?`}
          description={
            inventoryTotal(inv)
              ? `This replaces the counts below. Have two sets? Add this one to the ${inventoryTotal(inv)} tiles you have instead.`
              : `${preset?.total ?? ""} tiles.`
          }
          confirm="Use this set"
          onConfirm={() => preset && save(applySet(inv, preset))}
          also={inventoryTotal(inv) ? { label: "Add this set too", onClick: () => preset && save(addSet(inv, preset)) } : undefined}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-[length:var(--fs-parent-heading)] font-semibold">How many of each</h2>
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface-2">
          {shapes.map((s) => {
            const c = inv.counts[s];
            const n = c?.any ?? 0;
            const plain = n - COLOURS.reduce((k, col) => k + (c?.byColour?.[col] ?? 0), 0);
            return (
              <li key={s} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center gap-3">
                  <TilePicture shape={s} px={48} leg={leg} />
                  <span className="flex-1 font-bold">{cap(SHAPES[s].plural)}</span>
                  <Stepper label={SHAPES[s].plural} value={n} onChange={(v) => save(setCount(inv, s, v))} />
                </div>
                {n > 0 && (
                  <details className="ml-[60px]">
                    <summary className="min-h-11 cursor-pointer py-2 text-ink-2">Colours</summary>
                    {plain > 0 && (
                      <p className="pb-2 text-ink-2">
                        {plain} without a colour: builds take them as an even mix of {colours.length === COLOURS.length ? "every colour" : "your tiles' colours"}.
                      </p>
                    )}
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {colours.map((col) => (
                        <li key={col} className="flex items-center gap-2">
                          <TilePicture shape="square" colour={col} px={28} />
                          <span className="flex-1">{cap(COLOUR_NAMES[col])}</span>
                          <Stepper label={`${COLOUR_NAMES[col]} ${SHAPES[s].plural}`} value={c?.byColour?.[col] ?? 0} onChange={(v) => save(setColourCount(inv, s, col, v))} />
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
        {!showExtras && (
          <Button kind="quiet" className="self-start" onClick={() => setSpecial(true)}>
            Show rectangles, windows, doors and fences
          </Button>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[length:var(--fs-parent-heading)] font-semibold">Brands</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Brands">
          {BRAND_IDS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={inv.brands.includes(b)}
              onClick={() => save(toggleBrand(inv, b))}
              className="min-h-11 rounded-md border-2 border-line bg-surface-2 px-4 font-bold aria-pressed:border-accent aria-pressed:bg-accent-soft"
            >
              {BRANDS[b].label}
            </button>
          ))}
        </div>
        {inv.brands.length > 1 && <p className="text-ink-2">Brands differ a little in size, so big closed rings work best with one brand.</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[length:var(--fs-parent-heading)] font-semibold">Your tall triangle</h2>
        <p className="text-ink-2">Lay a tall triangle next to two squares. Which picture matches?</p>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Tall triangle">
          {TALL_LEG_CHOICES.map((l, i) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={Math.abs(leg - l) < 0.02}
              aria-label={["Shorter than two squares", "Nearly two squares", "Taller than two squares"][i]}
              onClick={() => save(setTallLeg(inv, l))}
              className="flex flex-col items-center gap-1 rounded-lg border-2 border-line bg-surface-2 p-3 aria-checked:border-accent aria-checked:bg-accent-soft"
            >
              <LegPicture leg={l} />
              <span className="text-[length:var(--fs-parent-small)] text-ink-2">{["Shorter", "Nearly two squares", "Taller"][i]}</span>
            </button>
          ))}
        </div>
      </section>
    </Frame>
  );
}
