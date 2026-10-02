/* Turn controls (plan key 2o): ◀ and ▶ turn the model a quarter, and "back to my side" resets it. */
import { S } from "../../strings";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight } from "../icons";
import { KidButton } from "./KidButton";

export function TurnControls({ onTurn, onReset }: { onTurn: (dir: -1 | 1) => void; onReset: () => void }) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label="Turn the model">
      <KidButton label={S.kid.turnLeft} showLabel={false} icon={<ArrowLeft size={36} weight="bold" />} onPress={() => onTurn(-1)} />
      <KidButton label={S.kid.mySide} showLabel={false} icon={<ArrowCounterClockwise size={36} weight="bold" />} onPress={onReset} />
      <KidButton label={S.kid.turnRight} showLabel={false} icon={<ArrowRight size={36} weight="bold" />} onPress={() => onTurn(1)} />
    </div>
  );
}
