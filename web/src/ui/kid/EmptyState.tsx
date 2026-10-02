/* An empty place (plan key 2o): a picture and a line, which a tap on the picture says aloud. */
import { say } from "../../speech/say";
import { TilePicture } from "../TileChip";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <button type="button" aria-label={text} onClick={() => say(text, { force: true })} className="kid flex min-h-[104px] items-center gap-2 rounded-lg p-4">
        <TilePicture shape="square" px={64} />
        <TilePicture shape="tri-equilateral" px={64} />
      </button>
      <p className="max-w-md font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2">{text}</p>
    </div>
  );
}
