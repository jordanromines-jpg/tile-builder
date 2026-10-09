/* Get your tiles (3.7): every tile the build takes, one row a shape and a chip a colour, with the finished build beside
   them. It opens before step 1 of a fresh build and again from "Tiles you need". When the family is short, it says how
   many more and offers Start anyway or Pick another (the short-of-tiles note of 7b, folded in). Nothing says buy.
   It sits over the stage only: the step panel stays above it, and any step move closes it. */
import { useEffect, useMemo } from "react";
import { SHAPES, type ShapeId } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { say } from "../../speech/say";
import { S } from "../../strings";
import { ArrowLeft, Check, Play } from "../../ui/icons";
import { missingTotal, type Missing } from "../../ui/kid/BuildBadge";
import { KidButton } from "../../ui/kid/KidButton";
import { ProjectPicture } from "../../ui/ProjectPicture";
import { TileChip } from "../../ui/TileChip";
import { allTiles } from "./stepTiles";

export interface TileListProps {
  project: Project;
  instead: Record<number, ShapeId>;
  leg: number;
  missing: Missing[];
  /** "start": before step 1, with Start; "look": opened while building, with Back to building */
  mode: "start" | "look";
  /** px of the screen covered by the top bar and the step panel: the list fits between them */
  inset: { top: number; bottom: number };
  onStart: () => void;
  onPick: () => void;
  onClose: () => void;
}

export function TileList({
  project,
  instead,
  leg,
  missing,
  mode,
  inset,
  onStart,
  onPick,
  onClose,
}: TileListProps) {
  const rows = useMemo(() => allTiles(project, instead), [project, instead]);
  const total = rows.reduce((n, r) => n + r.count, 0);
  const chips = rows.reduce((n, r) => n + r.tiles.length, 0);
  const size = chips > 12 ? "sm" : "md";
  const short = missing.length ? S.build.needTitle(missingTotal(missing)) : "";
  const line = short ? `${S.build.getTiles}. ${short}` : `${S.build.getTiles}.`;
  useEffect(() => say(line), [line]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="tiles-title"
      className="absolute inset-0 flex items-center justify-center bg-surface/70 px-24 max-[760px]:pl-4"
      style={{ paddingTop: inset.top, paddingBottom: inset.bottom }}
    >
      <div className="ts-tile-list soft flex max-h-full w-full max-w-3xl flex-col gap-4 rounded-lg bg-surface-2 p-6 shadow-xl">
        {/* the tiles scroll when there are many; the buttons stay in view */}
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto" role="region" aria-labelledby="tiles-title" tabIndex={0}>
          <div className="flex gap-6">
            {/* narrow (Split View): no room for the picture, the tiles come first */}
            <div className="h-[150px] w-[200px] shrink-0 overflow-hidden rounded-md max-[760px]:hidden">
              <ProjectPicture id={project.id} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h2
                id="tiles-title"
                className="font-display text-[length:var(--fs-kid-label-b)] font-semibold text-ink-1"
              >
                {S.build.getTiles}
              </h2>
              {rows.map((r) => (
                <ul
                  key={r.shape}
                  aria-label={SHAPES[r.shape].plural}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2"
                >
                  {r.tiles.map((t) => (
                    <li key={`${t.colour}-${t.instead}`}>
                      <TileChip
                        shape={t.shape}
                        colour={t.colour}
                        count={t.count}
                        size={size}
                        leg={leg}
                        instead={t.instead}
                        speak
                      />
                    </li>
                  ))}
                </ul>
              ))}
              <p className="font-kid text-[length:var(--fs-kid-label-c)] font-bold tabular-nums text-ink-2">
                {S.build.total(total)}
              </p>
            </div>
          </div>
          {short && (
            <div className="flex flex-col items-center gap-3 rounded-md bg-surface-3 p-4 text-center">
              <h3 className="font-display text-[length:var(--fs-kid-label-c)] font-semibold text-ink-1">
                {short}
              </h3>
              <ul
                className="flex flex-wrap justify-center gap-4"
                aria-label={short}
              >
                {missing.map((m) => (
                  <li key={m.shape}>
                    <TileChip
                      shape={m.shape}
                      count={m.count}
                      size="md"
                      leg={leg}
                      speak
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-4">
          {mode === "look" ? (
            <KidButton
              label={S.build.backToBuilding}
              icon={<Check size={36} weight="bold" />}
              tone="accent"
              onPress={onClose}
              speak
            />
          ) : short ? (
            <>
              <KidButton
                label={S.build.pickAnother}
                icon={<ArrowLeft size={36} weight="bold" />}
                onPress={onPick}
                speak
              />
              <KidButton
                label={S.build.startAnyway}
                icon={<Play size={36} weight="fill" />}
                tone="accent"
                onPress={onStart}
                speak
              />
            </>
          ) : (
            <KidButton
              label={S.build.start}
              icon={<Play size={36} weight="fill" />}
              tone="accent"
              primary
              onPress={onStart}
              sound="step"
              speak
            />
          )}
        </div>
      </div>
    </div>
  );
}
