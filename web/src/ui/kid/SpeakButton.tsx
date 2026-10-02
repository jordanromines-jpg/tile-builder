/* "Hear again": repeats the last line said, even when the voice is off (a child asked). */
import { lastLine, say, useLastLine } from "../../speech/say";
import { S } from "../../strings";
import { SpeakerHigh } from "../icons";
import { KidButton } from "./KidButton";

export function SpeakButton({ text, showLabel = false }: { text?: string; showLabel?: boolean }) {
  const line = useLastLine();
  return (
    <KidButton
      label={S.kid.hearAgain}
      showLabel={showLabel}
      icon={<SpeakerHigh size={40} weight="bold" />}
      disabled={!text && !line}
      onPress={() => say(text ?? lastLine(), { force: true })}
    />
  );
}
