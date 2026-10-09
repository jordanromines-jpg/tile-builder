/* An empty place (plan key 2o): a picture and a line. With the voice on, a tap on the picture says the line. */
import { say, useVoiceOn } from "../../speech/say";
import { TilePicture } from "../TileChip";

export function EmptyState({ text, banner }: { text: string; banner?: boolean }) {
  // with the voice off a tap would say nothing: the picture is just a picture
  const voiceOn = useVoiceOn();
  if (banner)
    return (
      <div className="ts-empty ts-empty-banner soft flex items-center gap-4 self-start rounded-[28px] bg-surface-2 py-2 pl-2 pr-6">
        <Picture voiceOn={voiceOn} text={text} className="kid press flex min-h-[88px] items-center gap-1 rounded-[22px] bg-surface-3 px-3">
          <TilePicture shape="square" colour="blue" px={44} />
          <TilePicture shape="tri-equilateral" colour="yellow" px={44} />
        </Picture>
        <p className="font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2">{text}</p>
      </div>
    );
  return (
    <div className="ts-empty flex flex-col items-center gap-4 py-10 text-center">
      <Picture voiceOn={voiceOn} text={text} className="kid flex min-h-[104px] items-center gap-2 rounded-lg p-4">
        <TilePicture shape="square" px={64} />
        <TilePicture shape="tri-equilateral" px={64} />
      </Picture>
      <p className="max-w-md text-balance font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2">{text}</p>
    </div>
  );
}

function Picture({ voiceOn, text, className, children }: { voiceOn: boolean; text: string; className: string; children: React.ReactNode }) {
  if (!voiceOn)
    return (
      <span className={className} aria-hidden="true">
        {children}
      </span>
    );
  return (
    <button type="button" aria-label={text} onClick={() => say(text)} className={className}>
      {children}
    </button>
  );
}
