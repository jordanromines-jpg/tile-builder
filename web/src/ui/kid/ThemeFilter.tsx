/* The theme filter (plan key 2o): a picture chip for each of the eight themes and one for all; it speaks the theme. */
import { THEMES, THEME_LABELS, type Theme } from "../../engine/themes";
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
    return (
      <button
        key={t ?? "all"}
        type="button"
        aria-pressed={value === t}
        aria-label={label}
        title={label}
        onClick={() => {
          say(label, { force: true });
          onChange(t);
        }}
        className="kid grid shrink-0 place-items-center rounded-full border-2 border-line bg-surface-2 text-ink-1 transition-transform duration-100 active:scale-95 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink"
        style={{ width: px, height: px }}
      >
        {t ? <ThemeIcon theme={t} size={px * 0.5} /> : <GridFour size={px * 0.5} weight="duotone" aria-hidden="true" />}
      </button>
    );
  };
  return (
    <div role="group" aria-label={S.kid.themes} className="flex gap-3 overflow-x-auto px-1 py-2">
      {chip(null)}
      {themes.map(chip)}
    </div>
  );
}
