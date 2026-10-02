/* The end of a build (plan keys 3c, 7h): the finished model, one short celebration, the project's own line said
   aloud, then "Put the iPad down and play with what you made." and one button back to the shelf. No next project, no
   "one more?". The saved step is cleared. */
import { Navigate, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { matchProject } from "../engine/match";
import { projectById } from "../projects";
import { say, stop } from "../speech/say";
import { clearStep } from "../store/db";
import { useInventory } from "../store/hooks";
import { effectiveLeg } from "../store/inventory";
import { S } from "../strings";
import { Viewer } from "../three/Viewer";
import { ArrowLeft } from "../ui/icons";
import { AgeProvider } from "../ui/kid/AgeContext";
import { Celebration } from "../ui/kid/Celebration";
import { KidButton } from "../ui/kid/KidButton";

export function Done() {
  const { pid } = useParams({ strict: false }) as { pid: string };
  const project = projectById(pid);
  const navigate = useNavigate();
  const inv = useInventory();
  const [celebrating, setCelebrating] = useState(true);

  useEffect(() => {
    if (!project) return;
    void clearStep(project.id);
    say(project.done, { force: true });
    return () => stop();
  }, [project]);

  if (!project) return <Navigate to="/" />;
  const instead = inv && Object.keys(inv.counts).length ? matchProject(project, inv).instead : {};

  return (
    <AgeProvider age={project.age}>
      <main className="kid flex h-dvh flex-col items-center gap-4 overflow-hidden px-4 pt-4" style={{ paddingBottom: "var(--edge-safe-kid)" }}>
        <h1 className="text-center font-display text-[length:var(--fs-kid-display-c)] font-semibold text-ink-1">{project.done}</h1>
        <div className="relative min-h-0 w-full max-w-5xl flex-1 overflow-hidden rounded-lg">
          <Viewer project={project} shown={project.placed.length} settled={project.placed.length} leg={effectiveLeg(inv)} instead={instead} label={S.build.model(project.title)} />
          {celebrating && (
            <div className="absolute inset-0 grid place-items-center">
              <Celebration onDone={() => setCelebrating(false)} size={240} />
            </div>
          )}
        </div>
        <p className="text-center font-kid text-[length:var(--fs-kid-label-c)] font-bold text-ink-2">{S.done.putDown}</p>
        <KidButton label={S.done.back} icon={<ArrowLeft size={36} weight="bold" />} tone="accent" onPress={() => void navigate({ to: "/" })} speak />
      </main>
    </AgeProvider>
  );
}
