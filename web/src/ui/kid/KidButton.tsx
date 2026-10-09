/* The kid button (plan key 2o): a picture first, the label under it, big enough for the age (88/80/64 px, or 112 for
   the one main action), a 12 px hit slop, pressed within a frame, and with `speak` it says its label on tap. */
import type { ReactNode } from "react";
import { play, type SoundEvent } from "../../sound/sound";
import { say } from "../../speech/say";
import { ageVars, PRIMARY, useAge } from "./AgeContext";

export interface KidButtonProps {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  primary?: boolean;
  /** show the label under the picture (true) or keep it for screen readers only */
  showLabel?: boolean;
  speak?: boolean;
  /** what to say, when it differs from the label */
  sayText?: string;
  pressed?: boolean;
  disabled?: boolean;
  tone?: "accent" | "plain" | "soft";
  className?: string;
  /** the sound a press makes (3.0) */
  sound?: SoundEvent;
}

const TONE = {
  accent: "bg-accent text-accent-ink soft",
  plain: "bg-surface-2 text-ink-1 border-2 border-line soft",
  soft: "bg-accent-soft text-ink-1",
};

export function KidButton({ label, icon, onPress, primary, showLabel = true, speak, sayText, pressed, disabled, tone = "plain", className = "", sound = "tap" }: KidButtonProps) {
  const age = useAge();
  const v = ageVars(age);
  const size = primary ? `${PRIMARY}px` : v.target;
  return (
    <button
      type="button"
      aria-label={showLabel ? undefined : label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={() => {
        play(sound);
        if (speak) say(sayText ?? label);
        onPress();
      }}
      className={`ts-button ts-button-${tone}${primary ? " ts-button-primary" : ""} kid press relative inline-flex flex-col items-center justify-center gap-1 ${showLabel ? (primary ? "rounded-[32px]" : "rounded-[24px]") : "rounded-full"} px-4 py-2 font-kid font-bold disabled:opacity-40 aria-pressed:ring-4 aria-pressed:ring-focus ${TONE[tone]} ${className}`}
      style={{ minWidth: size, minHeight: size, fontSize: v.label, lineHeight: 1.1 }}
    >
      <span aria-hidden="true" className="absolute -inset-3" />
      {icon && <span aria-hidden="true" className="flex items-center justify-center">{icon}</span>}
      {showLabel && <span>{label}</span>}
    </button>
  );
}
