// A route that is not built yet says its name, so the shell can be checked end to end.
export function Placeholder({ name }: { name: string }) {
  return (
    <main className="safe">
      <h1 className="font-display text-[length:var(--fs-parent-title)] font-semibold">{name}</h1>
    </main>
  );
}
