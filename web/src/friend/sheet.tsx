/* The tile friend's character sheet (gate G1): every pose at 200 and 64 px on a light and a dark ground, and a mock of
   the friend in the corner of the build screen's step panel. Shown on #/design. */
import type { ReactNode } from "react";
import { Friend, FRIEND_POSES } from "./Friend";

const POSE_NOTE: Record<string, string> = { idle: "waiting", read: "reads the step", point: "this tile here", think: "next step loading", cheer: "all done" };

function Ground({ dark, children }: { dark: boolean; children: ReactNode }) {
  return (
    <div className="rounded-lg p-5" style={{ background: dark ? "#1c1a24" : "#fff7ec", color: dark ? "#f6efe6" : "#2a2118" }}>
      {children}
    </div>
  );
}

function Strip({ dark }: { dark: boolean }) {
  return (
    <Ground dark={dark}>
      <p className="mb-2 text-[length:var(--fs-parent-small)] opacity-70">{dark ? "Dark ground" : "Light ground"}</p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        {FRIEND_POSES.map((p) => (
          <figure key={p} className="m-0 flex flex-col items-center gap-2">
            <Friend pose={p} size={200} />
            <div className="flex items-end gap-3">
              <Friend pose={p} size={64} />
              <Friend pose={p} size={40} />
            </div>
            <figcaption className="text-center text-[length:var(--fs-parent-small)]">
              <b>{p}</b>
              <br />
              {POSE_NOTE[p]}
            </figcaption>
          </figure>
        ))}
      </div>
    </Ground>
  );
}

function StepPanelMock({ dark }: { dark: boolean }) {
  return (
    <Ground dark={dark}>
      <div className="relative w-[360px] rounded-md p-4 pr-24" style={{ background: dark ? "#262330" : "#fff", border: `2px solid ${dark ? "#403a4c" : "#e8d6be"}` }}>
        <p className="m-0 font-display text-[22px] font-semibold">Step 3 of 8</p>
        <p className="m-0 mt-1 text-[20px]">Put a red square on the blue one.</p>
        <div className="mt-3 inline-block rounded-full px-5 py-2 text-[20px] font-semibold" style={{ background: dark ? "#ff9b45" : "#bf5409", color: dark ? "#1a120a" : "#fff" }}>
          Next
        </div>
        <div className="absolute -bottom-3 -right-2">
          <Friend pose="read" size={88} />
        </div>
      </div>
    </Ground>
  );
}

export function FriendSheet() {
  return (
    <div className="grid w-full gap-4">
      <Strip dark={false} />
      <Strip dark />
      <div className="flex flex-wrap gap-4">
        <StepPanelMock dark={false} />
        <StepPanelMock dark />
      </div>
    </div>
  );
}
