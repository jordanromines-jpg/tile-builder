/* Turn controls (plan key 2o): ◀ and ▶ turn the model a quarter, and "back to my side" resets it. */
import { S } from "../../strings";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight } from "../icons";
import { KidButton } from "./KidButton";

export function TurnControls({ onTurn, onReset, vertical }: { onTurn: (dir: -1 | 1) => void; onReset: () => void; vertical?: boolean }) {
  return (
    <div className={`flex items-center gap-6 ${vertical ? "flex-col" : ""}`} role="group" aria-label={S.kid.turnGroup}>
      <KidButton label={S.kid.turnLeft} showLabel={false} icon={<ArrowLeft size={36} weight="bold" />} onPress={() => onTurn(-1)} />
      <KidButton label={S.kid.mySide} showLabel={false} icon={<ArrowCounterClockwise size={36} weight="bold" />} onPress={onReset} />
      <KidButton label={S.kid.turnRight} showLabel={false} icon={<ArrowRight size={36} weight="bold" />} onPress={() => onTurn(1)} />
    </div>
  );
}
