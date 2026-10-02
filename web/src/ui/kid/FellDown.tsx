/* "It fell down" (plan key 7d; child-development.md, "When a build falls down"): a calm sheet, no sound, no red, no
   score. "Towers fall sometimes. Builders fix them." with Go back one step and Start this layer again; after two falls
   on the same step it also asks a grown-up to hold it. */
import * as D from "@radix-ui/react-dialog";
import { S } from "../../strings";
import { ArrowCounterClockwise, ArrowLeft } from "../icons";
import { KidButton } from "./KidButton";

export interface FallState {
  step: number;
  falls: number;
}

/** Count falls on the same step; a new step starts the count again. */
export function fell(prev: FallState, step: number): FallState {
  return prev.step === step ? { step, falls: prev.falls + 1 } : { step, falls: 1 };
}

export function fellLines(state: FallState): string[] {
  return state.falls >= 2 ? [S.build.fell, S.build.fellGrownup] : [S.build.fell];
}

/** The first step that builds on the same layer as this one: "start this layer again". */
export function layerStart(stepLayers: number[], step: number): number {
  let s = step;
  while (s > 0 && stepLayers[s - 1] === stepLayers[step]) s--;
  return s;
}

export function FellDown({ open, onOpenChange, state, onBack, onLayer, canBack }: { open: boolean; onOpenChange: (o: boolean) => void; state: FallState; onBack: () => void; onLayer: () => void; canBack: boolean }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <D.Content className="kid fixed bottom-1/2 left-1/2 z-50 flex w-[min(640px,calc(100vw-32px))] -translate-x-1/2 translate-y-1/2 flex-col gap-6 rounded-lg bg-surface-2 p-8 text-ink-1 shadow-2xl">
          <D.Title className="font-display text-[length:var(--fs-kid-label-b)] font-semibold">{S.build.fell}</D.Title>
          <D.Description className={state.falls >= 2 ? "font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2" : "sr-only"}>
            {state.falls >= 2 ? S.build.fellGrownup : S.build.fell}
          </D.Description>
          <div className="flex flex-wrap gap-4">
            <KidButton label={S.build.backOne} icon={<ArrowLeft size={36} weight="bold" />} onPress={onBack} disabled={!canBack} speak />
            <KidButton label={S.build.layerAgain} icon={<ArrowCounterClockwise size={36} weight="bold" />} onPress={onLayer} speak />
          </div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
