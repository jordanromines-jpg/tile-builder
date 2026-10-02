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
  state: BuildState;
  missing?: Missing[];
  /** a saved step: the build is half done */
  resume?: number;
  onPress: () => void;
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? "" : "opacity-25"}>
          <TilePicture shape="tri-equilateral" colour={i <= n ? "yellow" : undefined} px={22} />
        </span>
      ))}
    </span>
  );
}

export function ProjectCard({ title, picture, stars, state, missing = [], resume, onPress }: ProjectCardProps) {
  const label = [title, S.kid.stars(stars), badgeText(state, missing), resume ? `Step ${resume}` : ""].filter(Boolean).join(", ");
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className="kid group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border-2 border-line bg-surface-2 text-left transition-transform duration-100 active:scale-[0.97]"
    >
      <span className="relative block aspect-[4/3] w-full bg-surface-3">
        {picture}
        {resume ? (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-3 py-0.5 font-kid text-[17px] font-bold text-accent-ink">
            {S.kid.step(resume, 0).split(" of")[0]}
          </span>
        ) : null}
      </span>
      <span className="flex flex-col gap-2 p-3">
        <span className="flex items-start justify-between gap-2">
          <span className="font-display text-[26px] font-semibold leading-tight text-ink-1">{title}</span>
          <Stars n={stars} />
        </span>
        <BuildBadge state={state} missing={missing} />
      </span>
    </button>
  );
}
