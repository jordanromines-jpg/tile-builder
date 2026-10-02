/* A project on the shelf (plan key 2o): its picture, its title, 1 to 3 stars drawn as tiles, and its build badge. The
   whole card is one tap: it goes straight into build mode (D18). */
import type { ReactNode } from "react";
import { S } from "../../strings";
import { TilePicture } from "../TileChip";
import { badgeText, BuildBadge, type BuildState, type Missing } from "./BuildBadge";

export interface ProjectCardProps {
  title: string;
  picture: ReactNode;
  stars: 1 | 2 | 3;
  /** left out when the family has not entered their tiles yet */
  state?: BuildState;
  missing?: Missing[];
  /** a saved step: the build is half done */
  resume?: number;
  onPress: () => void;
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="flex shrink-0 gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? "" : "opacity-25"}>
          <TilePicture shape="tri-equilateral" colour={i <= n ? "yellow" : undefined} px={26} />
        </span>
      ))}
    </span>
  );
}

export function ProjectCard({ title, picture, stars, state, missing = [], resume, onPress }: ProjectCardProps) {
  const label = [title, S.kid.stars(stars), state ? badgeText(state, missing) : "", resume ? `Step ${resume}` : ""].filter(Boolean).join(", ");
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className="kid lift soft group flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border-2 border-line bg-surface-2 text-left"
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-t-[26px] bg-stage">
        {picture}
        {resume ? (
          <span className="soft absolute left-3 top-3 rounded-full bg-accent px-4 py-1 font-kid text-[length:var(--fs-kid-label-c)] font-bold leading-tight text-accent-ink">
            {S.kid.step(resume, 0).split(" of")[0]}
          </span>
        ) : null}
      </span>
      <span className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <span className="flex items-start justify-between gap-2">
          <span className="font-display text-[28px] font-bold leading-tight text-ink-1">{title}</span>
          <Stars n={stars} />
        </span>
        {state && <BuildBadge state={state} missing={missing} />}
      </span>
    </button>
  );
}
