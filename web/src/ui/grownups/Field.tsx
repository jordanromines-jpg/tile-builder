/* Fields (plan key 2q): labels tied by useId; an error is a sentence under the field with role=alert. A switch says its
   state in words beside it; radios are a Radix group. */
import * as Rg from "@radix-ui/react-radio-group";
import * as Sw from "@radix-ui/react-switch";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export function Field({ label, help, error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; help?: string; error?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || help ? `${id}-h` : undefined}
        className="min-h-11 rounded-md border-2 border-line bg-surface px-3 text-ink-1 aria-invalid:border-wait-ink"
        {...rest}
      />
      {(error || help) && (
        <p id={`${id}-h`} role={error ? "alert" : undefined} className={error ? "font-bold text-wait-ink" : "text-ink-2"}>
          {error || help}
        </p>
      )}
    </div>
  );
}

export function Switch({ label, on, onChange, help, words = ["On", "Off"] }: { label: string; on: boolean; onChange: (v: boolean) => void; help?: ReactNode; words?: [string, string] }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="flex flex-col">
        <span className="font-bold">{label}</span>
        {help && <span className="text-ink-2">{help}</span>}
      </label>
      <span className="flex items-center gap-3">
        <span className="text-ink-2" aria-hidden="true">
          {on ? words[0] : words[1]}
        </span>
        <Sw.Root
          id={id}
          checked={on}
          onCheckedChange={onChange}
          className="relative h-8 w-14 shrink-0 rounded-full border-2 border-line bg-surface-3 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
        >
          <Sw.Thumb className="block h-6 w-6 translate-x-0.5 rounded-full bg-surface-2 shadow transition-transform duration-(--spring-ui-t) ease-(--spring-ui) data-[state=checked]:translate-x-[26px]" />
        </Sw.Root>
      </span>
    </div>
  );
}

export function Radios<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  const base = useId();
  return (
    <Rg.Root aria-label={label} value={value} onValueChange={(v) => onChange(v as T)} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const id = `${base}-${o.value}`;
        return (
          <span key={o.value} className="flex items-center">
            <Rg.Item
              id={id}
              value={o.value}
              className="peer sr-only"
            />
            <label
              htmlFor={id}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-2 border-line bg-surface-2 px-4 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent-soft peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-focus"
            >
              {o.label}
            </label>
          </span>
        );
      })}
    </Rg.Root>
  );
}
