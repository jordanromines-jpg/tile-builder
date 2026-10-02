/* An empty place (plan key 2o): a picture and a line, which a tap on the picture says aloud. */
import { say } from "../../speech/say";
import { TilePicture } from "../TileChip";

export function EmptyState({ text, banner }: { text: string; banner?: boolean }) {
  if (banner)
    return (
      <div className="soft flex items-center gap-4 self-start rounded-[28px] bg-surface-2 py-2 pl-2 pr-6">
        <button type="button" aria-label={text} onClick={() => say(text)} className="kid press flex min-h-[88px] items-center gap-1 rounded-[22px] bg-surface-3 px-3">
          <TilePicture shape="square" colour="blue" px={44} />
          <TilePicture shape="tri-equilateral" colour="yellow" px={44} />
        </button>
        <p className="font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2">{text}</p>
      </div>
    );
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <button type="button" aria-label={text} onClick={() => say(text)} className="kid flex min-h-[104px] items-center gap-2 rounded-lg p-4">
        <TilePicture shape="square" px={64} />
        <TilePicture shape="tri-equilateral" px={64} />
      </button>
      <p className="max-w-md font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2">{text}</p>
    </div>
  );
}
