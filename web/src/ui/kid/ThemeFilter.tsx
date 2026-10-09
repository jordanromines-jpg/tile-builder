/* The theme filter (plan key 2o): a picture chip for each theme and one for all; it speaks the theme. Since 3.1 each
   chip also shows one short word under its picture, for grown-ups and readers (the picture still comes first). */
import { THEMES, THEME_LABELS, THEME_SHORT, type Theme } from "../../engine/themes";
import { say } from "../../speech/say";
import { S } from "../../strings";
import { GridFour } from "../icons";
import { ThemeIcon } from "../ThemeIcon";
import { useAge, TARGET } from "./AgeContext";

export function ThemeFilter({ value, onChange, themes = THEMES }: { value: Theme | null; onChange: (t: Theme | null) => void; themes?: Theme[] }) {
  const age = useAge();
  const px = TARGET[age];
  const chip = (t: Theme | null) => {
    const label = t ? THEME_LABELS[t] : S.kid.all;
    const word = t ? THEME_SHORT[t] : S.kid.all;
    return (
      <button
        key={t ?? "all"}
        type="button"
        aria-pressed={value === t}
        aria-label={label}
        title={label}
        onClick={() => {
          say(label);
          onChange(t);
        }}
        className="ts-chip-wrap group kid flex shrink-0 flex-col items-center gap-1.5 transition-transform duration-(--spring-press-t) ease-(--spring-press) active:scale-95"
      >
        <span
          className="ts-chip grid place-items-center rounded-full border-2 border-line bg-surface-2 text-ink-1 group-aria-pressed:border-accent group-aria-pressed:bg-accent group-aria-pressed:text-accent-ink"
          style={{ width: px, height: px }}
        >
          {t ? <ThemeIcon theme={t} size={px * 0.5} /> : <GridFour size={px * 0.5} weight="duotone" aria-hidden="true" />}
        </span>
        <span aria-hidden="true" className="ts-chip-word font-kid text-[17px] font-bold leading-none text-ink-2 group-aria-pressed:text-ink-1">
          {word}
        </span>
      </button>
    );
  };
  return (
    <div role="group" aria-label={S.kid.themes} className="ts-chips flex gap-6 overflow-x-auto px-1 py-2">
      {chip(null)}
      {themes.map(chip)}
    </div>
  );
}
