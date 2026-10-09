/* All steps (3.8): every step of the build at once, in the step panel's place. A slider to scrub through them, the
   model building and unbuilding in 3D as it moves (letting go keeps that step), and a filmstrip of little pictures,
   one a step, that follows the slider; a tap on a picture goes to that step. Build this step closes it. */
import { useEffect, useMemo, useRef } from "react";
import type { ShapeId } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { play } from "../../sound/sound";
import { S } from "../../strings";
import { ArrowLeft, Play } from "../../ui/icons";
import { KidButton } from "../../ui/kid/KidButton";
import { useStill } from "../../ui/motion";
import { drawProject, StepDrawing } from "../../ui/ProjectPicture";
import { shownAfter } from "./stepTiles";

export interface StepTrayProps {
  project: Project;
  leg: number;
  instead: Record<number, ShapeId>;
  /** the step being built */
  step: number;
  /** the step shown while choosing */
  preview: number;
  onPreview: (i: number) => void;
  onCommit: (i: number) => void;
  onClose: () => void;
}

export function StepTray({ project, leg, instead, step, preview, onPreview, onCommit, onClose }: StepTrayProps) {
  const still = useStill();
  const last = project.steps.length - 1;
  // the whole build drawn once; each picture shows the tiles placed by its step
  const { drawn, box } = useMemo(() => drawProject(project, project.placed.length, leg, instead), [project, leg, instead]);
  const strip = useRef<HTMLOListElement>(null);
  const ticked = useRef(0);

  // the picture of the step shown stays in the middle of the strip (set directly: scrollIntoView would also move the page)
  const first = useRef(true);
  useEffect(() => {
    const ol = strip.current;
    const card = ol?.children[preview] as HTMLElement | undefined;
    if (!ol || !card) return;
    const smooth = !still && !first.current;
    first.current = false;
    // a frame later, once the tray that just opened is laid out
    const f = requestAnimationFrame(() => ol.scrollTo({ left: card.offsetLeft - (ol.clientWidth - card.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" }));
    return () => cancelAnimationFrame(f);
  }, [preview, still]);

  const choose = (i: number) => {
    if (i === preview) return;
    // a soft tick a step as the slider moves, never faster than the ear can count
    const now = performance.now();
    if (now - ticked.current > 60) {
      play("tap");
      ticked.current = now;
    }
    onPreview(i);
  };
  const fill = last ? (preview / last) * 100 : 100;

  return (
    <div className="ts-tray flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <h2 className="sr-only">{S.build.allSteps}</h2>
        <p className="min-w-0 flex-1 font-display text-[length:var(--fs-kid-label-b)] font-semibold tabular-nums text-ink-1" aria-live="polite">
          {S.kid.step(preview + 1, last + 1)}
        </p>
        <KidButton label={S.build.closeSteps} showLabel={false} icon={<ArrowLeft size={36} weight="bold" />} onPress={onClose} speak />
        <KidButton label={S.build.buildThis} icon={<Play size={36} weight="fill" />} tone="accent" onPress={onClose} sound="step" speak className="ts-build-this" />
      </div>
      <input
        type="range"
        className="ts-slider w-full"
        min={0}
        max={last}
        step={1}
        value={preview}
        aria-label={S.build.chooseStep}
        aria-valuetext={S.kid.step(preview + 1, last + 1)}
        style={{ ["--fill" as string]: `${fill}%` }}
        onChange={(e) => choose(Number(e.currentTarget.value))}
        onPointerUp={(e) => onCommit(Number(e.currentTarget.value))}
        onKeyUp={(e) => onCommit(Number(e.currentTarget.value))}
        onBlur={(e) => onCommit(Number(e.currentTarget.value))}
      />
      <ol ref={strip} className="ts-filmstrip relative flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 pt-1" aria-label={S.build.allSteps}>
        {project.steps.map((st, i) => (
          <li key={i} className="shrink-0 snap-center" style={{ contentVisibility: "auto", containIntrinsicSize: "140px 136px" }}>
            <button
              type="button"
              className={`ts-step-card flex w-[140px] flex-col items-center gap-1 rounded-md bg-surface-3 p-1.5 ${i === preview ? "ring-4 ring-accent" : "ring-2 ring-line"}`}
              aria-label={S.kid.step(i + 1, last + 1)}
              aria-current={i === step ? "step" : undefined}
              onClick={() => {
                choose(i);
                onCommit(i);
              }}
            >
              <span className="block h-[96px] w-full overflow-hidden rounded-sm">
                <StepDrawing drawn={drawn} box={box} upto={shownAfter(project, i)} strong={new Set(st.tiles)} />
              </span>
              <span className="font-kid text-[15px] font-bold tabular-nums text-ink-2" aria-hidden="true">
                {S.build.stepNumber(i + 1)}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
