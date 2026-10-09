/* Watch it build (4.1, Jordan: "an auto build mode that has a speed selector"): the step panel's place while the build
   plays itself. Pause or Play, how fast (Slow, Medium, Fast), the step being watched, and Build from here, which makes
   that step the child's own. Stop watching goes back to where the child was. */
import * as Rg from "@radix-ui/react-radio-group";
import { S } from "../../strings";
import { Pause, Play, PlayCircle, X } from "../../ui/icons";
import { ageVars, useAge } from "../../ui/kid/AgeContext";
import { KidButton } from "../../ui/kid/KidButton";
import { WATCH_SPEEDS, type WatchSpeed } from "./speeds";

export interface WatchBarProps {
  /** the step being watched, and how many there are */
  at: number;
  count: number;
  playing: boolean;
  speed: WatchSpeed;
  onPlay: () => void;
  onPause: () => void;
  onSpeed: (s: WatchSpeed) => void;
  onBuild: () => void;
  onClose: () => void;
}

export function WatchBar({ at, count, playing, speed, onPlay, onPause, onSpeed, onBuild, onClose }: WatchBarProps) {
  const v = ageVars(useAge());
  return (
    <div className="ts-watch flex flex-wrap items-center gap-x-5 gap-y-3 max-[760px]:gap-x-3">
      <h2 className="sr-only">{S.build.watch}</h2>
      <KidButton
        label={playing ? S.build.watchPause : S.build.watchPlay}
        showLabel={false}
        icon={playing ? <Pause size={40} weight="fill" /> : <PlayCircle size={44} weight="fill" />}
        tone="accent"
        className="ts-watch-toggle"
        onPress={playing ? onPause : onPlay}
        speak
      />
      <Rg.Root
        aria-label={S.build.watchSpeed}
        value={speed}
        onValueChange={(x) => onSpeed(x as WatchSpeed)}
        className="ts-watch-speeds flex items-center gap-2"
      >
        {WATCH_SPEEDS.map((k) => (
          <Rg.Item
            key={k}
            value={k}
            className="ts-watch-speed press rounded-full border-2 border-line bg-surface-3 px-5 font-kid font-bold text-ink-1 data-[state=checked]:border-accent data-[state=checked]:bg-accent-soft"
            style={{ minHeight: v.target, fontSize: v.label }}
          >
            {S.build.watchSpeeds[k]}
          </Rg.Item>
        ))}
      </Rg.Root>
      <p className="min-w-0 flex-1 whitespace-nowrap font-display text-[length:var(--fs-kid-label-b)] font-semibold tabular-nums text-ink-1 max-[760px]:order-first max-[760px]:basis-full">
        {S.kid.step(at + 1, count)}
      </p>
      <KidButton label={S.build.stopWatching} showLabel={false} icon={<X size={36} weight="bold" />} onPress={onClose} speak />
      <KidButton label={S.build.buildFromHere} icon={<Play size={36} weight="fill" />} primary tone="accent" onPress={onBuild} sound="step" speak className="ts-build-from-here" />
    </div>
  );
}
