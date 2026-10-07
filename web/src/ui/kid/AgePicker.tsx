/* The age picker (D19): five big pictures, 0–3, 3–5, 6–8, 9–10 and 11–16. 0–3 (2.5) is one small triangle; the others
   are stacks of one to four tiles. The choice is remembered on the iPad and only sets which shelf comes first. */
import { S } from "../../strings";
import { TilePicture } from "../TileChip";
import { AGES, type Age } from "./AgeContext";
import { say } from "../../speech/say";

const COLOURS = ["yellow", "green", "blue", "red"] as const;

const TILES: Record<Age, number> = { t: 0, a: 1, b: 2, c: 3, d: 4 };

function Stack({ n }: { n: number }) {
  if (n === 0)
    return (
      <span aria-hidden="true">
        <TilePicture shape="tri-equilateral" colour="purple" px={26} />
      </span>
    );
  return (
    <span className="flex flex-col-reverse items-center" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="-mt-1">
          <TilePicture shape="square" colour={COLOURS[i]} px={n > 3 ? 24 : 30} />
        </span>
      ))}
    </span>
  );
}

export function AgePicker({ value, onChange }: { value: Age | null; onChange: (a: Age) => void }) {
  return (
    <div role="group" aria-label={S.kid.pickAge} className="flex flex-wrap gap-4">
      {AGES.map((a) => (
        <button
          key={a}
          type="button"
          aria-pressed={value === a}
          aria-label={S.kid.ages[a]}
          onClick={() => {
            say(S.kid.ages[a]);
            onChange(a);
          }}
          className="kid flex min-h-[88px] min-w-[104px] items-end justify-center gap-3 rounded-lg border-2 border-line bg-surface-2 px-3 py-2 font-display font-semibold text-ink-1 transition-transform duration-100 active:scale-95 aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:ring-4 aria-pressed:ring-focus"
          style={{ fontSize: "var(--fs-kid-label-b)" }}
        >
          <Stack n={TILES[a]} />
          <span aria-hidden="true">{S.kid.agesShort[a]}</span>
        </button>
      ))}
    </div>
  );
}
