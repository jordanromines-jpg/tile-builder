/* The design page's viewer row (plan key 6d): the castle at any step, with the controls of each age. */
import { useMemo, useState } from "react";
import { DEFAULT_LEG } from "../../engine/catalog";
import type { Age } from "../../engine/types";
import { castle } from "../../projects/castle";
import { Viewer } from "../../three/Viewer";
import { AgeProvider, AGES } from "../../ui/kid/AgeContext";
import { TurnControls } from "../../ui/kid/TurnControls";
import { Row } from "./Row";

export function ViewerRow({ paint }: { paint: number }) {
  const [age, setAge] = useState<Age>("a");
  const [step, setStep] = useState(castle.steps.length - 1);
  const [turns, setTurns] = useState(0);
  const project = useMemo(() => ({ ...castle, age }), [age]);
  const shown = castle.steps.slice(0, step + 1).reduce((n, s) => n + s.tiles.length, 0);
  return (
    <Row title="3D viewer" note="The castle at any step. 3–5: still, quarter turns by button. 6–8: buttons and drag. 9–10: free, turning slowly until touched.">
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Viewer age" className="flex gap-2">
            {AGES.map((a) => (
              <button key={a} type="button" aria-pressed={age === a} onClick={() => setAge(a)} className="min-h-11 rounded-md border border-line px-4 aria-pressed:bg-accent aria-pressed:text-accent-ink">
                {a}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2">
            Step
            <input type="range" min={0} max={castle.steps.length - 1} value={step} onChange={(e) => setStep(Number(e.target.value))} className="w-48" />
            <span className="tabular-nums">{step + 1}</span>
          </label>
        </div>
        <div className="h-[420px] overflow-hidden rounded-lg">
          <Viewer key={age} project={project} shown={shown} leg={DEFAULT_LEG} current={castle.steps[step].tiles} settled={shown} turns={turns} stepKey={step} paint={paint} label="The castle in 3D" />
        </div>
        <AgeProvider age={age}>
          <TurnControls onTurn={(d) => setTurns((t) => t + d)} onReset={() => setTurns(0)} />
        </AgeProvider>
      </div>
    </Row>
  );
}
