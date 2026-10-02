/* Missing tiles (plan key 7b): before the first step, over the model, "You need 2 more tiles for this one." with the
   tiles drawn, then Start anyway or Pick another. Nothing says buy. */
import { useEffect } from "react";
import { missingTotal, type Missing } from "../../ui/kid/BuildBadge";
import { say } from "../../speech/say";
import { S } from "../../strings";
import { KidButton } from "../../ui/kid/KidButton";
import { TileChip } from "../../ui/TileChip";
import { ArrowLeft, Play } from "../../ui/icons";

export function NeedNote({ missing, onStart, onPick }: { missing: Missing[]; onStart: () => void; onPick: () => void }) {
  const line = S.build.needTitle(missingTotal(missing));
  useEffect(() => say(line, { force: true }), [line]);
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="need-title" className="absolute inset-0 grid place-items-center bg-surface/70 p-4">
      <div className="flex max-w-xl flex-col items-center gap-5 rounded-lg bg-surface-2 p-6 text-center shadow-xl">
        <h2 id="need-title" className="font-display text-[length:var(--fs-kid-label-b)] font-semibold text-ink-1">
          {line}
        </h2>
        <ul className="flex flex-wrap justify-center gap-4">
          {missing.map((m) => (
            <li key={m.shape}>
              <TileChip shape={m.shape} count={m.count} size="md" speak />
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-center gap-4">
          <KidButton label={S.build.pickAnother} icon={<ArrowLeft size={36} weight="bold" />} onPress={onPick} speak />
          <KidButton label={S.build.startAnyway} icon={<Play size={36} weight="fill" />} tone="accent" onPress={onStart} speak />
        </div>
      </div>
    </div>
  );
}
