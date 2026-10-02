/* The kid bar (plan key 2o): fixed places along the top, never the bottom edge. Back to the shelf at the left, Hear
   again beside it, the grown-ups door at the right. Each part is optional. */
import type { ReactNode } from "react";
import { S } from "../../strings";
import { ArrowLeft } from "../icons";
import { GrownUpsDoor } from "./GrownUpsDoor";
import { KidButton } from "./KidButton";

export function KidBar({ onBack, hear, door = true, title }: { onBack?: () => void; hear?: ReactNode; door?: boolean; title?: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      {onBack && <KidButton label={S.kid.back} showLabel={false} icon={<ArrowLeft size={40} weight="bold" />} onPress={onBack} speak />}
      {hear}
      <div className="min-w-0 flex-1">{title}</div>
      {door && <GrownUpsDoor />}
    </div>
  );
}
