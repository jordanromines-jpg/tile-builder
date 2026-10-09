/* The end of a build (plan keys 3c, 7h; sprint 2, change 9): the finished model while the view circles it once under a
   shower of little tiles, then a photo card of it. The project's own line is said aloud when the voice is on; then "Put the iPad down and play with what you made." and one button back to the shelf. No next project, no
   "one more?". The saved step is cleared. */
import { Navigate, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pip } from "../friend/Pip";
import { Decor } from "../looks/decor";
import { play } from "../sound/sound";
import { matchProject } from "../engine/match";
import { infoById, useProject } from "../projects/load";
import { CantLoad } from "./build/CantLoad";
import { say, stop } from "../speech/say";
import { clearStep } from "../store/db";
import { useInventory } from "../store/hooks";
import { effectiveLeg } from "../store/inventory";
import { S } from "../strings";
import { Viewer } from "../three/Viewer";
import { loadRun } from "../three/run/load";
import { player } from "../three/run/playback";
import type { RunPlay } from "../three/run/RunStage";
import { ArrowLeft, Play } from "../ui/icons";
import { AgeProvider } from "../ui/kid/AgeContext";
import { TapToSkip } from "../ui/kid/TapToSkip";
import { useStill } from "../ui/motion";
import { ProjectPicture } from "../ui/ProjectPicture";
import { KidButton } from "../ui/kid/KidButton";
import { SpeakButton } from "../ui/kid/SpeakButton";

export function Done() {
  const { pid } = useParams({ strict: false }) as { pid: string };
  const watched = useSearch({ strict: false }).watched === 1;
  const project = useProject(pid);
  const navigate = useNavigate();
  const inv = useInventory();
  const [celebrating, setCelebrating] = useState(true);
  // the little tiles stay where they landed when the celebration ends; a tap that skips it sweeps them away
  const [skipped, setSkipped] = useState(false);
  const still = useStill();
  // a Monster-truck build (4.0c): once the party is over, the Pip truck drives the course and crashes it; the words
  // come after the run (straight away if it can't be played: offline before it was ever kept, or an older iPad)
  const truck = !!project && project !== "unreachable" && project.theme === "trucks" && !!project.course;
  const [run, setRun] = useState<RunPlay | null>(null);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    if (!project || project === "unreachable") return;
    // a build watched to its end (4.1) was not built: the child keeps their place
    if (!watched) void clearStep(project.id);
    play("finish");
    say(project.done);
    return () => stop();
  }, [project, watched]);

  useEffect(() => {
    if (!truck || celebrating) return;
    let gone = false;
    loadRun(project.id)
      .then((rec) => !gone && setRun({ player: player(rec), startedAt: performance.now(), still, onEnd: () => setRan(true) }))
      .catch(() => !gone && setRan(true));
    return () => {
      gone = true;
    };
  }, [truck, celebrating, project, still]);
  const again = () => {
    if (!run) return;
    setRan(false);
    setRun({ ...run, startedAt: performance.now() });
  };
  const panel = !celebrating && (!truck || ran);

  if (project === null) return <Navigate to="/" />;
  if (project === "unreachable") return <CantLoad title={infoById(pid)?.title ?? pid} />;
  if (!project) return <main className="h-dvh bg-stage" aria-busy="true" />;
  const instead = inv && Object.keys(inv.counts).length ? matchProject(project, inv).instead : {};

  return (
    <AgeProvider age={project.age}>
      <main className="ts-done kid relative h-dvh overflow-hidden bg-stage">
        <div className="absolute inset-0">
          <Viewer
            project={project}
            shown={project.placed.length}
            settled={project.placed.length}
            leg={effectiveLeg(inv)}
            instead={instead}
            sweep={celebrating}
            falling={!truck && !still && !skipped}
            run={run ?? undefined}
            spin={false}
            inset={{ top: 120, bottom: 230 }}
            label={S.build.model(project.title)}
          />
          {celebrating && (
            <TapToSkip
              still={still}
              onDone={() => setCelebrating(false)}
              onSkip={() => {
                setSkipped(true);
                setCelebrating(false);
              }}
            />
          )}
        </div>
        {/* Pip cheers (3.1): in the corner while the tiles shower, then on the panel's top edge (3.6: standing over it in
            portrait, Pip covered the panel's photo) */}
        {celebrating && <Pip pose="cheer" size={180} className="absolute bottom-6 left-6 z-[1]" />}
        <div className="safe-top pointer-events-none absolute inset-x-0 top-0 flex items-start justify-center gap-4 px-4">
          <span className="pointer-events-auto">
            <SpeakButton text={`${project.done} ${S.done.putDown}`} />
          </span>
          <h1 className="ts-finish-words relative soft rounded-full bg-surface-2 px-8 py-3 text-center font-display text-[length:var(--fs-kid-display-c)] font-bold leading-tight text-ink-1">
            <Decor at="finish" />
            <span className="relative">{project.done}</span>
          </h1>
        </div>
        {panel && (
          <section
            className="ts-panel photo-in soft absolute inset-x-4 mx-auto flex max-w-4xl flex-wrap items-center gap-6 rounded-[32px] bg-surface-2 p-4 pr-6 max-[760px]:flex-wrap max-[760px]:gap-3 max-[760px]:pr-4"
            style={{ bottom: "max(env(safe-area-inset-bottom), 16px)" }}
          >
            <Pip pose="cheer" size={150} className="absolute -top-[132px] left-6" />
            <figure className="soft hidden w-[176px] shrink-0 -rotate-3 rounded-md bg-surface-2 p-2 pb-6 sm:block" aria-hidden="true">
              <span className="block h-[120px] w-[160px] overflow-hidden rounded-sm">
                <ProjectPicture project={project} />
              </span>
            </figure>
            <p className="min-w-[13rem] flex-1 font-kid text-[length:var(--fs-kid-label-c)] font-bold leading-snug text-ink-1 max-[760px]:basis-full">{S.done.putDown}</p>
            {/* a truck's run again beside the way back; under the words when there isn't room for both */}
            <div className="ml-auto flex flex-wrap justify-end gap-3">
              {run && !still && <KidButton label={S.done.runAgain} icon={<Play size={36} weight="fill" />} tone="accent" onPress={again} speak className="ts-run-again" />}
              <KidButton label={S.done.back} icon={<ArrowLeft size={36} weight="bold" />} tone="accent" primary onPress={() => void navigate({ to: "/" })} speak />
            </div>
          </section>
        )}
      </main>
    </AgeProvider>
  );
}
