/* The first thing on the Library (3.1): the build in progress ("Keep building", with the step reached), or one the
   family can build now ("Try this one"). A big picture, the title large, one big button; the whole card is one tap,
   like every card (D18). */
import type { ReactNode } from "react";
import { Decor } from "../../looks/decor";
import { play } from "../../sound/sound";
import { S } from "../../strings";
import { Play } from "../icons";
import { Stars } from "./ProjectCard";

export function HeroCard({ kind, title, picture, stars, step, onPress }: { kind: "resume" | "suggest"; title: string; picture: ReactNode; stars: 1 | 2 | 3; step?: number; onPress: () => void }) {
  const eyebrow = kind === "resume" ? S.library.keepBuilding : S.library.tryThis;
  const action = kind === "resume" ? S.library.keepGoing : S.library.start;
  const label = [eyebrow, title, step ? `Step ${step}` : "", action].filter(Boolean).join(", ");
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        play("tap");
        onPress();
      }}
      className="ts-hero kid lift soft relative flex w-full items-stretch overflow-hidden rounded-[32px] border-2 border-line bg-surface-2 text-left"
    >
      <span className="ts-hero-picture relative block aspect-[4/3] w-[44%] max-w-[480px] shrink-0 overflow-hidden bg-stage">
        {picture}
        <Decor at="card" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-6">
        <span className="ts-hero-eyebrow font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2">{eyebrow}</span>
        <span className="ts-hero-title font-display text-[length:var(--fs-kid-display-c)] font-bold leading-[1.05] text-ink-1 [text-wrap:balance]">{title}</span>
        <span className="flex flex-wrap items-center gap-4">
          <Stars n={stars} />
          {step ? <span className="ts-resume rounded-full bg-accent-soft px-4 py-1 font-kid text-[20px] font-bold text-ink-1">Step {step}</span> : null}
        </span>
        <span className="ts-button ts-button-accent ts-button-primary soft mt-2 inline-flex min-h-[72px] items-center gap-3 self-start rounded-[24px] bg-accent px-6 font-kid text-[length:var(--fs-kid-label-c)] font-bold text-accent-ink" aria-hidden="true">
          <Play size={32} weight="fill" />
          {action}
        </span>
      </span>
    </button>
  );
}
