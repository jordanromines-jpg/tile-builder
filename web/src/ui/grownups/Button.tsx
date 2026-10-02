/* The grown-ups' button (plan key 2q), from web-agent's: lit (one a screen), line, quiet, danger; 44 px tall; told apart
   by fill and edge as well as colour. */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonKind = "lit" | "line" | "quiet" | "danger";

const KIND: Record<ButtonKind, string> = {
  lit: "bg-accent text-accent-ink border-2 border-accent",
  line: "bg-surface-2 text-ink-1 border-2 border-line",
  quiet: "bg-transparent text-ink-1 border-2 border-transparent underline underline-offset-4",
  danger: "bg-surface-2 text-wait-ink border-2 border-wait-ink",
};

export function Button({ kind = "line", className = "", children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: ButtonKind; children?: ReactNode }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 font-parent font-bold transition-transform duration-100 active:scale-[0.98] disabled:opacity-40 ${KIND[kind]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
