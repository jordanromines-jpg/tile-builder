/* A project that can't be had (3.6): it is in the catalogue, but its tiles were never kept on this iPad and there is no
   Wi-Fi. Before, the child was sent back to the shelf with no word. Now: a picture, the reason, Try again and Back. */
import { useNavigate } from "@tanstack/react-router";
import { S } from "../../strings";
import { ArrowCounterClockwise, ArrowLeft } from "../../ui/icons";
import { EmptyState } from "../../ui/kid/EmptyState";
import { KidButton } from "../../ui/kid/KidButton";

export function CantLoad({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <main className="ts-cant-load kid flex h-dvh flex-col items-center justify-center gap-6 bg-stage px-6">
      <h1 className="ts-title soft inline-block max-w-full truncate rounded-full bg-surface-2 px-6 py-2 font-display text-[length:var(--fs-kid-label-b)] font-bold text-ink-1">
        {title}
      </h1>
      <EmptyState text={S.kid.cantLoad} />
      <div className="flex gap-6">
        <KidButton label={S.done.back} icon={<ArrowLeft size={36} weight="bold" />} tone="plain" onPress={() => void navigate({ to: "/" })} speak />
        <KidButton label={S.kid.tryAgain} icon={<ArrowCounterClockwise size={36} weight="bold" />} tone="accent" primary onPress={() => location.reload()} speak />
      </div>
    </main>
  );
}
