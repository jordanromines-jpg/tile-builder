/* The end of a build (plan keys 3c, 7h; sprint 2, change 9): the finished model while the view circles it once under a
   shower of little tiles, then a photo card of it. The project's own line is said aloud when the voice is on; then "Put the iPad down and play with what you made." and one button back to the shelf. No next project, no
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
import { TileConfetti } from "../ui/kid/TileConfetti";
import { ProjectPicture } from "../ui/ProjectPicture";
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
    say(project.done);
    return () => stop();
  }, [project]);

  if (!project) return <Navigate to="/" />;
  const instead = inv && Object.keys(inv.counts).length ? matchProject(project, inv).instead : {};

  return (
    <AgeProvider age={project.age}>
      <main className="kid relative h-dvh overflow-hidden bg-stage">
        <div className="absolute inset-0">
          <Viewer
            project={project}
            shown={project.placed.length}
            settled={project.placed.length}
            leg={effectiveLeg(inv)}
            instead={instead}
            sweep={celebrating}
            inset={{ top: 120, bottom: 230 }}
            label={S.build.model(project.title)}
          />
          {celebrating && <TileConfetti onDone={() => setCelebrating(false)} />}
        </div>
        <div className="safe-top pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4">
          <h1 className="soft rounded-full bg-surface-2 px-8 py-3 text-center font-display text-[length:var(--fs-kid-display-c)] font-bold leading-tight text-ink-1">
            {project.done}
          </h1>
        </div>
        {!celebrating && (
          <section
            className="photo-in soft absolute inset-x-4 mx-auto flex max-w-4xl items-center gap-6 rounded-[32px] bg-surface-2 p-4 pr-6"
            style={{ bottom: "max(env(safe-area-inset-bottom), 16px)" }}
          >
            <figure className="soft hidden w-[176px] shrink-0 -rotate-3 rounded-md bg-surface-2 p-2 pb-6 sm:block" aria-hidden="true">
              <span className="block h-[120px] w-[160px] overflow-hidden rounded-sm">
                <ProjectPicture project={project} />
              </span>
            </figure>
            <p className="min-w-0 flex-1 font-kid text-[length:var(--fs-kid-label-c)] font-bold leading-snug text-ink-1">{S.done.putDown}</p>
            <KidButton label={S.done.back} icon={<ArrowLeft size={36} weight="bold" />} tone="accent" primary onPress={() => void navigate({ to: "/" })} speak />
          </section>
        )}
      </main>
    </AgeProvider>
  );
}
